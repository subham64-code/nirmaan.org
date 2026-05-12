"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Phone, Briefcase, AlertCircle, Loader } from "lucide-react";

interface Faculty {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  photo?: string;
  bio?: string;
  department?: string;
  joinDate: string;
  isActive: boolean;
}

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("all");

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm, selectedDesignation]);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/faculty");
      
      if (response.data.success) {
        setFaculty(response.data.data || []);
      } else {
        setError("Failed to load faculty data");
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
      setError("Failed to load faculty members");
    } finally {
      setIsLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = faculty;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by designation
    if (selectedDesignation !== "all") {
      filtered = filtered.filter((f) => f.designation === selectedDesignation);
    }

    setFilteredFaculty(filtered);
  };

  const uniqueDesignations = Array.from(new Set(faculty.map((f) => f.designation)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">Faculty Directory</h1>
          <p className="text-xl text-gray-700">Meet our experienced instructors and mentors</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4 sm:flex sm:gap-4 sm:space-y-0"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
          <select
                        aria-label="Filter by designation"
                        title="Filter faculty by designation"
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="px-4 py-3 rounded-lg border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="all">All Designations</option>
            {uniqueDesignations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Faculty Grid */}
        {filteredFaculty.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFaculty.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
              >
                {/* Photo Section */}
                {member.photo && (
                  <div className="h-48 bg-gradient-to-br from-blue-200 to-indigo-200 overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3 flex items-center gap-1">
                    <Briefcase size={16} />
                    {member.designation}
                  </p>

                  {member.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{member.bio}</p>
                  )}

                  {member.department && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Department:</strong> {member.department}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Mail size={16} />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Phone size={16} />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No faculty members found matching your criteria</p>
          </motion.div>
        )}

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8 text-gray-600"
        >
          <p>
            Showing <strong>{filteredFaculty.length}</strong> of{" "}
            <strong>{faculty.length}</strong> faculty members
          </p>
        </motion.div>
      </div>
    </div>
  );
}
