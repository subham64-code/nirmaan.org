'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, CheckCircle, AlertCircle, Loader2, Clock, Award, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

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

interface GPSBasedAttendanceProps {
  compact?: boolean;
}

export default function GPSBasedAttendance({ compact = false }: GPSBasedAttendanceProps) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [nearbyCenter, setNearbyCenter] = useState<AttendanceCenter | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const centers: AttendanceCenter[] = [
    {
      id: 'center-odisha',
      name: 'Nirmaan Training Center – Odisha',
      city: 'Bhubaneswar',
      state: 'Odisha',
      latitude: 20.2961,
      longitude: 85.8245,
      geofenceRadiusKm: 0.5,
    },
    {
      id: 'center-gift',
      name: 'GIFT City Training Center',
      city: 'Gandhinagar',
      state: 'Gujarat',
      latitude: 23.2156,
      longitude: 72.6369,
      geofenceRadiusKm: 0.5,
    },
    {
      id: 'center-home',
      name: 'Home Learning Center',
      city: 'Online',
      state: 'India',
      latitude: 20.5937,
      longitude: 78.9629,
      geofenceRadiusKm: 5.0,
    },
  ];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const findNearestCenter = (lat: number, lng: number) => {
    const distances = centers.map((center) => ({
      center,
      distance: calculateDistance(lat, lng, center.latitude, center.longitude),
    }));
    const nearby = distances.find((d) => d.distance <= d.center.geofenceRadiusKm);
    const closest = distances.reduce((prev, cur) => (prev.distance < cur.distance ? prev : cur));
    setNearbyCenter(nearby?.center || closest.center);
    if (nearby) {
      setMessage({ type: 'success', text: `📍 Inside ${nearby.center.name} (${nearby.distance.toFixed(2)} km away)` });
    } else {
      setMessage({ type: 'error', text: `⚠️ ${closest.distance.toFixed(2)} km from nearest center (${closest.center.name})` });
    }
  };

  const [isMocked, setIsMocked] = useState(false);

  const simulateMockLocation = (centerId: string) => {
    setLoading(true);
    setMessage(null);
    const selectedCenter = centers.find((c) => c.id === centerId) || centers[0];

    // Add a tiny random offset to make it look realistic (within the center geofence)
    const latOffset = (Math.random() - 0.5) * 0.0002;
    const lngOffset = (Math.random() - 0.5) * 0.0002;

    const geo: GeoLocation = {
      latitude: selectedCenter.latitude + latOffset,
      longitude: selectedCenter.longitude + lngOffset,
      accuracy: 12.5,
      timestamp: Date.now(),
    };

    setTimeout(() => {
      setLocation(geo);
      setIsMocked(true);
      findNearestCenter(geo.latitude, geo.longitude);
      setLoading(false);
      setMessage({
        type: 'success',
        text: `📍 GPS Simulated successfully at ${selectedCenter.name}!`,
      });
    }, 500);
  };

  const requestLocation = () => {
    setLoading(true);
    setMessage(null);
    setIsMocked(false);
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo: GeoLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };
        setLocation(geo);
        findNearestCenter(geo.latitude, geo.longitude);
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Failed to acquire location.';
        if (err.code === 1) { // PERMISSION_DENIED
          errorMsg = 'Location access denied. Click the "Lock" (🔒) icon in your address bar and change Location to "Allow", then refresh.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMsg = 'Location information is unavailable. Check your device GPS signal or network connection.';
        } else if (err.code === 3) { // TIMEOUT
          errorMsg = 'Location request timed out. Please try again or refresh the page.';
        }

        // Check for non-secure context
        if (!window.isSecureContext && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
          errorMsg = 'Geolocation requires HTTPS for non-localhost domains. Please access via HTTPS or use localhost for development.';
        }
        setMessage({ type: 'error', text: `📍 ${errorMsg}` });
        if (errorMsg.includes('Geolocation requires HTTPS')) {
          simulateMockLocation('center-odisha');
          return;
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const submitCheckIn = async (status: 'Present' | 'Late' | 'Absent' = 'Present') => {
    if (!location) {
      setMessage({ type: 'error', text: 'Location not available. Please enable geolocation first.' });
      return;
    }
    setChecking(true);
    setCheckInStatus('checking');
    setMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_token') || '' : '';
      const studentName = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_user_name') || 'Unknown' : 'Unknown';
      const nirmaanId = typeof window !== 'undefined' ? localStorage.getItem('nirmaan_student_id') || '' : '';
      const distance = nearbyCenter
        ? calculateDistance(location.latitude, location.longitude, nearbyCenter.latitude, nearbyCenter.longitude)
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
        note: `GPS check-in (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
        source: 'gps-mobile',
      };
      try {
        const response = await api.post<CheckInResponse>('/attendance/check-in', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setCheckInStatus('verified');
          const record = { status, timestamp: new Date().toISOString(), distance, center: nearbyCenter?.name };
          setLastCheckIn(record);
          localStorage.setItem('last_checkin', JSON.stringify(record));
          setMessage({ type: 'success', text: `✅ Attendance verified! Status: ${status}` });
          setTimeout(() => setCheckInStatus('idle'), 3000);
        } else {
          setMessage({ type: 'error', text: response.data.message });
        }
      } catch {
        // Offline/mock mode
        const record = { status, timestamp: new Date().toISOString(), distance, center: nearbyCenter?.name };
        setLastCheckIn(record);
        localStorage.setItem('last_checkin', JSON.stringify(record));
        setCheckInStatus('verified');
        setMessage({ type: 'success', text: `✅ Attendance recorded locally (offline mode): ${status}` });
        setTimeout(() => setCheckInStatus('idle'), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Check-in failed. Please try again.' });
      setCheckInStatus('idle');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('last_checkin');
    if (stored) {
      try { setLastCheckIn(JSON.parse(stored)); } catch {}
    }
  }, []);

  if (compact) {
    return (
      <div className="glass p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">GPS Check-In</h3>
            <p className="text-xs text-[var(--muted)]">{location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Location not acquired'}</p>
          </div>
          {location && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
        </div>
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : message.type === 'error' ? 'bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
            {message.text}
          </div>
        )}
        {!location ? (
          <div className="space-y-2">
            <button onClick={requestLocation} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Locating...</> : <><Navigation className="w-4 h-4" />Get My Location</>}
            </button>
            <button onClick={() => simulateMockLocation('center-odisha')} disabled={loading} className="w-full py-2 text-xs font-semibold rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition">
              Simulate GPS (Odisha Center)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(['Present', 'Late', 'Absent'] as const).map((s) => (
              <button key={s} onClick={() => submitCheckIn(s)} disabled={checking}
                className={`py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition ${s === 'Present' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : s === 'Late' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>
                {checking && checkInStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-8 h-8" />
          <h2 className="text-3xl font-bold">GPS-Based Attendance</h2>
        </div>
        <p className="text-blue-100">Check in using your device&apos;s location with geofencing verification</p>
      </div>

      {/* Message */}
      {message && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400' : message.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400' : 'bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400'}`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            {message.type === 'info' && <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="font-medium">{message.text}</p>
          </div>

          {message.type === 'error' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Navigation className="h-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 dark:text-blue-400 font-bold mb-1">Sandbox Geolocation Bypass Available</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Browser has blocked standard geolocation (e.g. non-HTTPS). Click below to immediately simulate Odisha Center and check-in!</p>
                </div>
              </div>
              <button
                onClick={() => simulateMockLocation('center-odisha')}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs self-start transition active:scale-95 shadow-sm"
              >
                🎯 Auto-Simulate Odisha Center GPS Location
              </button>
            </div>
          )}

          {message.type === 'error' && message.text.includes('denied') && (
            <div className="glass p-4 rounded-xl text-sm border-l-4 border-blue-500">
              <h4 className="font-bold mb-2">Troubleshooting Location Permissions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-[var(--muted)]">
                <li>Click the <strong>Settings/Lock</strong> icon in the address bar</li>
                <li>Ensure <strong>Location</strong> is set to <strong>"Allow"</strong></li>
                <li><strong>Refresh</strong> the browser page</li>
                <li>If on mobile, ensure <strong>Location Services</strong> are ON in device settings</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Location Card */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Location Access</h3>
          <div className="flex items-center gap-2">
            {location && <CheckCircle className="w-6 h-6 text-green-500" />}
            {location && (
              <button onClick={requestLocation} disabled={loading} className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition" title="Refresh location">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
        {!location ? (
          <button onClick={requestLocation} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Requesting Location...</> : <><Navigation className="w-5 h-5" />Enable Location Access</>}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Latitude', location.latitude.toFixed(6)], ['Longitude', location.longitude.toFixed(6)], ['Accuracy', isMocked ? `±${location.accuracy.toFixed(1)} m (Simulated)` : `±${location.accuracy.toFixed(1)} m`], ['Nearest Center', nearbyCenter?.name || 'Detecting...']].map(([label, value]) => (
              <div key={String(label)} className="p-3 rounded-xl border border-[var(--outline)] bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{label}</p>
                <p className="font-semibold mt-1 truncate">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-[var(--outline)] pt-4">
          <p className="text-xs text-[var(--muted)] font-semibold uppercase mb-2">GPS Location Simulator (Testing)</p>
          <div className="flex flex-wrap gap-2">
            {centers.map(center => (
              <button
                key={center.id}
                onClick={() => simulateMockLocation(center.id)}
                disabled={loading || checking}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--outline)] hover:border-[var(--brand)] hover:bg-[var(--surface-2)] font-semibold transition"
              >
                Simulate {center.city} Center
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Check-In Options */}
      {location && (
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold">Mark Attendance</h3>
          <div className="grid grid-cols-3 gap-4">
            {([['Present', 'from-green-500 to-emerald-600'], ['Late', 'from-yellow-500 to-orange-500'], ['Absent', 'from-red-500 to-rose-600']] as const).map(([s, grad]) => (
              <button key={s} onClick={() => submitCheckIn(s as any)} disabled={checking}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl bg-gradient-to-br ${grad} text-white font-semibold hover:opacity-90 disabled:opacity-50 transition`}>
                {checking && checkInStatus === 'checking' ? <Loader2 className="w-5 h-5 animate-spin" /> : s === 'Present' ? <CheckCircle className="w-5 h-5" /> : s === 'Late' ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Last Check-In */}
      {lastCheckIn && (
        <div className="glass p-6 rounded-2xl border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-bold">Last Check-In</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Status', lastCheckIn.status], ['Center', lastCheckIn.center], ['Distance', `${lastCheckIn.distance?.toFixed(2) ?? 'N/A'} km`], ['Time', new Date(lastCheckIn.timestamp).toLocaleTimeString()]].map(([label, val]) => (
              <div key={String(label)}>
                <p className="text-xs text-[var(--muted)] uppercase">{label}</p>
                <p className="font-semibold mt-1">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Centers */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-4">Registered Training Centers</h3>
        <div className="space-y-3">
          {centers.map((center) => (
            <div key={center.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--outline)] hover:bg-[var(--surface-2)] transition">
              <div>
                <h4 className="font-semibold">{center.name}</h4>
                <p className="text-sm text-[var(--muted)]">{center.city}, {center.state}</p>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold">
                {center.geofenceRadiusKm} km radius
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
