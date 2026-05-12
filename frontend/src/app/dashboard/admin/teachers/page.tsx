"use client";

import { useState, useEffect } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";

type TeacherRow = {
  _id: string;
  name: string;
  email: string;
  role: "teacher";
  phone: string;
  course: string;
  lastLoginAt?: string;
};

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", course: "" });
  const [message, setMessage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/students/search?q=", { headers: authHeader(token) });
        const allUsers = response.data.data || [];
        const filteredTeachers = allUsers.filter((u: any) => u.role === "teacher");
        setTeachers(filteredTeachers);
      } catch {
        setMessage("Failed to load teachers.");
      }
    };
    load();
  }, [token]);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setMessage("Name and email are required.");
      return;
    }

    try {
      if (editId) {
        await api.patch(
          `/students/${editId}`,
          formData,
          { headers: authHeader(token) }
        );
        setTeachers((prev) =>
          prev.map((t) => (t._id === editId ? { ...t, ...formData } : t))
        );
        setMessage("Teacher updated.");
      } else {
        const response = await api.post(
          "/auth/register-teacher",
          formData,
          { headers: authHeader(token) }
        );
        setTeachers((prev) => [...prev, response.data.data]);
        setMessage("Teacher created.");
      }
      setFormData({ name: "", email: "", phone: "", course: "" });
      setFormVisible(false);
      setEditId(null);
    } catch {
      setMessage("Save failed.");
    }
  };

  const handleEdit = (teacher: TeacherRow) => {
    setFormData({ name: teacher.name, email: teacher.email, phone: teacher.phone, course: teacher.course });
    setEditId(teacher._id);
    setFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try {
      await api.delete(`/students/${id}`, { headers: authHeader(token) });
      setTeachers((prev) => prev.filter((t) => t._id !== id));
      setMessage("Teacher deleted.");
    } catch {
      setMessage("Delete failed.");
    }
  };

  return (
    <DashboardShell
      title="Teacher Management"
      subtitle="Add, edit, and remove trainers and instructors"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/media", label: "Media" },
      ]}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <button
            onClick={() => {
              setFormVisible(!formVisible);
              if (!formVisible) {
                setEditId(null);
                setFormData({ name: "", email: "", phone: "", course: "" });
              }
            }}
            className="mb-4 rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white"
          >
            {formVisible ? "Cancel" : "Add New Teacher"}
          </button>

          {formVisible && (
            <div className="glass mb-6 p-5">
              <input
                className="mb-3 w-full rounded-lg border border-[var(--outline)] p-3 text-sm"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="mb-3 w-full rounded-lg border border-[var(--outline)] p-3 text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                className="mb-3 w-full rounded-lg border border-[var(--outline)] p-3 text-sm"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                className="mb-3 w-full rounded-lg border border-[var(--outline)] p-3 text-sm"
                placeholder="Course/Specialization"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
              <button
                onClick={handleSave}
                className="w-full rounded-full bg-green-600 py-2 text-sm font-semibold text-white"
              >
                {editId ? "Update" : "Create"} Teacher
              </button>
            </div>
          )}

          <div className="glass divide-y divide-[var(--outline)]">
            {teachers.length === 0 ? (
              <p className="p-4 text-sm text-[var(--muted)]">No teachers yet.</p>
            ) : (
              teachers.map((teacher) => (
                <div key={teacher._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{teacher.name}</p>
                    <p className="text-xs text-[var(--muted)]">{teacher.email} • {teacher.phone}</p>
                    <p className="text-xs text-[var(--brand)]">{teacher.course || "General"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="rounded-full border border-[var(--outline)] px-3 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="rounded-full border border-red-600 px-3 py-1 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-5 h-fit">
          <p className="text-sm text-[var(--muted)]">
            Teachers can create tests, mark attendance, and upload performance assessments.
          </p>
          <p className="mt-3 text-xs text-[var(--brand)]">{message}</p>
        </div>
      </div>
    </DashboardShell>
  );
}
