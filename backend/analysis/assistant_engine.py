import os
import re
from typing import List, Dict, Any, Optional

INDIAN_CYBER_RESOURCES = """
📌 **Official Indian Cybercrime Helplines & Resources:**
- **National Cyber Crime Helpline:** Call **1930** immediately for financial fraud (report within the golden hour to freeze stolen funds).
- **National Cyber Crime Reporting Portal:** Visit [cybercrime.gov.in](https://cybercrime.gov.in/) to file an official online report.
- **Chakshu (Sanchar Saathi):** Report fraudulent SMS, WhatsApp calls, and suspicious connections at [sancharsaathi.gov.in/sancharsaathi](https://sancharsaathi.gov.in/).
*Note: Reporting to 1930 initiates institutional hold requests with banks, but does not guarantee 100% fund recovery.*
"""

PREDEFINED_GUIDANCE = [
    {
        "keywords": ["clicked", "link", "opened url", "phishing link"],
        "topic": "Clicked Suspicious Link",
        "response": """
### 🚨 Immediate Steps If You Clicked a Suspicious Link:

1. **Disconnect Internet Immediately:** Turn off Wi-Fi and Cellular Data on your device right now to block malware communication or active session hijacking.
2. **Do NOT Enter Credentials or Passwords:** If a web page opened asking for login details, OTPs, or credit card info, close the tab immediately.
3. **Change Compromised Passwords from a Clean Device:**
   - Use a *different, secure computer or phone* to log into your email, bank, and social media accounts.
   - Update your passwords to strong, unique passwords.
4. **Enable Multi-Factor Authentication (MFA):** Turn on authenticator app-based MFA or security keys on all critical accounts.
5. **Revoke Active Sessions:** Go to your account security settings (Google, Microsoft, Bank) and click **"Sign out of all other sessions/devices."**
6. **Scan for Malware:** Run a full system antivirus scan using trusted security software (e.g. Windows Defender, Malwarebytes).
7. **Monitor Bank Accounts:** Contact your bank immediately if financial details were submitted.

""" + INDIAN_CYBER_RESOURCES
    },
    {
        "keywords": ["otp", "one time password", "share pin", "bank otp"],
        "topic": "OTP & Credential Requests",
        "response": """
### 🛡️ Critical Safety Warning Regarding OTPs:

**NEVER SHARE AN OTP WITH ANYONE.**

1. **No Legitimate Bank or Company Will Ever Ask for Your OTP:** Bank staff, customer support agents, police officers, and delivery agents will NEVER ask for your OTP over phone, SMS, or WhatsApp.
2. **Why Scammers Want Your OTP:** An OTP is the final authorization step to complete a money transfer or reset your account password.
3. **What to Do If You Received an Unexpected OTP:**
   - Do NOT share it with anyone calling or messaging you.
   - Do NOT click any links inside the SMS.
   - If someone is claiming to refund money to you, remember: **You NEVER need to enter an OTP or UPI PIN to RECEIVE money.**
4. **If You Already Shared an OTP:**
   - Immediately call your bank's card blocking helpline or call **1930** (in India).
   - Change your netbanking password right away.
""" + INDIAN_CYBER_RESOURCES
    },
    {
        "keywords": ["job", "internship", "telegram job", "work from home", "like videos"],
        "topic": "Job & Work-From-Home Scams",
        "response": """
### 🔍 How to Verify Job Offers & Avoid Employment Fraud:

1. **Red Flags of Fake Jobs:**
   - Requests for upfront "registration fees", "training charges", or "security deposits".
   - Promises of high daily earnings ($100–$500/day or ₹5,000/day) for simple tasks like liking YouTube videos or rating hotels.
   - Recruiter insists on communicating exclusively via Telegram, WhatsApp, or random Gmail addresses.
2. **Immediate Protective Actions:**
   - Never send money to get a job. Legitimate employers pay *you*, not the other way around.
   - Never share bank account details or government IDs until you have verified the company via official corporate registries.
3. **Verification Steps:**
   - Search the company name on LinkedIn and check their official domain career page.
   - Email the official HR department using the domain address (e.g., `careers@company.com`).
"""
    },
    {
        "keywords": ["report", "financial scam", "lost money", "stolen funds", "india", "1930"],
        "topic": "Reporting Financial Cybercrime",
        "response": """
### 🏛️ How to Report Financial Cyber Scams in India:

1. **Call 1930 Immediately:**
   - Dial **1930** (National Cybercrime Helpline) as fast as possible.
   - The sooner you report within the "Golden Hour", the higher the probability of freezing the fraudster's bank account before funds are withdrawn.
2. **Gather Evidence:**
   - Keep transaction IDs, bank statement entries, fraudster's UPI ID/phone number, and screenshots of messages.
3. **Lodge Online Complaint:**
   - Visit the official portal: [cybercrime.gov.in](https://cybercrime.gov.in/).
   - Select **"Report Financial Fraud"** and follow the step-by-step submission.
4. **Contact Your Bank:**
   - Visit your nearest bank branch to submit a written dispute and freeze compromised cards/UPI handles.
""" + INDIAN_CYBER_RESOURCES
    },
    {
        "keywords": ["secure account", "mfa", "passwords", "hacked", "compromised"],
        "topic": "Securing Compromised Accounts",
        "response": """
### 🔐 Account Security Checklist After a Suspected Compromise:

1. **Use a Clean Device:** Do not perform password resets on a device you suspect has active malware.
2. **Change Critical Passwords:**
   - Primary Email (Google, Outlook, Yahoo) — this controls password resets for everything else!
   - Financial & Banking Accounts
   - Social Media & Messaging Apps
3. **Enable Multi-Factor Authentication (MFA):**
   - Use Authenticator apps (Google Authenticator, Microsoft Authenticator, YubiKey) instead of SMS OTP where possible.
4. **Audit Connected Apps & Sessions:**
   - Go to Google/Microsoft Security settings -> **Devices & Connected Apps** -> Revoke unknown access.
5. **Check Email Forwarding Rules:**
   - Scammers often set hidden email forwarding rules to intercept your password reset emails silently. Check your email settings for suspicious auto-forwarders.
"""
    }
]

def query_ai_assistant(user_query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    query_lower = user_query.lower()

    # Safety check: block prompt requests for sensitive input harvesting
    if any(k in query_lower for k in ["my password is", "my otp is", "my cvv is", "my pin is"]):
        return {
            "answer": "🚨 **SECURITY REMINDER:** CyberShield AI will NEVER request or store your passwords, OTPs, CVV numbers, or PINs. Please remove sensitive credentials from your input for your protection.",
            "source": "privacy_filter",
            "suggested_actions": ["Clear input", "Ask general safety advice"]
        }

    gemini_key = os.environ.get("GEMINI_API_KEY")

    # If Gemini API Key is available, try Gemini LLM first
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            system_prompt = (
                "You are Ask CyberShield, an expert cybersecurity assistant. Provide concise, clear, prioritized, "
                "plain-language digital safety instructions. Always emphasize account isolation, changing credentials from clean devices, "
                "enabling MFA, and for Indian users, mention National Cybercrime Helpline 1930 and https://cybercrime.gov.in/ when relevant. "
                "Never request user passwords, OTPs, or private keys."
            )
            response = model.generate_content(f"{system_prompt}\nUser Query: {user_query}")
            return {
                "answer": response.text,
                "source": "gemini_llm",
                "suggested_actions": [
                    "How do I enable MFA?",
                    "How to report a scam in India?",
                    "What to do after clicking a link?"
                ]
            }
        except Exception as e:
            pass # Fallback to local rule-based engine gracefully

    # Intelligent Local Knowledge Engine Match
    best_match = None
    max_score = 0
    for guide in PREDEFINED_GUIDANCE:
        score = sum(1 for kw in guide["keywords"] if kw in query_lower)
        if score > max_score:
            max_score = score
            best_match = guide

    if best_match and max_score > 0:
        return {
            "answer": best_match["response"],
            "source": "local_knowledge_engine",
            "suggested_actions": [
                "I clicked a suspicious link. What should I do?",
                "Someone is asking for my bank OTP. Is this safe?",
                "How can I report an online financial scam in India?",
                "How do I secure my accounts after a phishing attack?"
            ]
        }

    # General fallback response
    fallback_response = f"""
### 🛡️ CyberShield AI Safety Guidance

Thank you for reaching out to **Ask CyberShield**. Here are core cybersecurity principles regarding your query:

1. **Verify the Source:** Never trust unsolicited links, emergency notices, or high-return financial claims received via SMS, WhatsApp, or Email.
2. **Never Share Credentials:** No legitimate entity will ever demand your OTP, account password, or UPI PIN.
3. **Verify via Official Channels:** Always visit an organization's verified domain directly or use their official app.
4. **Immediate Incident Action:** If you submitted personal details on a suspicious site, change your passwords from a secure device, enable MFA, and inform your financial provider.

""" + INDIAN_CYBER_RESOURCES

    return {
        "answer": fallback_response,
        "source": "local_knowledge_engine",
        "suggested_actions": [
            "I clicked a suspicious link. What should I do?",
            "Someone is asking for my bank OTP. Is this safe?",
            "How do I verify a suspicious job offer?",
            "How do I report a financial cybercrime in India?"
        ]
    }
