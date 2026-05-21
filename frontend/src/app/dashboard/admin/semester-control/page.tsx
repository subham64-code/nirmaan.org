"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, RotateCcw, Archive, Play, Square, CheckCircle, AlertCircle, Clock, BookOpen, Settings } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "archived";
  batches: string[];
  attendanceResets: number;
}

const initialSemesters: Semester[] = [
  { id: "1", name: "Semester 3 – 2025", startDate: "2025-01-06", endDate: "2025-06-28", status: "active", batches: ["AIML-2024", "DS-2024", "GENAI-2024"], attendanceResets: 1 },
  { id: "2", name: "Semester 2 – 2024", startDate: "2024-07-15", endDate: "2024-12-31", status: "archived", batches: ["AIML-2024", "DS-2024"], attendanceResets: 2 },
  { id: "3", name: "Semester 4 – 2025", startDate: "2025-07-07", endDate: "2025-12-20", status: "upcoming", batches: [], attendanceResets: 0 },
];

export default function SemesterControlPage() {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSem, setNewSem] = useState({ name: "", startDate: "", endDate: "" });

  const showMsg = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const archiveSemester = (id: string) => {
    if (!confirm("Archive this semester? Attendance data will be preserved.")) return;
    setSemesters(sems => sems.map(s => s.id === id ? { ...s, status: "archived" } : s));
    showMsg("success", "Semester archived successfully. Data is preserved.");
  };

  const activateSemester = (id: string) => {
    setSemesters(sems => sems.map(s => ({ ...s, status: s.id === id ? "active" : s.status === "active" ? "archived" : s.status })));
    showMsg("success", "Semester activated. Previous semester auto-archived.");
  };

  const resetAttendance = (id: string) => {
    if (!confirm("Reset attendance counters for this semester? This is irreversible!")) return;
    setSemesters(sems => sems.map(s => s.id === id ? { ...s, attendanceResets: s.attendanceResets + 1 } : s));
    showMsg("info", "Attendance counters reset. All records archived.");
  };

  const addSemester = () => {
    if (!newSem.name || !newSem.startDate || !newSem.endDate) { showMsg("error", "Fill all fields."); return; }
    const s: Semester = { id: Date.now().toString(), name: newSem.name, startDate: newSem.startDate, endDate: newSem.endDate, status: "upcoming", batches: [], attendanceResets: 0 };
    setSemesters([...semesters, s]);
    setNewSem({ name: "", startDate: "", endDate: "" });
    setShowNewForm(false);
    showMsg("success", `Semester "${newSem.name}" created.`);
  };

  const statusConfig = {
    active: { color: "bg-green-500/10 text-green-700 border-green-500/30", icon: <Play className="w-3.5 h-3.5" />, label: "Active" },
    upcoming: { color: "bg-blue-500/10 text-blue-700 border-blue-500/30", icon: <Clock className="w-3.5 h-3.5" />, label: "Upcoming" },
    archived: { color: "bg-[var(--muted)]/20 text-[var(--muted)] border-[var(--outline)]", icon: <Archive className="w-3.5 h-3.5" />, label: "Archived" },
  };

  return (
    <DashboardShell
      title="Semester & Session Control"
      subtitle="Manage academic semesters, session dates, and attendance resets"
      nav={[
        { href: "/dashboard/admin", label: "← Admin Overview" },
        { href: "/dashboard/admin/departments", label: "Departments" },
        { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
        { href: "/dashboard/admin/semester-control", label: "Semester Control" },
      ]}
    >
      {/* Stats */}
      <motion.div className="grid md:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[
          { label: "Active Semester", value: semesters.find(s => s.status === "active")?.name || "None", icon: <Play />, color: "from-green-500 to-emerald-600" },
          { label: "Total Semesters", value: String(semesters.length), icon: <BookOpen />, color: "from-blue-500 to-blue-600" },
          { label: "Upcoming", value: String(semesters.filter(s => s.status === "upcoming").length), icon: <Clock />, color: "from-purple-500 to-violet-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-5 flex items-center gap-4`}>
            <div className="p-3 bg-white/20 rounded-xl">{s.icon}</div>
            <div>
              <p className="text-xl font-bold truncate max-w-36">{s.value}</p>
              <p className="text-sm opacity-80">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-4 rounded-xl border text-sm font-medium ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-700" : message.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-700" : "bg-blue-500/10 border-blue-500/30 text-blue-700"}`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Semester List */}
      <motion.section className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="text-[var(--brand)]" />Semesters</h2>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-5 py-2.5 text-sm font-semibold text-white">
            <Calendar className="w-4 h-4" /> New Semester
          </motion.button>
        </div>

        {showNewForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-5 rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] space-y-4">
            <h3 className="font-bold">New Semester</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[["Name", "name", "text", "e.g. Semester 4 – 2025"], ["Start Date", "startDate", "date", ""], ["End Date", "endDate", "date", ""]].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input type={type} value={newSem[key as keyof typeof newSem]} placeholder={ph}
                    onChange={(e) => setNewSem({ ...newSem, [key]: e.target.value })}
                    className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={addSemester} className="rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-6 py-2.5 text-sm font-semibold text-white">Create</button>
              <button onClick={() => setShowNewForm(false)} className="rounded-full border border-[var(--outline)] px-6 py-2.5 text-sm font-semibold">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {semesters.map((sem, i) => {
            const cfg = statusConfig[sem.status];
            return (
              <motion.div key={sem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{sem.name}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {new Date(sem.startDate).toLocaleDateString()} → {new Date(sem.endDate).toLocaleDateString()}
                    </p>
                    {sem.batches.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sem.batches.map(b => <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-medium">{b}</span>)}
                      </div>
                    )}
                    <p className="text-xs text-[var(--muted)]">Attendance resets: {sem.attendanceResets}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sem.status === "upcoming" && (
                      <button onClick={() => activateSemester(sem.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-700 hover:bg-green-500/20 text-sm font-semibold transition">
                        <Play className="w-4 h-4" /> Activate
                      </button>
                    )}
                    {sem.status === "active" && (
                      <>
                        <button onClick={() => resetAttendance(sem.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 text-sm font-semibold transition">
                          <RotateCcw className="w-4 h-4" /> Reset Attendance
                        </button>
                        <button onClick={() => archiveSemester(sem.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--muted)]/10 text-[var(--muted)] hover:bg-[var(--muted)]/20 text-sm font-semibold transition">
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                      </>
                    )}
                    {sem.status === "archived" && (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--muted)]/10 text-[var(--muted)] text-sm font-semibold">
                        <Archive className="w-4 h-4" /> Archived
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </DashboardShell>
  );
}
