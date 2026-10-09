import React, { useState, useEffect } from 'react';
import type { ScanReport } from '../types';
import { fetchScans, deleteScanRecord, clearAllScanRecords } from '../api';
import { History, Search, Trash2, Download, Eye, Loader2, X } from 'lucide-react';
import { ScanReportView } from './ScanReportView';

interface ScanHistoryProps {
  onSelectScan?: (scan: ScanReport) => void;
  refreshStats: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ refreshStats }) => {
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanTypeFilter, setScanTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanReport | null>(null);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await fetchScans({
        scan_type: scanTypeFilter,
        risk_level: riskFilter,
        query: searchQuery
      });
      setScans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [scanTypeFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadScans();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await deleteScanRecord(id);
      loadScans();
      refreshStats();
    } catch (err) {
      alert('Failed to delete scan');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL scan history? This action cannot be undone.')) return;
    try {
      await clearAllScanRecords();
      loadScans();
      refreshStats();
    } catch (err) {
      alert('Failed to clear scan history');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cybershield_scans_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['ID', 'Type', 'Target', 'Risk Score', 'Risk Level', 'Timestamp'];
    const rows = scans.map(s => [
      s.id,
      s.scan_type,
      `"${s.target.replace(/"/g, '""')}"`,
      s.risk_score,
      s.risk_level,
      s.timestamp
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cybershield_scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="cyber-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="text-cyan-400" size={24} />
              Persistent Scan History & Audit Logs
            </h2>
            <p className="text-xs text-slate-300">
              Review, filter, and export threat records saved in SQLite database.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={scans.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              disabled={scans.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Download size={14} /> Export JSON
            </button>
            <button
              onClick={handleClearAll}
              disabled={scans.length === 0}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Trash2 size={14} /> Clear All History
            </button>
          </div>
        </div>

        {/* Filters Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search by URL or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          </form>

          {/* Filter Scan Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Type:</span>
            <select
              value={scanTypeFilter}
              onChange={(e) => setScanTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Types (URL, Message, Domain)</option>
              <option value="url">URL Scans</option>
              <option value="message">Message Scans</option>
              <option value="domain">Domain Scans</option>
            </select>
          </div>

          {/* Filter Risk Level */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only</option>
              <option value="medium">Medium Risk Only</option>
              <option value="low">Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table / List */}
      <div className="cyber-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-cyan-400" size={18} />
            Loading scan history...
          </div>
        ) : scans.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-slate-400">
            <History size={36} className="mx-auto text-slate-600" />
            <div className="text-sm font-semibold text-slate-300">No Scan Records Found</div>
            <p className="text-xs max-w-sm mx-auto">
              No matching scans were found in the database. Run a threat analysis from the dashboard to populate history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Target / Content</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/70 transition">
                    <td className="py-3 px-4 max-w-md truncate font-mono text-white">
                      {scan.display_target}
                    </td>
                    <td className="py-3 px-4 font-mono uppercase">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {scan.scan_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        scan.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        scan.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {scan.risk_score} ({scan.risk_level})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedScanDetail(scan)}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition"
                      >
                        <Eye size={13} className="inline mr-1" /> View
                      </button>
                      <button
                        onClick={(e) => handleDelete(scan.id, e)}
                        className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                      >
                        <Trash2 size={13} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedScanDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0F19] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedScanDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <ScanReportView
              report={selectedScanDetail}
              onScanAnother={() => setSelectedScanDetail(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
