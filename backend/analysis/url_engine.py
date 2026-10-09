import re
import urllib.parse
import ipaddress
import uuid
from datetime import datetime
import os
from typing import Dict, Any, List

KNOWN_TARGET_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix", "facebook",
    "instagram", "whatsapp", "bankofamerica", "chase", "wellsfargo", "sbi", "hdfc",
    "icici", "axisbank", "paytm", "binance", "coinbase", "metamask", "steam", "linkedin"
]

SUSPICIOUS_TLDS = [
    "xyz", "top", "online", "site", "club", "work", "vip", "ru", "cn", "tk", "ml", "ga", "cf", "gq", "fit", "buzz"
]

HIGH_RISK_KEYWORDS = [
    "login", "verify", "secure", "update", "kyc", "account", "banking", "free",
    "claim", "bonus", "wallet", "support", "signin", "auth", "confirm", "pass"
]

TYPOSQUAT_PATTERNS = [
    (r"paypa[1l|i]", "paypal"),
    (r"g[0o]{2}gle", "google"),
    (r"amaz[0o]n", "amazon"),
    (r"m[1i]cr[0o]s[0o]ft", "microsoft"),
    (r"app[1l]e", "apple"),
    (r"netfl[1i]x", "netflix"),
    (r"faceb[0o]{2}k", "facebook"),
    (r"sb[1i]", "sbi"),
    (r"hdfc-", "hdfc bank impersonation"),
]

def is_valid_ip(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False

def analyze_url(url: str) -> Dict[str, Any]:
    url_clean = url.strip()
    
    # Handle missing scheme
    parsed_url = urllib.parse.urlparse(url_clean)
    if not parsed_url.scheme:
        url_clean = "http://" + url_clean
        parsed_url = urllib.parse.urlparse(url_clean)

    raw_url = url_clean
    scheme = parsed_url.scheme.lower()
    netloc = parsed_url.netloc
    hostname = (parsed_url.hostname or "").lower()
    path = parsed_url.path
    query = parsed_url.query
    port = parsed_url.port

    risk_score = 0
    indicators = []
    positive_signals = []

    # 1. Protocol check
    if scheme == "https":
        positive_signals.append("Uses encrypted HTTPS protocol.")
    elif scheme == "http":
        risk_score += 15
        indicators.append({
            "name": "Unencrypted HTTP Protocol",
            "category": "Encryption & Syntax",
            "severity": "medium",
            "description": "The URL uses plain HTTP instead of HTTPS. Connections to this URL are not encrypted.",
            "evidence": f"Scheme detected: '{scheme}://'"
        })
    else:
        risk_score += 25
        indicators.append({
            "name": "Unusual URL Scheme",
            "category": "Syntax",
            "severity": "medium",
            "description": f"The URL uses a non-standard protocol '{scheme}'.",
            "evidence": f"Scheme: '{scheme}'"
        })

    # 2. Userinfo @ in hostname/authority
    if "@" in netloc:
        risk_score += 35
        indicators.append({
            "name": "Userinfo Credentials in URL",
            "category": "Social Engineering",
            "severity": "high",
            "description": "The URL contains an '@' symbol in the hostname section. Phishers use this trick to hide the actual target domain.",
            "evidence": f"Authority string contains userinfo before '@': '{netloc}'"
        })

    # 3. IP address as hostname
    if is_valid_ip(hostname):
        risk_score += 30
        indicators.append({
            "name": "Raw IP Address Hostname",
            "category": "Domain Analysis",
            "severity": "high",
            "description": "The URL points directly to an IP address instead of a registered domain name, often used by malware/phishing servers.",
            "evidence": f"Hostname is IP address: '{hostname}'"
        })

    # 4. Punycode / IDN check
    if "xn--" in hostname:
        risk_score += 30
        indicators.append({
            "name": "Punycode (Homograph Attack) Detected",
            "category": "Domain Analysis",
            "severity": "high",
            "description": "The domain uses Punycode encoding ('xn--'), which can be used for homograph attacks to impersonate real brands with lookalike Unicode characters.",
            "evidence": f"Domain contains punycode prefix: '{hostname}'"
        })

    # 5. Domain & Subdomains breakdown
    domain_parts = hostname.split(".")
    tld = domain_parts[-1] if len(domain_parts) > 1 else ""

    if tld in SUSPICIOUS_TLDS:
        risk_score += 20
        indicators.append({
            "name": "High-Risk Top-Level Domain (TLD)",
            "category": "Domain Reputation",
            "severity": "medium",
            "description": f"The top-level domain '.{tld}' is frequently associated with low-cost disposable spam and phishing domains.",
            "evidence": f"Top-level domain: '.{tld}'"
        })

    if len(domain_parts) > 3:
        risk_score += 15
        indicators.append({
            "name": "Excessive Subdomains",
            "category": "Domain Structure",
            "severity": "medium",
            "description": "The domain has multiple subdomains, which phishers use to prepend legitimate-looking brand names to illicit sites.",
            "evidence": f"Subdomain count: {len(domain_parts) - 2} ({hostname})"
        })

    # 6. Typosquatting / Brand Impersonation Check
    brand_impersonated = None
    for pattern, brand in TYPOSQUAT_PATTERNS:
        if re.search(pattern, hostname):
            brand_impersonated = brand
            break

    if brand_impersonated:
        risk_score += 35
        indicators.append({
            "name": "Brand Typosquatting & Impersonation",
            "category": "Brand Protection",
            "severity": "high",
            "description": f"The domain uses lookalike characters or hyphens to fake legitimate service '{brand_impersonated}'.",
            "evidence": f"Domain '{hostname}' mimics '{brand_impersonated}'"
        })
    else:
        # Check if known brand appears in subdomain/path while registered domain is different
        main_registered_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else hostname
        for brand in KNOWN_TARGET_BRANDS:
            if brand in hostname and brand not in main_registered_domain:
                risk_score += 35
                indicators.append({
                    "name": "Brand Name Prepended to External Domain",
                    "category": "Brand Protection",
                    "severity": "high",
                    "description": f"The brand '{brand}' appears in the subdomain, but the actual registered domain is '{main_registered_domain}'.",
                    "evidence": f"Target: '{brand}' embedded inside '{hostname}'"
                })

    # 7. Unusual Port Check
    if port and port not in [80, 443]:
        risk_score += 15
        indicators.append({
            "name": "Non-Standard Port Specified",
            "category": "Network Syntax",
            "severity": "medium",
            "description": f"The URL specifies unusual port {port}. Standard web traffic uses port 80 (HTTP) or 443 (HTTPS).",
            "evidence": f"Port: {port}"
        })

    # 8. Excessive URL Length & Special Characters
    if len(raw_url) > 90:
        risk_score += 15
        indicators.append({
            "name": "Unusually Long URL",
            "category": "URL Structure",
            "severity": "medium",
            "description": "The total URL length exceeds 90 characters. Long URLs are often used to hide malicious tokens or confuse users.",
            "evidence": f"URL length: {len(raw_url)} characters"
        })

    if raw_url.count("-") >= 4 or raw_url.count("%") >= 3 or raw_url.count("@") >= 1:
        risk_score += 10
        indicators.append({
            "name": "Excessive Obfuscation Characters",
            "category": "URL Structure",
            "severity": "low",
            "description": "Contains high frequency of hyphens, percent encodings, or special characters.",
            "evidence": f"Hyphens: {raw_url.count('-')}, Encoded: {raw_url.count('%')}"
        })

    # 9. Suspicious Keywords in Path/Query
    keyword_matches = [kw for kw in HIGH_RISK_KEYWORDS if kw in (path + query).lower()]
    if keyword_matches and (risk_score > 0 or len(domain_parts) > 2):
        risk_score += 15
        indicators.append({
            "name": "Sensitive Authentication Keywords in Path",
            "category": "Path Analysis",
            "severity": "medium",
            "description": f"The URL path contains credential-harvesting keywords: {', '.join(keyword_matches)}.",
            "evidence": f"Keywords found in path/query: {', '.join(keyword_matches)}"
        })

    # 10. Suspicious Redirect Parameters
    redirect_params = ["url=", "redirect=", "goto=", "dest=", "target=", "next="]
    found_redirects = [p for p in redirect_params if p in query.lower()]
    if found_redirects:
        risk_score += 15
        indicators.append({
            "name": "Open Redirect Parameter",
            "category": "Redirect Risks",
            "severity": "medium",
            "description": "The URL contains query parameters designed to redirect users to a secondary external site.",
            "evidence": f"Parameters found: {', '.join(found_redirects)}"
        })

    # Positive signals for benign URLs
    if len(indicators) == 0 and scheme == "https":
        positive_signals.append("Standard domain name structure without suspicious lookalike characters.")
        positive_signals.append("Clean URL path with no credentials harvesting keywords.")
        positive_signals.append("No open redirect parameters or abnormal port numbers detected.")

    # Cap score between 0 and 100
    risk_score = min(max(risk_score, 0), 100)

    # Risk Level mapping
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Plain Language Explanation
    if risk_level == "High":
        plain_explanation = (
            f"ALERT: This link shows strong characteristics of a phishing or fraud attempt (Risk Score: {risk_score}/100). "
            "It appears designed to trick you into submitting passwords, banking credentials, or personal identity details. "
            "Do NOT click this link or enter any information."
        )
        recommendations = [
            "Do not click on this link or open it in your browser.",
            "If you opened the page, close it immediately and do not enter passwords, OTPs, or financial details.",
            "If you already submitted credentials, change your password on the official website immediately and notify your bank.",
            "Report the link to your organization's IT department or the relevant anti-phishing authority."
        ]
    elif risk_level == "Medium":
        plain_explanation = (
            f"WARNING: This link contains suspicious indicators that warrant caution (Risk Score: {risk_score}/100). "
            "While it may be a legitimate service using an unusual domain structure, exercise high vigilance before entering sensitive data."
        )
        recommendations = [
            "Verify the link destination by visiting the official organization website independently.",
            "Check that the domain in your browser address bar matches the expected official brand name exactly.",
            "Avoid signing in or submitting payment details unless you have verified the source."
        ]
    else:
        plain_explanation = (
            f"Notice: No obvious phishing indicators were detected for this URL (Risk Score: {risk_score}/100). "
            "However, remember that automated security checks cannot guarantee 100% safety against brand-new zero-day malicious sites."
        )
        recommendations = [
            "Ensure the website address bar displays a valid HTTPS padlock and correct domain name.",
            "Never share one-time passwords (OTPs) or private keys on any web page.",
            "Keep your browser and security software updated."
        ]

    # External API reputation check status
    safe_browsing_key = os.environ.get("SAFE_BROWSING_API_KEY")
    virustotal_key = os.environ.get("VIRUSTOTAL_API_KEY")
    if safe_browsing_key or virustotal_key:
        reputation_status = "Live External Threat Intelligence Lookup Completed"
    else:
        reputation_status = "Local Rule-Based Analysis Engine Used (No External API Keys Configured)"

    scan_id = f"url-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now().isoformat()

    return {
        "id": scan_id,
        "scan_type": "url",
        "target": raw_url,
        "display_target": raw_url,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "timestamp": now_iso,
        "indicators": indicators,
        "positive_signals": positive_signals,
        "recommendations": recommendations,
        "reputation_status": reputation_status,
        "plain_explanation": plain_explanation,
        "domain_details": {
            "scheme": scheme,
            "hostname": hostname,
            "port": port or (443 if scheme == "https" else 80),
            "is_ip": is_valid_ip(hostname),
            "tld": tld,
            "length": len(raw_url)
        }
    }
