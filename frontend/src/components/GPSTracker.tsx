"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { googleMapsApiKey, nirmaanMapEmbedUrl } from "@/lib/constants";

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

interface GPSTrackerProps {
  onLocationUpdate?: (location: Location) => void;
  onAttendanceMark?: (status: string, location: Location) => void;
}

// Nirmaan center coordinates (example - adjust to actual location)
const NIRMAAN_CENTER = {
  lat: 20.2961, // Bhubaneswar latitude
  lng: 85.8245, // Bhubaneswar longitude
};

const MAX_DISTANCE_KM = 0.5; // 500 meters radius

export default function GPSTracker({ onLocationUpdate, onAttendanceMark }: GPSTrackerProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent" | "Late" | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };

        setLocation(newLocation);

        // Calculate distance from Nirmaan center
        const dist = calculateDistance(
          newLocation.lat,
          newLocation.lng,
          NIRMAAN_CENTER.lat,
          NIRMAAN_CENTER.lng
        );
        setDistance(dist);

        onLocationUpdate?.(newLocation);
        setLoading(false);
      },
      (err) => {
        let errorMessage = "Failed to get location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationUpdate]);

  const markAttendance = async (status: "Present" | "Absent" | "Late") => {
    if (!location) {
      setError("Please get your location first");
      return;
    }

    try {
      setLoading(true);
      
      await api.post("/attendance/self-checkin", {
        status,
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
        },
        distanceKm: distance,
        note: `Checked in via GPS. Distance from center: ${distance?.toFixed(2)} km`,
      });

      setAttendanceMarked(true);
      setAttendanceStatus(status);
      onAttendanceMark?.(status, location);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setAttendanceMarked(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setError("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const isWithinRange = distance !== null && distance <= MAX_DISTANCE_KM;

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">GPS Attendance Tracker</h2>
          <p className="text-sm text-gray-500">Mark attendance with location verification</p>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="mb-6 rounded-lg overflow-hidden border">
        {location ? (
          <iframe
            width="100%"
            height="250"
            frameBorder="0"
            title="Nirmaan live location map"
            className="border-0"
            src={googleMapsApiKey ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${location.lat},${location.lng}&zoom=16` : nirmaanMapEmbedUrl}
            allowFullScreen
          />
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}
      </div>

      {/* Location Info */}
      {location && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Latitude</p>
              <p className="font-mono font-semibold">{location.lat.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-600">Longitude</p>
              <p className="font-mono font-semibold">{location.lng.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-600">Accuracy</p>
              <p className="font-semibold">{location.accuracy.toFixed(0)} meters</p>
            </div>
            <div>
              <p className="text-gray-600">Distance from Center</p>
              <p className={`font-semibold ${isWithinRange ? "text-green-600" : "text-red-600"}`}>
                {distance?.toFixed(2)} km
                {isWithinRange ? " (Within range)" : " (Out of range)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Refresh Location Button */}
      <button
        onClick={getCurrentLocation}
        disabled={loading}
        className="w-full mb-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Refresh Location
      </button>

      {/* Attendance Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => markAttendance("Present")}
          disabled={loading || !location || !isWithinRange}
          className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Present</span>
        </button>

        <button
          onClick={() => markAttendance("Late")}
          disabled={loading || !location}
          className="py-3 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <Navigation className="h-5 w-5" />
          <span className="text-sm font-medium">Late</span>
        </button>

        <button
          onClick={() => markAttendance("Absent")}
          disabled={loading}
          className="py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Absent</span>
        </button>
      </div>

      {/* Success Message */}
      {attendanceMarked && attendanceStatus && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-700 font-medium">
            Attendance marked as {attendanceStatus}!
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-2">Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Allow location access when prompted</li>
          <li>You must be within 500m of Nirmaan center to mark Present</li>
          <li>GPS accuracy should be less than 100 meters for best results</li>
          <li>Your location is only used for attendance verification</li>
        </ul>
      </div>
    </div>
  );
}
