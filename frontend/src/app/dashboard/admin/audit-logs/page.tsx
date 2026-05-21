"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Filter, Download, Search, Clock, User, Shield, AlertCircle, CheckCircle, Info } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: "admin" | "teacher" | "student";
  ip: string;
  timestamp: string;
  severity: "info" | "warning" | "critical" | "success";
  details: string;
}

const mockLogs: AuditLog[] = [
  { id: "1", action: "Student Approved", user: "Admin Subham", role: "admin", ip: "192.168.1.10", timestamp: new Date(Date.now() - 3 * 60000).toISOString(), severity: "success", details: "Approved student NIR2024088 – Ravi Kumar" },
  { id: "2", action: "Exam Created", user: "Dr. Priya Singh", role: "teacher", ip: "192.168.1.22", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), severity: "info", details: "Created 'ML Mid-Term 2025' – 60 marks, 5 questions" },
  { id: "3", action: "Attendance Marked", user: "Dr. Ramesh Patel", role: "teacher", ip: "192.168.1.30", timestamp: new Date(Date.now() - 35 * 60000).toISOString(), severity: "info", details: "Bulk attendance marked for AIML Batch – 42 students" },
  { id: "4", action: "Failed Login Attempt", user: "Unknown", role: "student", ip: "203.0.113.45", timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), severity: "warning", details: "3 failed login attempts from external IP" },
  { id: "5", action: "Department Created", user: "Admin Subham", role: "admin", ip: "192.168.1.10", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), severity: "success", details: "Created department: Generative AI (GENAI)" },
  { id: "6", action: "Student Data Export", user: "Admin Subham", role: "admin", ip: "192.168.1.10", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), severity: "warning", details: "Exported student data CSV – 342 records" },
  { id: "7", action: "Permission Changed", user: "Admin Subham", role: "admin", ip: "192.168.1.10", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), severity: "critical", details: "Changed role of user ID 4432 from student to teacher" },
  { id: "8", action: "Exam Submitted", user: "NIR2024001", role: "student", ip: "10.0.0.55", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), severity: "success", details: "Submitted ML Mid-Term – Score: 54/60" },
  { id: "9", action: "QR Session Generated", user: "Dr. Priya Singh", role: "teacher", ip: "192.168.1.22", timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), severity: "info", details: "QR attendance session for GenAI class – expires in 5 min" },
  { id: "10", action: "Backup Created", user: "System", role: "admin", ip: "127.0.0.1", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), severity: "success", details: "Automated daily backup completed – 2.4 GB" },
];

const severityConfig = {
  info: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: <Info className="w-4 h-4" />, label: "INFO" },
  success: { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: <CheckCircle className="w-4 h-4" />, label: "SUCCESS" },
  warning: { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", icon: <AlertCircle className="w-4 h-4" />, label: "WARNING" },
  critical: { color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: <Shield className="w-4 h-4" />, label: "CRITICAL" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filtered = logs.filter((log) => {
    const matchSearch = !search || log.action.toLowerCase().includes(search.toLowerCase()) || log.user.toLowerCase().includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    const matchRole = filterRole === "all" || log.role === filterRole;
    return matchSearch && matchSeverity && matchRole;
  });

  const exportCSV = () => {
    const rows = [["ID", "Action", "User", "Role", "IP", "Timestamp", "Severity", "Details"],
      ...filtered.map((l) => [l.id, l.action, l.user, l.role, l.ip, l.timestamp, l.severity, l.details])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  return (
    <DashboardShell
      title="Audit Logs"
      subtitle="Complete activity trail for all users, roles, and system events"
      nav={[
        { href: "/dashboard/admin", label: "← Admin Overview" },
        { href: "/dashboard/admin/departments", label: "Departments" },
        { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
        { href: "/dashboard/admin/semester-control", label: "Semester Control" },
      ]}
    >
      {/* Summary Stats */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {(["info", "success", "warning", "critical"] as const).map((sev, i) => {
          const count = logs.filter((l) => l.severity === sev).length;
          const cfg = severityConfig[sev];
          return (
            <motion.div key={sev} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${cfg.color} cursor-pointer transition`}
              onClick={() => setFilterSeverity(filterSeverity === sev ? "all" : sev)}>
              {cfg.icon}
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-semibold">{cfg.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div className="glass p-5 rounded-2xl flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex-1 min-w-48 flex items-center gap-2 border border-[var(--outline)] rounded-xl px-3 py-2.5 bg-[var(--surface-2)]">
          <Search className="w-4 h-4 text-[var(--muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs…" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        {[["Severity", filterSeverity, setFilterSeverity, ["all", "info", "success", "warning", "critical"]],
          ["Role", filterRole, setFilterRole, ["all", "admin", "teacher", "student"]]].map(([label, val, setter, opts]) => (
          <div key={String(label)} className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted)]" />
            <select value={val as string} onChange={(e) => (setter as Function)(e.target.value)}
              className="rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
              {(opts as string[]).map((o) => <option key={o} value={o}>{String(label)}: {o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          </div>
        ))}
        <button onClick={exportCSV} className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--brand)] to-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      {/* Log Table */}
      <motion.div className="glass rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--outline)] bg-[var(--surface-2)]">
                {["Severity", "Action", "User", "Role", "IP Address", "Time", "Details"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-[var(--muted)] uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--muted)]">No logs match your filters</td></tr>
              ) : (
                filtered.map((log, i) => {
                  const cfg = severityConfig[log.severity];
                  return (
                    <motion.tr key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{log.action}</td>
                      <td className="px-4 py-3 flex items-center gap-2 whitespace-nowrap"><User className="w-3.5 h-3.5 text-[var(--muted)]" />{log.user}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.role === "admin" ? "bg-red-500/10 text-red-600" : log.role === "teacher" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"}`}>{log.role}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{log.ip}</td>
                      <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[var(--muted)] max-w-xs truncate" title={log.details}>{log.details}</td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--outline)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          Showing {filtered.length} of {logs.length} logs • Logs retained for 90 days
        </div>
      </motion.div>
    </DashboardShell>
  );
}
