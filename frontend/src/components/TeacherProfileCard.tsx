"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Phone, Briefcase, Calendar, AlertCircle } from "lucide-react";

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

interface TeacherProfileCardProps {
  teacherName: string;
  compact?: boolean;
}

export default function TeacherProfileCard({ teacherName, compact = false }: TeacherProfileCardProps) {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPicture, setUserPicture] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has an OAuth profile picture
    const picture = typeof window !== "undefined" ? localStorage.getItem("nirmaan_user_picture") : null;
    if (picture) {
      setUserPicture(picture);
    }
    fetchTeacherProfile();
  }, [teacherName]);

  const fetchTeacherProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/faculty/name/${encodeURIComponent(teacherName)}`);
      
      if (response.data.success) {
        setFaculty(response.data.data);
      } else {
        setError("Teacher profile not found");
      }
    } catch (err) {
      console.error("Error fetching teacher profile:", err);
      setError("Failed to load teacher profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-4"
      >
        <div className="animate-pulse">Loading profile...</div>
      </motion.div>
    );
  }

  if (error || !faculty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg"
      >
        <AlertCircle size={18} />
        <span className="text-sm">{error || "Profile not available"}</span>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
      >
        {(userPicture || faculty?.photo) && (
          <img
            src={userPicture || faculty!.photo}
            alt={faculty?.name || teacherName}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{faculty?.name || teacherName}</p>
          <p className="text-xs text-gray-600 truncate">{faculty?.designation || "Teacher"}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Photo Section */}
        {(userPicture || faculty?.photo) && (
          <div className="flex-shrink-0">
            <img
              src={userPicture || faculty!.photo}
              alt={faculty?.name || teacherName}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border-4 border-blue-300 shadow-md hover:shadow-lg transition-shadow"
            />
          </div>
        )}

        {/* Info Section */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{faculty.name}</h3>
          <p className="text-lg text-blue-600 font-semibold mb-4 flex items-center justify-center sm:justify-start gap-2">
            <Briefcase size={20} />
            {faculty.designation}
          </p>

          {faculty.bio && (
            <p className="text-gray-700 mb-4 leading-relaxed">{faculty.bio}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {faculty.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail size={18} className="text-blue-500" />
                <a href={`mailto:${faculty.email}`} className="hover:text-blue-600 break-all">
                  {faculty.email}
                </a>
              </div>
            )}

            {faculty.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={18} className="text-blue-500" />
                <a href={`tel:${faculty.phone}`} className="hover:text-blue-600">
                  {faculty.phone}
                </a>
              </div>
            )}

            {faculty.department && (
              <div className="flex items-center gap-2 text-gray-700">
                <Briefcase size={18} className="text-blue-500" />
                <span>{faculty.department}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} className="text-blue-500" />
              <span>Joined {new Date(faculty.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
