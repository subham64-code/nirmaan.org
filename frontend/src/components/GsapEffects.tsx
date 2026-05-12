"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function GsapEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    revealItems.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: index * 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        }
      );
    });

    const parallaxItems = gsap.utils.toArray<HTMLElement>("[data-parallax]");
    parallaxItems.forEach((el) => {
      gsap.to(el, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          scrub: true,
        },
      });
    });

    const cursor = document.getElementById("cursor-dot");
    const moveCursor = (e: MouseEvent) => {
      if (cursor) {
        gsap.to(cursor, { x: e.clientX - 8, y: e.clientY - 8, duration: 0.2, ease: "power2.out" });
      }
    };
    window.addEventListener("mousemove", moveCursor);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return <div id="cursor-dot" className="pointer-events-none fixed z-[80] hidden h-4 w-4 rounded-full bg-[var(--brand)] md:block" />;
}
