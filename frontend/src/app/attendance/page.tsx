"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Camera, MapPinned, Satellite, ShieldCheck, Smartphone } from "lucide-react";
import { api } from "@/lib/api";
import IndiaAttendanceMap from "@/components/IndiaAttendanceMap";
import { nirmaanMapEmbedUrl } from "@/lib/constants";
import {
  attendanceCenters,
  attendanceMedia,
  findNearestCenter,
} from "@/lib/attendance-data";

const getStatusBadgeClass = (status: "Healthy" | "Attention" | "Offline") => {
  if (status === "Healthy") {
    return "status-badge-healthy";
  }

  if (status === "Attention") {
    return "status-badge-attention";
  }

  return "status-badge-offline";
};

const getProgressWidthClass = (attendanceRate: number) => {
  const bucket = Math.max(0, Math.min(100, Math.round(attendanceRate / 5) * 5));
  return `progress-width-${bucket}`;
};

type CenterSummary = {
  centerId: string;
  centerName: string;
  city: string;
  state: string;
  total: number;
  present: number;
  attendanceRate: number;
  latestCheckIn?: string;
};

type AttendanceSummary = {
  totals: {
    allTime: number;
    today: number;
    todayPresent: number;
    averageDistanceKm: number;
    centerCount: number;
  };
  centerStats: CenterSummary[];
  recentRecords: Array<{
    _id: string;
    name: string;
    nirmaanId?: string;
    status: string;
    centerId: string;
    centerName: string;
    city: string;
    state: string;
    locationName: string;
    mediaTitle: string;
    mediaType: string;
    distanceKm?: number;
    checkInAt: string;
  }>;
};

const regionalCards = [
  {
    title: "GIFT BBSR Hub",
    text: "GIFT Bhubaneswar hub is monitored for class punctuality and attendance tracking with real-time updates.",
  },
  {
    title: "AI Training Center",
    text: "GIFT center feeds into a shared attendance dashboard for admins and trainers with live monitoring.",
  },
  {
    title: "Placement Support",
    text: "GIFT BBSR hub shows high activity for training, assessments, and placement preparation programs.",
  },
];

const actionTiles = [
  {
    icon: Smartphone,
    title: "Student check-in",
    text: "Scan QR code, verify location, and capture a timed attendance event.",
    href: "/login/student",
  },
  {
    icon: ShieldCheck,
    title: "Trainer approval",
    text: "Review flagged entries, approve manual corrections, and keep logs clean.",
    href: "/login/teacher",
  },
  {
    icon: BarChart3,
    title: "Admin overview",
    text: "See attendance trends, center health, and sync feeds into the dashboard.",
    href: "/dashboard/admin/attendance",
  },
];

type GpsState = {
  loading: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  nearestCenterId?: string;
  nearestCenterName?: string;
  nearestDistanceKm?: number;
  message?: string;
};

type CheckInFormState = {
  name: string;
  nirmaanId: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  note: string;
  centerId: string;
  mediaId: string;
};

const DEFAULT_CENTER_ID = attendanceCenters[0]?.id || "general";

export default function AttendancePage() {
  const [gps, setGps] = useState<GpsState>({ loading: false });
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [checkInForm, setCheckInForm] = useState<CheckInFormState>({
    name: "",
    nirmaanId: "",
    status: "Present",
    note: "",
    centerId: DEFAULT_CENTER_ID,
    mediaId: attendanceMedia[0]?.id || "",
  });

  useEffect(() => {
    loadSummary().catch(() => null);
  }, []);

  useEffect(() => {
    const selectedCenterMedia = attendanceMedia.find((media) => media.centerId === checkInForm.centerId);
    if (selectedCenterMedia && selectedCenterMedia.id !== checkInForm.mediaId) {
      setCheckInForm((current) => ({ ...current, mediaId: selectedCenterMedia.id }));
    }
  }, [checkInForm.centerId, checkInForm.mediaId]);

  const liveSummaryByCenter = useMemo(() => {
    return new Map((summary?.centerStats || []).map((item) => [item.centerId, item]));
  }, [summary]);

  const selectedCenter =
    attendanceCenters.find((center) => center.id === checkInForm.centerId) || attendanceCenters[0];

  const selectedMedia =
    attendanceMedia.find((media) => media.id === checkInForm.mediaId) ||
    attendanceMedia.find((media) => media.centerId === selectedCenter?.id) ||
    attendanceMedia[0];

  const summaryTotals = summary?.totals || {
    allTime: 0,
    today: 0,
    todayPresent: 0,
    averageDistanceKm: 0,
    centerCount: attendanceCenters.length,
  };

  async function loadSummary() {
    const response = await api.get("/attendance/summary");
    setSummary(response.data.data);
  }

  const handleGpsCheck = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGps({ loading: false, message: "Geolocation is not supported in this browser." });
      return;
    }

    setGps({ loading: true, message: "Requesting GPS permission..." });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearest = findNearestCenter(latitude, longitude);

        setGps({
          loading: false,
          lat: latitude,
          lng: longitude,
          accuracy,
          nearestCenterId: nearest?.center.id,
          nearestCenterName: nearest?.center.name,
          nearestDistanceKm: nearest?.distanceKm,
          message: nearest
            ? `GPS locked. Nearest Nirmaan center: ${nearest.center.city} (${nearest.distanceKm.toFixed(2)} km away).`
            : "GPS locked, but no center was found.",
        });

        if (nearest?.center.id) {
          setCheckInForm((current) => ({ ...current, centerId: nearest.center.id }));
        }
      },
      (error) => {
        setGps({ loading: false, message: `GPS unavailable: ${error.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = async () => {
    if (!checkInForm.name.trim()) {
      setMessage("Enter a student name before taking attendance.");
      return;
    }

    const center = attendanceCenters.find((item) => item.id === checkInForm.centerId) || selectedCenter;
    const media = attendanceMedia.find((item) => item.id === checkInForm.mediaId) || selectedMedia;

    setIsSubmitting(true);
    setMessage("Saving attendance check-in...");

    try {
      const response = await api.post("/attendance/check-in", {
        name: checkInForm.name,
        nirmaanId: checkInForm.nirmaanId,
        status: checkInForm.status,
        centerId: center?.id || "general",
        centerName: center?.name || "General Center",
        city: center?.city || "India",
        state: center?.state || "India",
        locationName: media?.locationName || center?.name || "Nirmaan location",
        mediaId: media?.id || "",
        mediaTitle: media?.title || "",
        mediaType: media?.type || "none",
        deviceLat: gps.lat,
        deviceLng: gps.lng,
        deviceAccuracy: gps.accuracy,
        distanceKm: gps.nearestDistanceKm,
        note: checkInForm.note,
        source: "nirmaan-web",
      });

      const saved = response.data.data;
      setMessage(`Attendance saved for ${saved.name} in ${saved.city}.`);
      setCheckInForm((current) => ({
        ...current,
        name: "",
        nirmaanId: "",
        note: "",
        status: "Present",
      }));
      await loadSummary();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to save attendance right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="section py-10 md:py-14">
      <div className="max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--outline)] bg-[linear-gradient(135deg,#09111f_0%,#10223a_48%,#08111d_100%)] text-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-200">
                <MapPinned className="h-4 w-4" /> Nirmaan Attendance Tracking
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl leading-tight md:text-6xl">
                National attendance command center for Nirmaan
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-lg">
                A native India-only attendance system with live backend records, uploaded media pinned to location names, and GPS device check-ins for real attendance validation.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">All time records</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{summaryTotals.allTime}</p>
                  <p className="mt-2 text-sm text-slate-300">Saved in MongoDB</p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today check-ins</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{summaryTotals.today}</p>
                  <p className="mt-2 text-sm text-slate-300">{summaryTotals.todayPresent} present</p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Centers tracked</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{summaryTotals.centerCount}</p>
                  <p className="mt-2 text-sm text-slate-300">India coverage</p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg GPS distance</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{summaryTotals.averageDistanceKm} km</p>
                  <p className="mt-2 text-sm text-slate-300">From nearest center</p>
                </article>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/login/student" className="rounded-full bg-sky-400 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-sky-300">
                  Student login
                </Link>
                <Link href="/login/teacher" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/5">
                  Trainer login
                </Link>
                <Link href="/dashboard/admin/attendance" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/5">
                  Admin sync
                </Link>
                <button
                  type="button"
                  onClick={handleGpsCheck}
                  className="rounded-full border border-sky-300/30 bg-sky-400/10 px-6 py-3 font-semibold text-sky-100 transition-colors hover:bg-sky-400/20"
                >
                  {gps.loading ? "Checking GPS..." : "Use my GPS"}
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 p-6 lg:border-l lg:border-t-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {regionalCards.map((card) => (
                  <article key={card.title} className="rounded-3xl border border-white/10 bg-[#0a1526] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-sky-300">{card.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{card.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-[#0a1526] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Tracking workflow</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>• QR code attendance tied to the session and venue.</li>
                  <li>• Geofence validation to reduce false check-ins.</li>
                  <li>• Admin visibility across multiple India regions.</li>
                  <li>• Sync into the Nirmaan dashboard and audit logs.</li>
                </ul>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">GPS test status</p>
                  <p className="mt-2 text-slate-300">{gps.message || "Press 'Use my GPS' to validate your device location against the nearest Nirmaan center."}</p>
                  {gps.lat && gps.lng ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Lat {gps.lat.toFixed(5)}, Lng {gps.lng.toFixed(5)} • Accuracy {Math.round(gps.accuracy || 0)}m
                    </p>
                  ) : null}
                  {gps.nearestCenterName ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Nearest center: {gps.nearestCenterName} {gps.nearestDistanceKm ? `(${gps.nearestDistanceKm.toFixed(2)} km)` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="text-2xl md:text-3xl">India map tracking</h2>
            </div>
            <IndiaAttendanceMap centerStats={summary?.centerStats || []} />
          </div>

          <aside className="space-y-4">
            <div className="glass p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand)]">System actions</p>
              <h3 className="mt-2 text-2xl">Nirmaan attendance tools</h3>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Quick links for students, trainers, and admins to access the parts of the attendance system that matter.
              </p>
            </div>

            <div className="glass p-6">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <Satellite className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.3em]">GPS and media</p>
              </div>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Uploaded photos and videos are pinned to the same Indian location names used by the attendance system.
              </p>
            </div>

            <div className="glass overflow-hidden p-0">
              <div className="border-b border-[var(--outline)] px-6 py-4">
                <div className="flex items-center gap-2 text-[var(--brand)]">
                  <MapPinned className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.3em]">Google Maps</p>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Open the Nirmaan campus location with a live Google Maps embed.
                </p>
              </div>
              <iframe
                title="Nirmaan Google Maps Embed"
                src={nirmaanMapEmbedUrl}
                className="h-[320px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="glass p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand)]">Take attendance</p>
              <div>
                <label className="mb-2 block text-sm font-medium">Student Name</label>
                <input
                  className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.name}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Nirmaan ID</label>
                <input
                  className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.nirmaanId}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, nirmaanId: e.target.value }))}
                  placeholder="NIR2024001"
                />
              </div>
              <div>
                <label id="center-label" className="mb-2 block text-sm font-medium">Center</label>
                <select
                  className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.centerId}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, centerId: e.target.value }))}
                  aria-labelledby="center-label"
                >
                  {attendanceCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.city} - {center.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label id="status-label" className="mb-2 block text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.status}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, status: e.target.value as CheckInFormState["status"] }))}
                  aria-labelledby="status-label"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Excused">Excused</option>
                </select>
              </div>
              <div>
                <label id="media-label" className="mb-2 block text-sm font-medium">Media proof</label>
                <select
                  className="w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.mediaId}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, mediaId: e.target.value }))}
                  aria-labelledby="media-label"
                >
                  {attendanceMedia.map((media) => (
                    <option key={media.id} value={media.id}>
                      {media.title} - {media.locationName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Note</label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-3 text-sm"
                  value={checkInForm.note}
                  onChange={(e) => setCheckInForm((current) => ({ ...current, note: e.target.value }))}
                  placeholder="Optional note about the check-in"
                />
              </div>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={isSubmitting}
                className="w-full rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Take Attendance"}
              </button>
              {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
              {selectedCenter ? (
                <div className="rounded-2xl border border-[var(--outline)] bg-[var(--surface-2)] p-4 text-sm">
                  <p className="font-semibold">Selected center: {selectedCenter.city}</p>
                  <p className="text-[var(--muted)]">{selectedCenter.name}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {gps.nearestCenterId === selectedCenter.id ? "GPS matched this center." : "Manual selection active."}
                  </p>
                </div>
              ) : null}
            </div>

            {actionTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link key={tile.title} href={tile.href} className="block rounded-[1.5rem] border border-[var(--outline)] bg-[var(--surface)] p-5 transition-transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="inline-flex rounded-2xl bg-[var(--surface-2)] p-3 text-[var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{tile.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{tile.text}</p>
                </Link>
              );
            })}

            <div className="glass p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand)]">Why this works</p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                It stays fully inside the Nirmaan website, uses your existing dashboard routes, and keeps attendance, media, and GPS in one branded flow.
              </p>
            </div>
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="text-2xl md:text-3xl">Location-pinned media</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {attendanceMedia.map((media) => {
              const center = attendanceCenters.find((item) => item.id === media.centerId);
              const isSelected = selectedMedia?.id === media.id;
              return (
                <article key={media.id} className={`overflow-hidden rounded-[1.75rem] border bg-[var(--surface)] shadow-lg ${isSelected ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20" : "border-[var(--outline)]"}`}>
                  <div className="relative aspect-[16/10] bg-black">
                    {media.type === "video" ? (
                      <video
                        src={media.src}
                        controls
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img src={media.src} alt={media.title} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {media.type.toUpperCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckInForm((current) => ({ ...current, mediaId: media.id, centerId: media.centerId }))}
                      className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-950"
                    >
                      Use for check-in
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{media.title}</h3>
                        <p className="text-sm text-[var(--muted)]">{media.description}</p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(center ? center.status : "Offline")}`}>
                        {media.city}
                      </span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-[var(--outline)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
                      <p className="font-semibold text-[var(--text)]">Location name</p>
                      <p>{media.locationName}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass p-6 rounded-[1.75rem]">
            <h2 className="text-2xl font-bold mb-4">Real backend records</h2>
            <div className="space-y-3">
              {(summary?.recentRecords || []).length > 0 ? (
                summary!.recentRecords.map((record) => (
                  <div key={record._id} className="rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{record.name} {record.nirmaanId ? `(${record.nirmaanId})` : ""}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {record.centerName} • {record.city}, {record.state}
                        </p>
                      </div>
                        <span className={`status-badge ${getStatusBadgeClass((record.status === "Absent" ? "Offline" : record.status === "Late" ? "Attention" : "Healthy") as "Healthy" | "Attention" | "Offline")}`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
                      <p>Location: {record.locationName || "N/A"}</p>
                      <p>Media: {record.mediaTitle || "None"}</p>
                      <p>Check-in: {new Date(record.checkInAt).toLocaleString()}</p>
                      <p>Distance: {typeof record.distanceKm === "number" ? `${record.distanceKm.toFixed(2)} km` : "N/A"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">No check-ins saved yet. Take attendance to populate real backend records.</p>
              )}
            </div>
          </div>

          <div className="glass p-6 rounded-[1.75rem]">
            <h2 className="text-2xl font-bold mb-4">Center snapshots</h2>
            <div className="space-y-3">
              {attendanceCenters.map((center) => {
                const liveStat = liveSummaryByCenter.get(center.id);
                const attendanceRate = liveStat?.attendanceRate ?? center.attendance;
                const status = attendanceRate >= 88 ? "Healthy" : attendanceRate >= 78 ? "Attention" : "Offline";
                return (
                  <div key={center.id} className="rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{center.city}</p>
                        <p className="text-xs text-[var(--muted)]">{center.name}</p>
                      </div>
                          <span className={`status-badge ${getStatusBadgeClass(status as "Healthy" | "Attention" | "Offline")}`}>
                        {attendanceRate}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <div className={`progress-bar-fill ${getProgressWidthClass(attendanceRate)}`} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {liveStat ? `${liveStat.total} records • ${liveStat.present} present` : "No backend records yet"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}