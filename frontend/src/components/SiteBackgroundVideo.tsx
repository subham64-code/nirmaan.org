"use client";

import { useEffect, useState } from "react";
import { backgroundVideoUrl } from "@/lib/constants";

const CONSENT_KEY = "nirmaan_video_consent";

export default function SiteBackgroundVideo() {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(CONSENT_KEY) as "granted" | "denied" | null;
    setConsent(savedConsent);
  }, []);

  const onDecision = (value: "granted" | "denied") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };

  if (consent === null) {
    return (
      <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 p-4">
        <div className="glass max-w-xl p-6 text-center pointer-events-auto">
          <h3 className="text-2xl">Allow Background Video?</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The site can play a smart lab background video across pages for a more immersive experience.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button onClick={() => onDecision("granted")} className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white">Allow & Play</button>
            <button onClick={() => onDecision("denied")} className="rounded-full border border-[var(--outline)] px-5 py-2 text-sm font-semibold">No Thanks</button>
          </div>
        </div>
      </div>
    );
  }

  if (consent === "denied") return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <iframe
        className="absolute inset-0 h-full w-full scale-[1.25] opacity-35"
        src={backgroundVideoUrl}
        title="Nirmaan Site Background Video"
        allow="clipboard-write; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg)]/65 via-[var(--bg)]/20 to-black/35" />
    </div>
  );
}