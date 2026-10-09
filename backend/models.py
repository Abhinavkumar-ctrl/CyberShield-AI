from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Indicator(BaseModel):
    name: str
    category: str
    severity: str  # "high", "medium", "low", "info"
    description: str
    evidence: str

class URLScanRequest(BaseModel):
    url: str

class MessageScanRequest(BaseModel):
    message: str
    claimed_sender: Optional[str] = None

class DomainScanRequest(BaseModel):
    domain: str

class AssistantRequest(BaseModel):
    query: str
    chat_history: Optional[List[Dict[str, str]]] = None

class ScanResponse(BaseModel):
    id: str
    scan_type: str  # "url", "message", "domain"
    target: str
    display_target: str
    risk_score: int  # 0 - 100
    risk_level: str  # "Low", "Medium", "High"
    timestamp: str
    indicators: List[Indicator]
    positive_signals: List[str]
    recommendations: List[str]
    reputation_status: str
    plain_explanation: str
    safer_alternative: Optional[str] = None
    extracted_phrases: Optional[List[Dict[str, str]]] = None
    domain_details: Optional[Dict[str, Any]] = None

class StatsResponse(BaseModel):
    total_scans: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    threat_distribution: Dict[str, int]
    scan_types: Dict[str, int]
    recent_scans: List[Dict[str, Any]]
