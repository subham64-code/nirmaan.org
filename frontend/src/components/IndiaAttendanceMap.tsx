"use client";

import { attendanceCenters } from "@/lib/attendance-data";

type CenterStat = {
  centerId: string;
  attendanceRate: number;
  total: number;
  present: number;
  latestCheckIn?: string;
};

type IndiaAttendanceMapProps = {
  centerStats?: CenterStat[];
};

export default function IndiaAttendanceMap({ centerStats = [] }: IndiaAttendanceMapProps) {
  const statsByCenterId = new Map(centerStats.map((item) => [item.centerId, item]));

  const getStatusBadgeClass = (status: "Healthy" | "Attention" | "Offline") => {
    if (status === "Healthy") {
      return "status-badge-healthy";
    }

    if (status === "Attention") {
      return "status-badge-attention";
    }

    return "status-badge-offline";
  };

  const getPinStatusClass = (status: "Healthy" | "Attention" | "Offline") => {
    if (status === "Healthy") {
      return "map-pin-healthy";
    }

    if (status === "Attention") {
      return "map-pin-attention";
    }

    return "map-pin-offline";
  };

  const getPinPositionClass = (centerId: string) => {
    const positionClasses: Record<string, string> = {
      bhubaneswar: "map-pin-bhubaneswar",
      delhi: "map-pin-delhi",
      mumbai: "map-pin-mumbai",
      bengaluru: "map-pin-bengaluru",
      hyderabad: "map-pin-hyderabad",
      kolkata: "map-pin-kolkata",
    };

    return positionClasses[centerId] || "map-pin-bhubaneswar";
  };

  const getProgressWidthClass = (attendanceRate: number) => {
    const bucket = Math.max(0, Math.min(100, Math.round(attendanceRate / 5) * 5));
    return `progress-width-${bucket}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--outline)] bg-[#09111f] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_32%)]" />
      <div className="relative grid gap-0 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="min-h-[30rem] bg-[#0b1627] p-3 md:p-4">
          <div className="relative h-[28rem] w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#13233d] via-[#0d1b2f] to-[#08111d]">
            <svg viewBox="0 0 1000 700" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="indiaFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1f7ae0" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#15b8a6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.28" />
                </linearGradient>
              </defs>
              <g opacity="0.35">
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={60 + i * 60} x2="1000" y2={60 + i * 60} stroke="white" strokeOpacity="0.08" />
                ))}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`v-${i}`} y1="0" x1={50 + i * 90} y2="700" x2={50 + i * 90} stroke="white" strokeOpacity="0.08" />
                ))}
              </g>

              <path
                d="M520 78 L590 98 L640 130 L690 162 L720 220 L760 280 L790 360 L780 410 L740 470 L710 520 L690 610 L640 640 L600 605 L575 560 L545 520 L500 490 L450 470 L410 430 L365 390 L320 345 L300 290 L315 240 L350 205 L390 170 L430 140 L470 110 Z"
                fill="url(#indiaFill)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              <path
                d="M455 520 L480 560 L510 610 L535 660 L500 680 L455 640 L430 585 Z"
                fill="url(#indiaFill)"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              <path
                d="M610 610 L680 625 L740 650 L720 690 L640 680 L590 650 Z"
                fill="url(#indiaFill)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>

            {attendanceCenters.map((center) => {
              const liveStat = statsByCenterId.get(center.id);
              const attendanceRate = liveStat?.attendanceRate ?? center.attendance;
              const derivedStatus = attendanceRate >= 88 ? "Healthy" : attendanceRate >= 78 ? "Attention" : "Offline";
              return (
                <div
                  key={`${center.city}-${center.name}`}
                  className={`map-pin-wrapper ${getPinPositionClass(center.id)}`}
                >
                  <div
                    className={`map-pin-circle ${getPinStatusClass(derivedStatus)}`}
                  >
                    <span className={`map-pin-pulse ${getPinStatusClass(derivedStatus)}`} />
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs text-white backdrop-blur">
              <p className="uppercase tracking-[0.3em] text-sky-200">India coverage</p>
              <p className="mt-1 text-sm text-slate-200">6 live tracking centers on the Nirmaan network</p>
            </div>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#0d1b2f] p-5 text-white lg:border-l lg:border-t-0">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300">India tracking</p>
          <h3 className="mt-3 text-2xl font-semibold">Live attendance network</h3>
          <p className="mt-3 text-sm text-slate-300">
            Track attendance, compliance, and center health across India from a single Nirmaan command panel.
          </p>

          <div className="mt-5 space-y-3">
            {attendanceCenters.map((center) => {
              const liveStat = statsByCenterId.get(center.id);
              const attendanceRate = liveStat?.attendanceRate ?? center.attendance;
              const derivedStatus = attendanceRate >= 88 ? "Healthy" : attendanceRate >= 78 ? "Attention" : "Offline";

              return (
                <div
                  key={`${center.id}-${center.city}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{center.city}</p>
                      <p className="text-xs text-slate-400">{center.name}</p>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(derivedStatus as "Healthy" | "Attention" | "Offline")}`}>
                      {attendanceRate}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`progress-bar-fill ${getProgressWidthClass(attendanceRate)}`} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Attendance {attendanceRate}%{liveStat ? ` • ${liveStat.total} records` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}