import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from models import (
    URLScanRequest, MessageScanRequest, DomainScanRequest,
    AssistantRequest, ScanResponse, StatsResponse
)
from database import (
    init_db, save_scan, get_scans, get_scan_by_id,
    delete_scan, clear_all_scans, get_stats
)
from analysis.url_engine import analyze_url
from analysis.message_engine import analyze_message
from analysis.assistant_engine import query_ai_assistant

app = FastAPI(
    title="CyberShield AI API",
    description="Intelligent Cybersecurity & Digital Safety Threat Analysis Platform",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    init_db()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "CyberShield AI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/scan/url", response_model=ScanResponse)
def scan_url_endpoint(request: URLScanRequest):
    if not request.url or not request.url.strip():
        raise HTTPException(status_code=400, detail="URL input cannot be empty.")
    
    report = analyze_url(request.url)
    save_scan(report)
    return report

@app.post("/api/scan/message", response_model=ScanResponse)
def scan_message_endpoint(request: MessageScanRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message input cannot be empty.")
    
    report = analyze_message(request.message, request.claimed_sender)
    save_scan(report)
    return report

@app.post("/api/scan/domain", response_model=ScanResponse)
def scan_domain_endpoint(request: DomainScanRequest):
    if not request.domain or not request.domain.strip():
        raise HTTPException(status_code=400, detail="Domain input cannot be empty.")
    
    raw_domain = request.domain.strip()
    if not raw_domain.startswith("http://") and not raw_domain.startswith("https://"):
        raw_domain = "https://" + raw_domain
        
    report = analyze_url(raw_domain)
    report["scan_type"] = "domain"
    report["reputation_status"] = "Passive SSRF-Safe Domain Structure & Reputation Check"
    save_scan(report)
    return report

@app.post("/api/assistant/chat")
def assistant_chat_endpoint(request: AssistantRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    return query_ai_assistant(request.query, request.chat_history)

@app.get("/api/scans")
def get_scans_endpoint(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    scan_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    query: Optional[str] = Query(None)
):
    return get_scans(limit=limit, offset=offset, scan_type=scan_type, risk_level=risk_level, query=query)

@app.get("/api/scans/stats", response_model=StatsResponse)
def get_stats_endpoint():
    return get_stats()

@app.get("/api/scans/{scan_id}")
def get_scan_detail_endpoint(scan_id: str):
    scan = get_scan_by_id(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    return scan

@app.delete("/api/scans/{scan_id}")
def delete_scan_endpoint(scan_id: str):
    success = delete_scan(scan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    return {"message": "Scan deleted successfully.", "id": scan_id}

@app.delete("/api/scans")
def clear_scans_endpoint():
    clear_all_scans()
    return {"message": "All scan history cleared."}

@app.get("/api/demo/examples")
def get_demo_examples():
    return [
        {
            "id": "demo-1",
            "type": "message",
            "title": "Suspicious SBI Bank KYC Suspension Warning",
            "claimed_sender": "AD-SBIINB",
            "content": "URGENT: Your SBI bank account has been blocked due to pending KYC update. Click http://sbi-kyc-update.online/verify immediately or account will be permanently terminated.",
            "description": "Demonstrates high-risk urgent banking scam with credential harvesting link."
        },
        {
            "id": "demo-2",
            "type": "message",
            "title": "Fake Amazon Gift Card Prize Notification",
            "claimed_sender": "+1-800-CLAIM",
            "content": "CONGRATS! You won a $5,000 Amazon Gift Card in our quarterly raffle! Claim your reward now at http://amz-claim-prize.site/win?code=99283 before it expires in 24 hours.",
            "description": "Demonstrates medium/high-risk prize reward claim scam with suspicious TLD."
        },
        {
            "id": "demo-3",
            "type": "url",
            "title": "Lookalike Paypal URL with Userinfo Credentials",
            "claimed_sender": None,
            "content": "https://paypa1-security-login.com@evil-attacker.net/login.php?user=target",
            "description": "Demonstrates typosquatting brand impersonation with userinfo '@' character and credential path."
        },
        {
            "id": "demo-4",
            "type": "message",
            "title": "Legitimate Family Informational Message",
            "claimed_sender": "+91-9876543210",
            "content": "Hi mom, I will be home around 6 PM today. Let's have dinner together!",
            "description": "Demonstrates low-risk benign message baseline."
        },
        {
            "id": "demo-5",
            "type": "url",
            "title": "Legitimate Normal HTTPS URL Example",
            "claimed_sender": None,
            "content": "https://github.com/torvalds/linux",
            "description": "Demonstrates clean, low-risk URL baseline with standard HTTPS protocol."
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
