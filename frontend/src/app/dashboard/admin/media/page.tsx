"use client";

import { useState, useEffect, useRef } from "react";
import { api, authHeader } from "@/lib/api";
import DashboardShell from "@/components/DashboardShell";
import { motion } from "framer-motion";
import { Upload, Trash2, Eye, FileText, Image as ImageIcon, Video } from "lucide-react";

type MediaRow = {
  _id: string;
  category: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  createdBy?: string;
};

export default function MediaManagerPage() {
  const [mediaList, setMediaList] = useState<MediaRow[]>([]);
  const [category, setCategory] = useState<"about" | "gallery" | "trainer" | "inauguration" | "video" | "questions" | "syllabus">("about");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"image" | "video" | "document">("image");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/media", { headers: authHeader(token) });
        setMediaList(response.data.data || []);
      } catch {
        setMessage("Failed to load media.");
      }
    };
    load();
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !title) {
      setMessage("Select file and enter title.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("title", title);
    formData.append("type", type);

    try {
      const response = await api.post("/media/upload", formData, {
        headers: { ...authHeader(token), "Content-Type": "multipart/form-data" },
      });
      setMediaList((prev) => [response.data.data, ...prev]);
      setTitle("");
      setMessage("✓ Uploaded successfully to global storage.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media permanently?")) return;
    try {
      await api.delete(`/media/${id}`, { headers: authHeader(token) });
      setMediaList((prev) => prev.filter((m) => m._id !== id));
      setMessage("✓ Media deleted.");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Delete failed.");
    }
  };

  const filtered = mediaList.filter((m) => {
    const matchCategory = !category || m.category === category;
    const matchSearch = !searchTerm || m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case "video":
        return <Video className="w-5 h-5 text-red-500" />;
      case "document":
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <DashboardShell
      title="Global Media Manager"
      subtitle="Upload and organize media for all sections - Questions, Syllabus, Images & Videos"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/media", label: "Media" },
      ]}
    >
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          className="md:col-span-3 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Upload Section */}
          <motion.div
            className="glass p-6 rounded-2xl border-2 border-dashed border-[var(--brand)]/30"
            whileHover={{ borderColor: "var(--brand)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-[var(--brand)]" />
              <h3 className="text-lg font-semibold">Upload New Media to Global Storage</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase text-[var(--muted)] mb-2 block">Title</label>
                <input
                  title="Enter media title"
                  className="w-full rounded-lg border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  placeholder="e.g., 'Machine Learning Basics'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase text-[var(--muted)] mb-2 block">Category</label>
                <select
                  title="Select media category"
                  aria-label="Media category"
                  className="w-full rounded-lg border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="about">About</option>
                  <option value="gallery">Gallery</option>
                  <option value="trainer">Trainer</option>
                  <option value="inauguration">Inauguration</option>
                  <option value="video">Videos</option>
                  <option value="questions">Questions</option>
                  <option value="syllabus">Syllabus</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-[var(--muted)] mb-2 block">Type</label>
                <select
                  title="Select media type"
                  aria-label="Media type"
                  className="w-full rounded-lg border border-[var(--outline)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document (PDF, Word, etc)</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-[var(--muted)] mb-2 block">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  title="Select a file to upload"
                  aria-label="Upload media file"
                  accept={type === "image" ? "image/*" : type === "video" ? "video/*" : ".pdf,.doc,.docx,.xlsx,.xls"}
                  onChange={handleUpload}
                  disabled={uploading}
                  className="w-full rounded-lg border border-[var(--outline)] p-3 text-sm file:bg-[var(--brand)] file:text-white file:border-0 file:px-3 file:py-1 file:rounded cursor-pointer"
                />
              </div>
            </div>
            {message && (
              <motion.p
                className={`mt-3 text-sm ${
                  message.includes("✓") ? "text-green-600" : "text-red-600"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {message}
              </motion.p>
            )}
          </motion.div>

          {/* Media List */}
          <motion.div
            className="glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Global Storage ({filtered.length})</h3>
              <input
                type="text"
                title="Search media"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[var(--outline)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] w-48"
              />
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted)]">
                  <p>No media uploaded yet in this category.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((media, i) => (
                    <motion.div
                      key={media._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-[var(--outline)] hover:bg-[var(--surface-2)] transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getIcon(media.type)}
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{media.title}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {media.category} • {media.type} • {new Date(media.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                          title="View file"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </a>
                        <button
                          onClick={() => handleDelete(media._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar Guidelines */}
        <motion.div
          className="glass p-6 rounded-2xl h-fit sticky top-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-semibold mb-4">Upload Guidelines</p>
          <div className="space-y-4 text-xs text-[var(--muted)]">
            <div>
              <p className="font-semibold text-white mb-1">📷 Images</p>
              <p>PNG, JPG, WebP - Max 10MB</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">🎬 Videos</p>
              <p>MP4, WebM - Max 100MB</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">📄 Documents</p>
              <p>PDF, Word, Excel - Max 20MB</p>
            </div>
            <div className="pt-3 border-t border-[var(--outline)]">
              <p className="font-semibold text-white mb-2">✨ Best Practices</p>
              <ul className="space-y-1">
                <li>• Use descriptive titles</li>
                <li>• Organize by category</li>
                <li>• Check before uploading</li>
                <li>• Keep versions clean</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
