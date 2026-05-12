"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function PageIntro() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("#intro-logo", {
        y: -8,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.to(wrapperRef.current, {
        opacity: 0,
        delay: 1.3,
        duration: 0.8,
        onComplete: () => {
          if (wrapperRef.current) wrapperRef.current.style.display = "none";
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-[100] grid place-items-center bg-black text-white">
      <h1 id="intro-logo" className="opacity-0 text-4xl font-bold tracking-[0.3em]">NIRMAAN</h1>
    </div>
  );
}
