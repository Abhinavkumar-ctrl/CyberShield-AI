import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.environ.get("DATABASE_PATH", "cybershield.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                scan_type TEXT NOT NULL,
                target TEXT NOT NULL,
                display_target TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                report_json TEXT NOT NULL
            )
        """)
        conn.commit()

def save_scan(scan_data: Dict[str, Any]):
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO scans (
                id, scan_type, target, display_target, risk_score, risk_level, timestamp, report_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scan_data["id"],
            scan_data["scan_type"],
            scan_data["target"],
            scan_data["display_target"],
            scan_data["risk_score"],
            scan_data["risk_level"],
            scan_data["timestamp"],
            json.dumps(scan_data)
        ))
        conn.commit()

def get_scans(
    limit: int = 50,
    offset: int = 0,
    scan_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    query: Optional[str] = None
) -> List[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        sql = "SELECT report_json FROM scans WHERE 1=1"
        params = []

        if scan_type and scan_type.lower() != "all":
            sql += " AND scan_type = ?"
            params.append(scan_type.lower())

        if risk_level and risk_level.lower() != "all":
            sql += " AND risk_level = ?"
            params.append(risk_level.capitalize())

        if query and query.strip():
            sql += " AND (target LIKE ? OR display_target LIKE ?)"
            search_param = f"%{query.strip()}%"
            params.extend([search_param, search_param])

        sql += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        return [json.loads(row["report_json"]) for row in rows]

def get_scan_by_id(scan_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT report_json FROM scans WHERE id = ?", (scan_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row["report_json"])
        return None

def delete_scan(scan_id: str) -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_scans() -> bool:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM scans")
        conn.commit()
        return True

def get_stats() -> Dict[str, Any]:
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM scans")
        total_scans = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM scans WHERE risk_level = 'High'")
        high_risk_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM scans WHERE risk_level = 'Medium'")
        medium_risk_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM scans WHERE risk_level = 'Low'")
        low_risk_count = cursor.fetchone()[0]

        cursor.execute("SELECT scan_type, COUNT(*) FROM scans GROUP BY scan_type")
        scan_types_rows = cursor.fetchall()
        scan_types = {row[0]: row[1] for row in scan_types_rows}

        cursor.execute("SELECT report_json FROM scans ORDER BY timestamp DESC LIMIT 10")
        recent_rows = cursor.fetchall()
        recent_scans = [json.loads(r["report_json"]) for r in recent_rows]

        threat_distribution = {
            "High Risk": high_risk_count,
            "Medium Risk": medium_risk_count,
            "Low Risk": low_risk_count
        }

        return {
            "total_scans": total_scans,
            "high_risk_count": high_risk_count,
            "medium_risk_count": medium_risk_count,
            "low_risk_count": low_risk_count,
            "threat_distribution": threat_distribution,
            "scan_types": scan_types,
            "recent_scans": recent_scans
        }
