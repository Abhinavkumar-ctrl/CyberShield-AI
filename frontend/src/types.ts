export interface Indicator {
  name: string;
  category: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  description: string;
  evidence: string;
}

export interface ExtractedPhrase {
  phrase: string;
  reason: string;
}

export interface DomainDetails {
  scheme: string;
  hostname: string;
  port: number;
  is_ip: boolean;
  tld: string;
  length: number;
}

export interface ScanReport {
  id: string;
  scan_type: 'url' | 'message' | 'domain';
  target: string;
  display_target: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  timestamp: string;
  indicators: Indicator[];
  positive_signals: string[];
  recommendations: string[];
  reputation_status: string;
  plain_explanation: string;
  safer_alternative?: string;
  extracted_phrases?: ExtractedPhrase[];
  domain_details?: DomainDetails;
}

export interface StatsData {
  total_scans: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  threat_distribution: Record<string, number>;
  scan_types: Record<string, number>;
  recent_scans: ScanReport[];
}

export interface DemoExample {
  id: string;
  type: 'url' | 'message';
  title: string;
  claimed_sender?: string;
  content: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
  suggestedActions?: string[];
}
