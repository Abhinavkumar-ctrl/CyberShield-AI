import pytest
import sys
import os

# Add parent directory to sys.path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analysis.url_engine import analyze_url
from analysis.message_engine import analyze_message, redact_sensitive_info
from analysis.assistant_engine import query_ai_assistant

def test_url_analysis_benign():
    res = analyze_url("https://github.com/torvalds/linux")
    assert res["risk_level"] == "Low"
    assert res["risk_score"] < 30
    assert len(res["indicators"]) == 0
    assert len(res["positive_signals"]) > 0

def test_url_analysis_phishing_typosquat():
    res = analyze_url("https://paypa1-security-login.com@evil-attacker.net/login.php?user=target")
    assert res["risk_level"] in ["Medium", "High"]
    assert res["risk_score"] >= 60
    indicator_names = [i["name"] for i in res["indicators"]]
    assert "Userinfo Credentials in URL" in indicator_names or "Brand Typosquatting & Impersonation" in indicator_names

def test_url_analysis_ip_hostname():
    res = analyze_url("http://192.168.1.1/login.php")
    assert res["risk_score"] >= 30
    indicator_names = [i["name"] for i in res["indicators"]]
    assert "Raw IP Address Hostname" in indicator_names or "Unencrypted HTTP Protocol" in indicator_names

def test_message_analysis_scam():
    msg = "URGENT: Your SBI bank account is blocked. Update KYC now at http://sbi-kyc-update.online/verify or share OTP with support."
    res = analyze_message(msg, claimed_sender="AD-SBIINB")
    assert res["risk_level"] == "High"
    assert res["risk_score"] >= 60
    assert len(res["extracted_phrases"]) > 0
    indicator_names = [i["name"] for i in res["indicators"]]
    assert any("KYC" in name or "Urgency" in name or "OTP" in name for name in indicator_names)

def test_message_analysis_benign():
    msg = "Hi mom, I will be home around 6 PM today. Let's have dinner together!"
    res = analyze_message(msg)
    assert res["risk_level"] == "Low"
    assert res["risk_score"] < 30
    assert len(res["indicators"]) == 0

def test_redact_sensitive_info():
    raw = "My card is 4111-2222-3333-4444 and my email is test@example.com"
    redacted = redact_sensitive_info(raw)
    assert "4111-2222-3333-4444" not in redacted
    assert "[REDACTED-CARD]" in redacted
    assert "[REDACTED-EMAIL]" in redacted

def test_assistant_query():
    res = query_ai_assistant("I clicked a suspicious link. What should I do?")
    assert "Disconnect Internet Immediately" in res["answer"] or "1930" in res["answer"]
    assert "source" in res
