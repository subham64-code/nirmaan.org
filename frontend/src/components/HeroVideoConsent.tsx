"use client";

import { useEffect, useState } from "react";
import { backgroundVideoUrl } from "@/lib/constants";

const CONSENT_KEY = "nirmaan_video_consent";

export default function HeroVideoConsent() {
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
      <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-4">
        <div className="glass max-w-xl p-6 text-center">
          <h3 className="text-2xl">Allow Background Video?</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This website can play a YouTube background video in the hero section for an immersive college management style experience.
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
    <iframe
      className="absolute inset-0 h-full w-full scale-[1.25]"
      src={backgroundVideoUrl}
      title="Nirmaan Hero Background Video"
      allow="autoplay; encrypted-media"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
