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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
