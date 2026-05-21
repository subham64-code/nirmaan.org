"use client";

import { useEffect, useState } from "react";

type StudentRow = {
  [key: string]: any;
};

interface Props {
  sheetId?: string;
  gid?: string;
  teacherView?: boolean;
}

export default function GoogleSheetAttendance({
  sheetId = "1D4JBxZLZSHmXhrhLIX-JBrKmPhkpZ2MJX8k0Y6JNY04",
  gid = "905174869",
  teacherView = false,
}: Props) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSheet();
  }, [sheetId, gid]);

  const buildCsvUrl = (id: string, g: string) => `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${g}`;

  const fetchSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = buildCsvUrl(sheetId, gid);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sheet; check visibility or sheet ID/gid");
      const txt = await res.text();
      const parsed = parseCsv(txt);
      setRows(parsed);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Improved CSV parser to handle basic quotes
  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    
    const parseLine = (line: string) => {
      const result = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
          result.push(cur.trim());
          cur = "";
        } else cur += char;
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const data: StudentRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const obj: StudentRow = {};
      headers.forEach((h, idx) => {
        if (h) obj[h] = (cols[idx] || "").trim();
      });
      data.push(obj);
    }
    return data;
  };

  const handleSync = async () => {
    if (rows.length === 0) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const records = rows.map(row => {
        const name = row['Name'] || row['Student'] || row['student_name'] || row['name'] || Object.values(row)[0];
        const nirmaanId = row['ID'] || row['Student ID'] || row['id'] || row['nirmaanId'] || '';
        
        // Find latest date column that has a value
        const dateCols = Object.keys(row).filter(k => !/student|name|id|nirmaan|percent/i.test(k));
        const latestDateCol = dateCols[dateCols.length - 1] || new Date().toISOString().slice(0, 10);
        const statusVal = row[latestDateCol]?.toLowerCase();
        const status = (statusVal === 'p' || statusVal?.includes('present') || statusVal === '1') ? 'Present' : 'Absent';

        return {
          name,
          nirmaanId,
          status,
          dateKey: latestDateCol.includes('/') ? new Date(latestDateCol).toISOString().slice(0, 10) : latestDateCol
        };
      });

      const token = localStorage.getItem('nirmaan_token');
      const response = await fetch('http://localhost:5000/api/attendance/bulk-import', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records })
      });
      
      const data = await response.json();
      if (data.success) {
        setSyncMessage({ type: 'success', text: `Successfully synced ${data.data.upserted + data.data.modified} records!` });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: err.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const computePercent = (row: StudentRow) => {
    const keys = Object.keys(row);
    const dateCols = keys.filter((k) => !/student|name|id|nirmaan|percent/i.test(k));
    if (dateCols.length === 0) return 0;
    let present = 0;
    dateCols.forEach((c) => {
      const cell = (row[c] || "").toString().toLowerCase();
      if (cell === "p" || cell.includes("present") || cell === "1") present++;
    });
    return Math.round((present / dateCols.length) * 100);
  };

  const list = rows.map((r) => ({ ...r, percent: computePercent(r) }));
  const sorted = [...list].sort((a, b) => (b.percent || 0) - (a.percent || 0));
  const displayRows = teacherView ? sorted : list;

  return (
    <div className="p-6 bg-white rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Manual Attendance Sync</h3>
          <p className="text-sm text-gray-500">Source: <a className="text-blue-600 hover:underline" href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`} target="_blank" rel="noreferrer">Google Sheet</a></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSheet}
            disabled={loading}
            title="Refresh attendance sheet"
            aria-label="Refresh attendance sheet"
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button 
            onClick={handleSync} 
            disabled={syncing || rows.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {syncing ? 'Syncing...' : 'Sync to DB'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${syncMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {syncMessage.text}
        </div>
      )}

      {loading && <div className="py-8 text-center text-gray-500">Loading sheet data...</div>}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}

      {!loading && !error && displayRows.length === 0 && <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-xl">No student records found.</div>}

      {!loading && displayRows.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {displayRows.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition">
              <div>
                <div className="font-semibold text-gray-900">{r['Name'] || r['Student'] || r['student_name'] || r['name'] || Object.values(r)[0]}</div>
                <div className="text-xs text-gray-500 font-mono">{r['ID'] || r['Student ID'] || r['id'] || r['nirmaanId'] || 'NO-ID'}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${r['percent'] >= 75 ? 'text-green-600' : 'text-red-600'}`}>{r['percent']}%</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Attendance</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
