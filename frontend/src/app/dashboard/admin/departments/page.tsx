"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Users, BookOpen, Trash2, Edit3, CheckCircle, AlertCircle } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  students: number;
  faculty: number;
  courses: string[];
}

const initialDepts: Department[] = [
  { id: "1", name: "AI & Machine Learning", code: "AIML", head: "Dr. Ramesh Patel", students: 142, faculty: 8, courses: ["Machine Learning", "Deep Learning", "NLP"] },
  { id: "2", name: "Generative AI", code: "GENAI", head: "Dr. Priya Singh", students: 98, faculty: 5, courses: ["LLMs", "Prompt Engineering", "RAG Systems"] },
  { id: "3", name: "Data Science", code: "DS", head: "Prof. Arjun Verma", students: 102, faculty: 6, courses: ["Statistics", "Python", "Visualization"] },
];

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>(initialDepts);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", code: "", head: "" });

  const addDept = () => {
    if (!form.name || !form.code || !form.head) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }
    const newDept: Department = {
      id: Date.now().toString(),
      name: form.name,
      code: form.code.toUpperCase(),
      head: form.head,
      students: 0,
      faculty: 0,
      courses: [],
    };
    setDepts([...depts, newDept]);
    setForm({ name: "", code: "", head: "" });
    setShowForm(false);
    setMessage({ type: "success", text: `Department "${form.name}" created successfully!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteDept = (id: string) => {
    if (!confirm("Delete this department? This cannot be undone.")) return;
    setDepts(depts.filter((d) => d.id !== id));
    setMessage({ type: "success", text: "Department removed." });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <DashboardShell
      title="Department Management"
      subtitle="Create and manage college departments, assign faculty and students"
      nav={[
        { href: "/dashboard/admin", label: "← Admin Overview" },
        { href: "/dashboard/admin/departments", label: "Departments" },
        { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
        { href: "/dashboard/admin/semester-control", label: "Semester Control" },
      ]}
    >
      {/* Stats */}
      <motion.div className="grid gap-4 md:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[
          { label: "Total Departments", value: depts.length, icon: <Building2 />, color: "from-blue-500 to-blue-600" },
          { label: "Total Students", value: depts.reduce((a, d) => a + d.students, 0), icon: <Users />, color: "from-green-500 to-emerald-600" },
          { label: "Total Faculty", value: depts.reduce((a, d) => a + d.faculty, 0), icon: <BookOpen />, color: "from-purple-500 to-violet-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-6 flex items-center gap-4`}>
            <div className="p-3 bg-white/20 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-4 rounded-xl border ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Add Department */}
      <motion.section className="glass p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="text-[var(--brand)]" />Departments</h2>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-5 py-2.5 text-sm font-semibold text-white">
            <Plus className="w-4 h-4" /> Add Department
          </motion.button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-5 rounded-xl border border-[var(--outline)] bg-[var(--surface-2)] space-y-4">
            <h3 className="font-bold text-lg">New Department</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[["Department Name", "name", "e.g. Computer Science"], ["Code", "code", "e.g. CS"], ["Department Head", "head", "e.g. Dr. John Doe"]].map(([label, key, placeholder]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={addDept} className="rounded-full bg-gradient-to-r from-[var(--brand)] to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">Create Department</button>
              <button onClick={() => setShowForm(false)} className="rounded-full border border-[var(--outline)] px-6 py-2.5 text-sm font-semibold hover:bg-[var(--surface)]">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4">
          {depts.map((dept, i) => (
            <motion.div key={dept.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--brand)]/20 to-purple-500/20 text-[var(--brand)] font-bold text-sm">{dept.code}</div>
                  <div>
                    <h3 className="text-lg font-bold">{dept.name}</h3>
                    <p className="text-sm text-[var(--muted)]">Head: {dept.head}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><Users className="w-3.5 h-3.5" />{dept.students} students</span>
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400"><BookOpen className="w-3.5 h-3.5" />{dept.faculty} faculty</span>
                    </div>
                    {dept.courses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dept.courses.map((c) => (
                          <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-medium">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteDept(dept.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </DashboardShell>
  );
}
