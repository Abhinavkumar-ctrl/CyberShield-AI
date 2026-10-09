import type { ScanReport, StatsData, DemoExample } from './types';

const API_BASE = '/api';

export async function scanURL(url: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/scan/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to scan URL' }));
    throw new Error(err.detail || 'URL analysis failed');
  }
  return res.json();
}

export async function scanMessage(message: string, claimed_sender?: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/scan/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, claimed_sender }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to scan message' }));
    throw new Error(err.detail || 'Message analysis failed');
  }
  return res.json();
}

export async function scanDomain(domain: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/scan/domain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to inspect domain' }));
    throw new Error(err.detail || 'Domain inspection failed');
  }
  return res.json();
}

export async function askAssistant(query: string, chatHistory?: any[]): Promise<{ answer: string; source: string; suggested_actions?: string[] }> {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, chat_history: chatHistory }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Assistant request failed' }));
    throw new Error(err.detail || 'Assistant query failed');
  }
  return res.json();
}

export async function fetchScans(params?: {
  limit?: number;
  offset?: number;
  scan_type?: string;
  risk_level?: string;
  query?: string;
}): Promise<ScanReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.scan_type) searchParams.append('scan_type', params.scan_type);
  if (params?.risk_level) searchParams.append('risk_level', params.risk_level);
  if (params?.query) searchParams.append('query', params.query);

  const res = await fetch(`${API_BASE}/scans?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scan history');
  return res.json();
}

export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(`${API_BASE}/scans/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchScanById(id: string): Promise<ScanReport> {
  const res = await fetch(`${API_BASE}/scans/${id}`);
  if (!res.ok) throw new Error('Scan report not found');
  return res.json();
}

export async function deleteScanRecord(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/scans/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete scan');
}

export async function clearAllScanRecords(): Promise<void> {
  const res = await fetch(`${API_BASE}/scans`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear scan history');
}

export async function fetchDemoExamples(): Promise<DemoExample[]> {
  const res = await fetch(`${API_BASE}/demo/examples`);
  if (!res.ok) throw new Error('Failed to fetch demo examples');
  return res.json();
}
