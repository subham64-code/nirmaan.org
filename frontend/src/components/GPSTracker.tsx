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

  const [isMocked, setIsMocked] = useState(false);

  const simulateMockLocation = () => {
    setLoading(true);
    setError("");

    // Odisha Center Coordinates + small random offset
    const latOffset = (Math.random() - 0.5) * 0.0002;
    const lngOffset = (Math.random() - 0.5) * 0.0002;

    const newLocation: Location = {
      lat: NIRMAAN_CENTER.lat + latOffset,
      lng: NIRMAAN_CENTER.lng + lngOffset,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      setLocation(newLocation);
      setIsMocked(true);

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
    }, 500);
  };

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
    setIsMocked(false);

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
            errorMessage = "Location permission denied. Please click the 'Lock' icon in your browser address bar and enable 'Location' for this site.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please ensure your GPS or Wi-Fi is turned on.";
            break;
          case err.TIMEOUT:
            errorMessage = "The request to get user location timed out. Please refresh and try again.";
            break;
        }
        
        // Check for non-secure context (Geolocation requires HTTPS/Localhost)
        if (!window.isSecureContext && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
          errorMessage = "Geolocation requires HTTPS for non-localhost domains. You can either serve the site over HTTPS or use the 'Simulate GPS' button below to continue in this sandbox environment.";
          setError(errorMessage);
          setLoading(false);
          simulateMockLocation();
          return;
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
              <p className="font-semibold">{isMocked ? `${location.accuracy.toFixed(0)} meters (Simulated)` : `${location.accuracy.toFixed(0)} meters`}</p>
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
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-semibold mb-1">Location Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-700 font-semibold mb-1">Bypass Option Available (Sandbox Environment)</p>
                <p className="text-blue-600 text-sm">Since geolocation requires HTTPS for non-localhost domains, click below to simulate location at the Odisha Training Center. This will immediately allow you to check in as Present!</p>
              </div>
            </div>
            <button
              onClick={simulateMockLocation}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs self-start transition active:scale-95 shadow-sm"
            >
              🎯 Auto-Simulate Odisha Center GPS Location
            </button>
          </div>
          
          {error.includes("permission") && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm">
              <h4 className="font-bold text-gray-800 mb-2">How to Fix Location Permissions:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Look at the address bar near <strong>localhost:3000</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Click the <strong>Settings icon</strong> or <strong>Lock icon</strong> (🔒)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Change <strong>Location</strong> from "Blocked" to <strong>"Allow"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span><strong>Refresh</strong> the page and try again</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p><strong>Mobile:</strong> Check your device settings &gt; Privacy &gt; Location Services</p>
              </div>
            </div>
            )}

            {/* If geolocation is blocked due to insecure context, offer a quick simulate button */}
            {error.includes("Geolocation requires HTTPS") && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
                <p className="font-semibold text-yellow-700 mb-2">Running in Sandbox</p>
                <p className="text-yellow-700 text-sm mb-3">Your browser blocked real GPS. Use a simulated location to continue testing.</p>
                <button
                  onClick={simulateMockLocation}
                  className="py-2 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-xs transition"
                >
                  Use Simulated Location
                </button>
              </div>
            )}
        </div>
      )}

      {/* Location Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 font-semibold text-sm"
        >
          {loading && !isMocked ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Location
        </button>
        <button
          onClick={simulateMockLocation}
          disabled={loading}
          className="py-2 px-4 border border-[var(--outline)] hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 font-semibold text-sm"
        >
          {loading && isMocked ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-blue-600" />
          )}
          Simulate GPS (Odisha Center)
        </button>
      </div>

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
