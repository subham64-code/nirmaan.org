"use client";

import { useState } from "react";
import { Download, FileText, Filter, Search, BookOpen, Calendar, Clock } from "lucide-react";

interface Note {
  id: string;
  title: string;
  subject: string;
  type: "lecture" | "assignment" | "exam" | "announcement";
  date: string;
  fileSize: string;
  downloadUrl: string;
  instructor: string;
  course: string;
  description: string;
}

const mockNotes: Note[] = [
  {
    id: "note1",
    title: "Introduction to Neural Networks",
    subject: "Deep Learning Fundamentals",
    type: "lecture",
    date: "2024-01-15",
    fileSize: "2.5 MB",
    downloadUrl: "/notes/neural-networks-intro.pdf",
    instructor: "Mihir Pattanaik",
    course: "Deep Learning",
    description: "Comprehensive introduction to neural network architecture, activation functions, and backpropagation algorithms with practical examples."
  },
  {
    id: "note2",
    title: "CNN Architecture Deep Dive",
    subject: "Computer Vision",
    type: "lecture",
    date: "2024-01-18",
    fileSize: "3.2 MB",
    downloadUrl: "/notes/cnn-architecture.pdf",
    instructor: "Kalpa Pandit",
    course: "Deep Learning",
    description: "Detailed explanation of Convolutional Neural Networks, pooling layers, and practical implementation using TensorFlow."
  },
  {
    id: "note3",
    title: "Mid-term Assignment",
    subject: "Deep Learning",
    type: "assignment",
    date: "2024-01-20",
    fileSize: "1.8 MB",
    downloadUrl: "/assignments/dl-midterm.pdf",
    instructor: "Mihir Pattanaik",
    course: "Deep Learning",
    description: "Complete the CNN implementation project and submit with detailed documentation and performance analysis."
  },
  {
    id: "note4",
    title: "Transformers and Attention Mechanisms",
    subject: "Advanced NLP",
    type: "lecture",
    date: "2024-01-22",
    fileSize: "4.1 MB",
    downloadUrl: "/notes/transformers-attention.pdf",
    instructor: "Kalpa Pandit",
    course: "NLP",
    description: "In-depth coverage of transformer architecture, self-attention, and practical applications in NLP tasks."
  },
  {
    id: "note5",
    title: "Final Exam Preparation",
    subject: "Deep Learning",
    type: "exam",
    date: "2024-01-25",
    fileSize: "2.8 MB",
    downloadUrl: "/exams/dl-final-prep.pdf",
    instructor: "Mihir Pattanaik",
    course: "Deep Learning",
    description: "Comprehensive review of all topics covered in the Deep Learning module with practice questions and solutions."
  },
  {
    id: "note6",
    title: "Communication Skills Workshop",
    subject: "Soft Skills",
    type: "lecture",
    date: "2024-01-16",
    fileSize: "1.5 MB",
    downloadUrl: "/notes/communication-workshop.pdf",
    instructor: "Krishan Kumar",
    course: "Soft Skills",
    description: "Interactive workshop covering verbal communication, presentation skills, and professional etiquette."
  },
  {
    id: "note7",
    title: "Resume Building Guidelines",
    subject: "Career Development",
    type: "announcement",
    date: "2024-01-10",
    fileSize: "0.8 MB",
    downloadUrl: "/guides/resume-guidelines.pdf",
    instructor: "Placement Coordinator",
    course: "Soft Skills",
    description: "Step-by-step guide to creating professional resumes with templates and best practices."
  }
];

export default function ViewNotes() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lecture" | "assignment" | "exam" | "announcement">("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "size">("date");

  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || note.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "size":
        return parseFloat(b.fileSize) - parseFloat(a.fileSize);
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lecture":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "assignment":
        return <FileText className="w-4 h-4 text-orange-500" />;
      case "exam":
        return <Calendar className="w-4 h-4 text-red-500" />;
      case "announcement":
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "assignment":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "exam":
        return "bg-red-100 text-red-700 border-red-200";
      case "announcement":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const downloadNote = (note: Note) => {
    // Open in new tab for now since files don't exist
    window.open(note.downloadUrl, '_blank');
  };

  return (
    <div className="section">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl mb-4">📋 Study Notes & Materials</h1>
        <p className="max-w-3xl mx-auto text-lg text-[var(--muted)] leading-relaxed">
          Access all your course materials, lecture notes, assignments, and exam preparation 
          resources in one organized location. Download, view, and study efficiently.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="glass p-6 rounded-2xl mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
            >
              <option value="all">All Types</option>
              <option value="lecture">📚 Lectures</option>
              <option value="assignment">📝 Assignments</option>
              <option value="exam">📋 Exams</option>
              <option value="announcement">📢 Announcements</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-[var(--outline)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
            >
              <option value="date">📅 Sort by Date</option>
              <option value="title">🔤 Sort by Title</option>
              <option value="size">📊 Sort by Size</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedNote(note)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(note.type)}`}>
                  {getTypeIcon(note.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{note.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{note.subject}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                note.type === "lecture" ? "bg-blue-100 text-blue-700" :
                note.type === "assignment" ? "bg-orange-100 text-orange-700" :
                note.type === "exam" ? "bg-red-100 text-red-700" :
                "bg-green-100 text-green-700"
              }`}>
                {note.type}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Calendar className="w-4 h-4" />
                <span>{note.date}</span>
                <span className="ml-auto">{note.fileSize}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <BookOpen className="w-4 h-4" />
                <span>{note.course}</span>
                <span className="ml-auto">{note.instructor}</span>
              </div>
              
              <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
                {note.description}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => downloadNote(note)}
                className="flex-1 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setSelectedNote(note)}
                className="flex-1 px-4 py-2 border border-[var(--outline)] rounded-lg hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Note Details Modal */}
      {selectedNote && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNote(null)}
        >
          <div 
            className="glass p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getTypeColor(selectedNote.type)}`}>
                  {getTypeIcon(selectedNote.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <p className="text-sm text-[var(--muted)]">{selectedNote.subject}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">📅 Date & Size</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {selectedNote.date}</p>
                    <p><strong>File Size:</strong> {selectedNote.fileSize}</p>
                    <p><strong>Type:</strong> {selectedNote.type.charAt(0).toUpperCase() + selectedNote.type.slice(1)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">📚 Course & Instructor</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Course:</strong> {selectedNote.course}</p>
                    <p><strong>Instructor:</strong> {selectedNote.instructor}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">📄 Description</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {selectedNote.description}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => downloadNote(selectedNote)}
                className="flex-1 px-6 py-3 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Note
              </button>
              <button
                onClick={() => window.open(selectedNote.downloadUrl, '_blank')}
                className="flex-1 px-6 py-3 border border-[var(--outline)] rounded-lg hover:bg-[var(--surface-2)] transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
