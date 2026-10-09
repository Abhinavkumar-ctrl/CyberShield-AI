import re
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from .url_engine import analyze_url

SCAM_PATTERNS = [
    {
        "category": "Urgency & Threats",
        "pattern": r"\b(urgent|immediately|within \d+ (hours?|mins?|minutes?)|suspended|blocked|locked|deactivated|account termination|final notice)\b",
        "severity": "high",
        "name": "Artificial Urgency & Coercive Threat",
        "description": "Uses pressure tactics to create panic so victims react quickly without verifying.",
        "why_concerning": "Legitimate institutions rarely threaten immediate suspension via unverified text messages without prior official notices."
    },
    {
        "category": "KYC & Banking Fraud",
        "pattern": r"\b(kyc|pan card|bank account|update kyc|sbi|hdfc|icici|axis|netbanking|account verified|re-activate|unblock account)\b",
        "severity": "high",
        "name": "Fake KYC & Banking Update Phishing",
        "description": "Attempts to trick users into submitting banking credentials or identity documents.",
        "why_concerning": "Banks in India and globally never ask users to update KYC details by clicking links sent via SMS or WhatsApp."
    },
    {
        "category": "Credential & OTP Harvesting",
        "pattern": r"\b(otp|one time password|pin|password|security code|verify code|share otp|enter pin)\b",
        "severity": "high",
        "name": "OTP / Credential Harvesting Attempt",
        "description": "Directly requests or tricks users into revealing one-time passwords or login credentials.",
        "why_concerning": "OTPs are confidential secrets used for 2-factor authentication. Sharing an OTP allows scammers to compromise your bank account."
    },
    {
        "category": "Prize & Lottery Scams",
        "pattern": r"\b(congratulations|you won|lottery|prize|claim reward|gift card|lucky winner|\$\d+,\d+|\b\$\d+\b|\b\d+ lakhs?\b)\b",
        "severity": "medium",
        "name": "Lottery & Fake Reward Claim",
        "description": "Promises unsolicited cash prizes, gift cards, or rewards to entice users.",
        "why_concerning": "You cannot win a contest or lottery you never entered. Scammers ask for upfront 'processing fees' or banking details."
    },
    {
        "category": "Delivery & Parcel Scams",
        "pattern": r"\b(delivery fee|parcel pending|package hold|address confirmation|fedex|dhl|post office|unpaid shipping|customs charge)\b",
        "severity": "medium",
        "name": "Fake Parcel Delivery Fee Scam",
        "description": "Claims a package is on hold pending a small fake payment or address update.",
        "why_concerning": "Postal services do not request personal payment or card details via random SMS links for parcel redelivery."
    },
    {
        "category": "Job & Internship Fraud",
        "pattern": r"\b(part-time job|work from home|earn \$\d+/day|earn \d+ per day|no experience|daily payout|telegram job|like youtube videos)\b",
        "severity": "high",
        "name": "Employment & Work-from-Home Scam",
        "description": "Offers unrealistically high compensation for minimal effort, often leading to task/prepayment fraud.",
        "why_concerning": "Scammers ask victims to pay 'registration fees' or perform fake online tasks before disappearing."
    },
    {
        "category": "Investment & Crypto Fraud",
        "pattern": r"\b(guaranteed profit|double your money|crypto signals|forex trading|high returns|zero risk|investment scheme)\b",
        "severity": "high",
        "name": "High-Yield Investment Fraud",
        "description": "Claims guaranteed financial returns with no market risk.",
        "why_concerning": "No legitimate investment can guarantee high returns without risk. These are Ponzi or exit schemes."
    },
    {
        "category": "Gift Cards & Wire Transfer",
        "pattern": r"\b(gift card|steam card|apple gift card|wire transfer|western union|crypto payment|send money urgently)\b",
        "severity": "high",
        "name": "Irreversible Payment Request",
        "description": "Requests payment in gift cards, wire transfers, or cryptocurrency.",
        "why_concerning": "Gift cards and crypto transfers are non-refundable and untraceable, making them the preferred payment method for scammers."
    }
]

def redact_sensitive_info(text: str) -> str:
    # Redact credit card numbers
    text = re.sub(r"\b(?:\d[ -]*?){13,16}\b", "[REDACTED-CARD]", text)
    # Redact phone numbers
    text = re.sub(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[REDACTED-PHONE]", text)
    # Redact emails
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[REDACTED-EMAIL]", text)
    return text

def analyze_message(message_text: str, claimed_sender: Optional[str] = None) -> Dict[str, Any]:
    text_clean = message_text.strip()
    text_lower = text_clean.lower()

    risk_score = 0
    indicators = []
    positive_signals = []
    extracted_phrases = []

    # 1. Sender Analysis (if provided)
    if claimed_sender:
        sender_clean = claimed_sender.strip().lower()
        if "@gmail.com" in sender_clean or "@yahoo.com" in sender_clean or "@hotmail.com" in sender_clean:
            if any(b in text_lower for b in ["paypal", "bank", "amazon", "apple", "sbi", "hdfc", "support"]):
                risk_score += 25
                indicators.append({
                    "name": "Official Brand Claimed from Free Email Domain",
                    "category": "Sender Verification",
                    "severity": "high",
                    "description": f"The message claims to represent an enterprise, but sender '{claimed_sender}' uses a free email provider.",
                    "evidence": f"Sender: '{claimed_sender}'"
                })
        elif re.search(r"\+?\d{10,15}", sender_clean) and any(b in text_lower for b in ["bank", "kyc", "account", "suspended"]):
            risk_score += 20
            indicators.append({
                "name": "Bank Notification from Personal Mobile Number",
                "category": "Sender Verification",
                "severity": "medium",
                "description": "Bank alerts usually originate from registered shortcodes (e.g. AD-SBIINB), not personal mobile numbers.",
                "evidence": f"Sender mobile: '{claimed_sender}'"
            })

    # 2. Pattern Matching & Phrase Extraction
    matched_categories = set()
    for rule in SCAM_PATTERNS:
        matches = re.finditer(rule["pattern"], text_clean, re.IGNORECASE)
        for match in matches:
            phrase = match.group(0)
            if rule["category"] not in matched_categories:
                matched_categories.add(rule["category"])
                severity = rule["severity"]
                risk_score += 25 if severity == "high" else 15

                indicators.append({
                    "name": rule["name"],
                    "category": rule["category"],
                    "severity": severity,
                    "description": rule["description"],
                    "evidence": f"Phrase match: '{phrase}'"
                })

            extracted_phrases.append({
                "phrase": phrase,
                "reason": rule["why_concerning"]
            })

    # 3. Extract and scan embedded URLs inside message
    url_pattern = r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|net|site|online|xyz|in|top)/[^\s]*)"
    found_urls = re.findall(url_pattern, text_clean)
    
    url_reports = []
    if found_urls:
        risk_score += 20
        indicators.append({
            "name": "Embedded Link in Message",
            "category": "Link Safety",
            "severity": "medium",
            "description": f"The message contains {len(found_urls)} hyperlink(s). Phishing messages use embedded links to direct victims to credential-stealing pages.",
            "evidence": f"Links found: {', '.join(found_urls[:3])}"
        })

        for raw_url in found_urls[:2]:
            sub_url_analysis = analyze_url(raw_url)
            url_reports.append(sub_url_analysis)
            # Add to risk score if embedded URL is high risk
            if sub_url_analysis["risk_score"] >= 50:
                risk_score += 20

    # 4. Positive signals for clean messages
    if len(indicators) == 0 and len(found_urls) == 0:
        positive_signals.append("No coercive urgency phrases or threat language detected.")
        positive_signals.append("No financial OTP or banking credential harvesting keywords found.")
        positive_signals.append("No embedded suspicious external hyperlinks present.")

    # Cap score
    risk_score = min(max(risk_score, 0), 100)

    # Risk level mapping
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Plain language explanation
    if risk_level == "High":
        plain_explanation = (
            f"DANGER: This message displays multiple markers of a scam or social engineering attempt (Risk Score: {risk_score}/100). "
            "It uses urgency, fake warnings, or financial lures to pressure you into revealing confidential data or money."
        )
        recommendations = [
            "Do NOT click any links in this message or reply to the sender.",
            "Do NOT share OTPs, PINs, bank account numbers, or PAN/Aadhaar details.",
            "Block the sender's number or email address on your device.",
            "Report the message to your telecom operator or cybercrime portal."
        ]
        safer_alternative = (
            "If this message claims to be from your bank or a service provider (e.g. SBI, HDFC, Amazon, India Post), "
            "do NOT use the contact information in the message. Instead, open your official mobile app or visit the verified website directly."
        )
    elif risk_level == "Medium":
        plain_explanation = (
            f"CAUTION: This message contains phrasing commonly used in unsolicited spam or marketing (Risk Score: {risk_score}/100). "
            "Verify the claimed sender before taking any requested action."
        )
        recommendations = [
            "Verify the claim independently before responding.",
            "Do not download attachments or click short links from unverified contacts."
        ]
        safer_alternative = "Contact the organization through their official customer support phone number listed on their official website."
    else:
        plain_explanation = (
            f"Notice: This message appears benign with low apparent risk (Risk Score: {risk_score}/100). "
            "No known scam patterns or phishing indicators were triggered."
        )
        recommendations = [
            "Always remain mindful when clicking links or sharing private details online."
        ]
        safer_alternative = None

    scan_id = f"msg-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now().isoformat()
    redacted_target = redact_sensitive_info(text_clean[:120] + ("..." if len(text_clean) > 120 else ""))

    return {
        "id": scan_id,
        "scan_type": "message",
        "target": text_clean,
        "display_target": redacted_target,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "timestamp": now_iso,
        "indicators": indicators,
        "positive_signals": positive_signals,
        "recommendations": recommendations,
        "reputation_status": "Rule-Based Natural Language Pattern Engine Applied",
        "plain_explanation": plain_explanation,
        "safer_alternative": safer_alternative,
        "extracted_phrases": extracted_phrases[:6]
    }
