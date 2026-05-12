'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MapPin, Calendar, Clock, AlertCircle, Loader2, Filter } from 'lucide-react';
import axios from 'axios';

interface AttendanceVerification {
  _id: string;
  name: string;
  nirmaanId: string;
  status: string;
  dateKey: string;
  checkInAt: string;
  centerName: string;
  deviceLat: number;
  deviceLng: number;
  deviceAccuracy: number;
  distanceKm: number;
  source: string;
  verified: boolean;
  verificationApprovedBy?: string;
  verificationApprovedAt?: string;
}

export default function AttendanceVerificationReport() {
  const [records, setRecords] = useState<AttendanceVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/attendance/report?date=${selectedDate}`);
      setRecords(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch records:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load attendance records'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAttendance = async (recordId: string, isValid: boolean) => {
    try {
      setVerifyingId(recordId);
      const response = await axios.post(`/api/attendance/${recordId}/verify`, {
        verified: isValid,
        verificationMethod: 'gps-check'
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Attendance ${isValid ? 'approved' : 'rejected'} successfully`
        });
        fetchAttendanceRecords();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to verify attendance'
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredRecords = records.filter(record => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'Present').length,
    absent: filteredRecords.filter(r => r.status === 'Absent').length,
    late: filteredRecords.filter(r => r.status === 'Late').length,
    verified: filteredRecords.filter(r => r.verified).length
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Attendance Verification Report</h1>
        <p className="text-indigo-100">Review and approve GPS-verified attendance records</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Filters & Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="attendance-verification-date" className="block text-sm font-semibold mb-2">Select Date</label>
            <input
              id="attendance-verification-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              aria-label="Select date"
            />
          </div>

          <div>
            <label htmlFor="attendance-verification-status" className="block text-sm font-semibold mb-2">Filter by Status</label>
            <select
              id="attendance-verification-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAttendanceRecords}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Refresh Records
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Verified</p>
            <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Records Table */}
      {!loading && filteredRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Student Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Nirmaan ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Center</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Check-In Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Distance (km)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Accuracy</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm">{record.name}</td>
                    <td className="py-3 px-4 text-sm font-mono text-xs">{record.nirmaanId}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{record.centerName}</td>
                    <td className="py-3 px-4 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {new Date(record.checkInAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`${
                          record.distanceKm <= 0.5
                            ? 'text-green-600 font-semibold'
                            : 'text-orange-600'
                        }`}
                      >
                        {record.distanceKm?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`${
                          record.deviceAccuracy < 50
                            ? 'text-green-600'
                            : record.deviceAccuracy < 100
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        ±{record.deviceAccuracy?.toFixed(0) || 'N/A'}m
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm space-x-2 flex">
                      {!record.verified && (
                        <>
                          <button
                            onClick={() => verifyAttendance(record._id, true)}
                            disabled={verifyingId === record._id}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                          >
                            {verifyingId === record._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => verifyAttendance(record._id, false)}
                            disabled={verifyingId === record._id}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                          >
                            {verifyingId === record._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                      {record.verified && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No records found</h3>
          <p className="text-gray-500">No attendance records for the selected date and filter</p>
        </div>
      )}
    </div>
  );
}
