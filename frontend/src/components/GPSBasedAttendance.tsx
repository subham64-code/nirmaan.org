'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle, AlertCircle, Loader2, Clock, Award } from 'lucide-react';
import axios from 'axios';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface AttendanceCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  geofenceRadiusKm: number;
}

interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    distanceKm: number;
    centerName: string;
    checkInAt: string;
  };
}

export default function GPSBasedAttendance() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [nearbyCenter, setNearbyCenter] = useState<AttendanceCenter | null>(null);
  const [centers] = useState<AttendanceCenter[]>([
    {
      id: 'center-odisha',
      name: 'Nirmaan Training Center - Odisha',
      city: 'Bhubaneswar',
      state: 'Odisha',
      latitude: 20.2961,
      longitude: 85.8245,
      geofenceRadiusKm: 0.5
    },
    {
      id: 'center-gift',
      name: 'GIFT City Training Center',
      city: 'Gandhinagar',
      state: 'Gujarat',
      latitude: 23.2156,
      longitude: 72.6369,
      geofenceRadiusKm: 0.5
    },
    {
      id: 'center-home',
      name: 'Home Learning Center',
      city: 'Online',
      state: 'India',
      latitude: 20.5937,
      longitude: 78.9629,
      geofenceRadiusKm: 5.0
    }
  ]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Request geolocation from user
  const requestLocation = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!navigator.geolocation) {
        setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const geoLocation: GeoLocation = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now()
          };
          setLocation(geoLocation);

          // Check which centers are nearby
          const distances = centers.map(center => ({
            center,
            distance: calculateDistance(latitude, longitude, center.latitude, center.longitude)
          }));

          const nearby = distances.find(
            d => d.distance <= d.center.geofenceRadiusKm
          );

          if (nearby) {
            setNearbyCenter(nearby.center);
            setMessage({
              type: 'success',
              text: `📍 Location detected near ${nearby.center.name} (${nearby.distance.toFixed(2)} km away)`
            });
          } else {
            const closest = distances.reduce((prev, current) =>
              prev.distance < current.distance ? prev : current
            );
            setNearbyCenter(closest.center);
            setMessage({
              type: 'error',
              text: `⚠️ You are ${closest.distance.toFixed(2)} km from the nearest center (${closest.center.name})`
            });
          }

          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMessage({
            type: 'error',
            text: `Location error: ${error.message}. Please enable location access in your browser settings.`
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to get location' });
      setLoading(false);
    }
  };

  // Submit attendance check-in with GPS verification
  const submitCheckIn = async (status: 'Present' | 'Late' | 'Absent' = 'Present') => {
    if (!location) {
      setMessage({ type: 'error', text: 'Location not available. Please enable geolocation.' });
      return;
    }

    setChecking(true);
    setCheckInStatus('checking');
    setMessage(null);

    try {
      const studentName = localStorage.getItem('nirmaan_user_name') || 'Unknown Student';
      const nirmaanId = localStorage.getItem('nirmaan_student_id') || '';

      const distance = nearbyCenter
        ? calculateDistance(
          location.latitude,
          location.longitude,
          nearbyCenter.latitude,
          nearbyCenter.longitude
        )
        : 0;

      const payload = {
        name: studentName,
        nirmaanId,
        status,
        centerId: nearbyCenter?.id || 'general',
        centerName: nearbyCenter?.name || 'General Center',
        city: nearbyCenter?.city || 'India',
        state: nearbyCenter?.state || 'India',
        deviceLat: location.latitude,
        deviceLng: location.longitude,
        deviceAccuracy: location.accuracy,
        distanceKm: distance,
        note: `GPS verified check-in from coordinates (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
        source: 'gps-mobile'
      };

      const response = await axios.post<CheckInResponse>(
        '/api/attendance/check-in',
        payload
      );

      if (response.data.success) {
        setCheckInStatus('verified');
        setLastCheckIn(response.data.data);
        setMessage({
          type: 'success',
          text: `✅ Attendance verified! Status: ${status} at ${response.data.data?.centerName}`
        });

        // Store the check-in status
        localStorage.setItem('last_checkin', JSON.stringify({
          status,
          timestamp: new Date().toISOString(),
          distance,
          center: nearbyCenter?.name
        }));

        // Clear after 3 seconds
        setTimeout(() => {
          setCheckInStatus('idle');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Check-in failed. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      setCheckInStatus('idle');
    } finally {
      setChecking(false);
    }
  };

  // Check if already checked in today
  useEffect(() => {
    const stored = localStorage.getItem('last_checkin');
    if (stored) {
      try {
        setLastCheckIn(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored check-in:', e);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-8 h-8" />
          <h1 className="text-3xl font-bold">GPS-Based Attendance</h1>
        </div>
        <p className="text-blue-100">Check in using your device location</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : message.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {message.type === 'info' && <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">{message.text}</p>
          </div>
        </div>
      )}

      {/* Location Request Card */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Location Access</h2>
          {location && <CheckCircle className="w-6 h-6 text-green-500" />}
        </div>

        {!location ? (
          <button
            onClick={requestLocation}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Requesting Location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Enable Location Access
              </>
            )}
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Latitude:</span> {location.latitude.toFixed(4)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Longitude:</span> {location.longitude.toFixed(4)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Accuracy:</span> ±{location.accuracy.toFixed(1)} meters
            </p>
            {nearbyCenter && (
              <p className="text-sm">
                <span className="font-semibold">Nearest Center:</span> {nearbyCenter.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Check-In Options */}
      {location && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold">Attendance Status</h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => submitCheckIn('Present')}
              disabled={checking}
              className="py-3 px-4 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2"
            >
              {checking && checkInStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Present
            </button>

            <button
              onClick={() => submitCheckIn('Late')}
              disabled={checking}
              className="py-3 px-4 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2"
            >
              {checking && checkInStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Late
            </button>

            <button
              onClick={() => submitCheckIn('Absent')}
              disabled={checking}
              className="py-3 px-4 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2"
            >
              {checking && checkInStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              Absent
            </button>
          </div>
        </div>
      )}

      {/* Today's Check-In Status */}
      {lastCheckIn && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold">Today's Check-In Verified</h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Status:</span> <span className="text-green-700">{lastCheckIn.status}</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Center:</span> {lastCheckIn.center}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Distance:</span> {lastCheckIn.distance?.toFixed(2)} km
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Time:</span> {new Date(lastCheckIn.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Available Centers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Training Centers</h2>
        <div className="space-y-3">
          {centers.map(center => (
            <div key={center.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{center.name}</h3>
                  <p className="text-sm text-gray-600">{center.city}, {center.state}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {center.geofenceRadiusKm} km radius
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
