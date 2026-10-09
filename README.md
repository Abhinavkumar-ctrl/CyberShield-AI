# 🛡️ CyberShield AI — Intelligent Cybersecurity & Digital Safety Platform

[![Frontend Deployed](https://img.shields.io/badge/Frontend-Vercel-success?style=flat-square&logo=vercel)](https://cyber-shield-ai-weld-xi.vercel.app)
[![Backend Deployed](https://img.shields.io/badge/Backend-Render-blue?style=flat-square&logo=render)](https://cybershield-api.onrender.com)

🌐 **Live Website Application:** [https://cyber-shield-ai-weld-xi.vercel.app](https://cyber-shield-ai-weld-xi.vercel.app)  
📡 **Live Backend API Server:** [https://cybershield-api.onrender.com](https://cybershield-api.onrender.com)

---

**CyberShield AI** is an intelligent, user-centric cybersecurity platform designed to empower non-technical users—including students, senior citizens, online shoppers, and digital payment users—to identify phishing links, fraudulent websites, scam SMS/emails, and social engineering attacks.

The application explains **WHY** something is suspicious in simple language and gives actionable guidance on **WHAT TO DO NEXT**.

---

## 🚀 Key Features

1. **Dashboard Overview:**
   - Real-time threat analysis hero bar supporting URLs, suspicious messages, and domain names.
   - Summary metric cards (Total Scans, High Risk, Medium Risk, Low Risk) based on real persistent database records.
   - Recharts interactive threat distribution chart.
   - Live activity feed showing recent scans.

2. **URL Phishing Detector:**
   - Inspects URL syntax, HTTPS vs HTTP, IP hostnames, Punycode (homograph attacks), userinfo `@` characters, lookalike domains (typosquatting), non-standard ports, and open redirects.
   - Modular risk scoring from 0 to 100 with Low (0-29), Medium (30-59), and High (60-100) risk categorization.

3. **Scam Message & Email Analyzer:**
   - Detects SMS, WhatsApp, Email, and social media fraud patterns (Urgent account suspension, fake KYC updates, bank verification, OTP harvesting, delivery fee scams, lottery/prize traps, job/internship scams, investment/crypto fraud).
   - Highlights exact suspicious phrases in text and explains why they are concerning.
   - Suggests safer alternative actions (e.g. contacting official bank apps or dialing National Cybercrime Helpline 1930 in India).

4. **Website & Domain Inspector:**
   - Passive SSRF-safe domain threat intelligence analyzing domain structure, impersonation patterns, and TLD safety without executing remote scripts.

5. **Ask CyberShield (AI Security Assistant):**
   - Interactive safety chatbot providing emergency advice, incident response steps for compromised accounts, MFA setup guidance, and verified Indian cybercrime reporting resources (Helpline 1930 & `https://cybercrime.gov.in/`).
   - Integrated with Gemini LLM when an API key is configured, with a rich local rule-based assistant as fallback.

6. **Scan History & Analytics:**
   - SQLite persistent database storage for scan audit logs.
   - Search, filter by risk level or scan type, view detailed reports, delete records, and export history to JSON or CSV.

7. **Hackathon Judge Demo Mode & Documentation:**
   - Predefined test cases (SBI KYC Scam, Fake Amazon Prize, Lookalike Paypal URL, Benign Family SMS, Clean GitHub URL).
   - Interactive technical pipeline visualization and limitations breakdown.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Python FastAPI, Pydantic, Uvicorn, SQLite3 (`cybershield.db`).
- **Threat Engine:** Modular Python URL parser, natural language regex scam classifier, and local security knowledge engine.
- **Optional External APIs:** Google Gemini LLM API, Google Safe Browsing API, VirusTotal API.

---

## 🛠️ Quick Start Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js v18+** & npm

### 1. Start the Backend API Server
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*The FastAPI backend will start on `http://localhost:8000` (interactive API docs available at `http://localhost:8000/docs`).*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend server will start on `http://localhost:3000`.*

---

## 🧪 Running Unit Tests

Run the backend unit test suite using `pytest`:

```bash
python -m pytest backend/tests/test_analysis.py
```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```env
PORT=8000
HOST=0.0.0.0
DATABASE_PATH=cybershield.db

# Optional LLM & Reputation API Keys
GEMINI_API_KEY=your_gemini_api_key_here
SAFE_BROWSING_API_KEY=your_google_safe_browsing_key_here
VIRUSTOTAL_API_KEY=your_virustotal_key_here
```

*Note: If no API keys are configured, CyberShield AI operates using its transparent local rule-based threat engine.*

---

## ⚖️ Limitations & Guardrails

Automated security checks provide decision support but cannot guarantee 100% detection against novel zero-day attacks. CyberShield AI NEVER requests or stores passwords, OTPs, or financial secrets.
