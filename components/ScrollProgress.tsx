"use client";

import { useEffect, useRef } from "react";

/**
 * A hairline at the top of the window showing how far down the page you are.
 *
 * Writes a CSS custom property on its own element rather than re-rendering:
 * React has no business running sixty times a second for a decoration. Renders
 * nothing at all for visitors who have asked for reduced motion, and is inert
 * without JavaScript, which is correct for something purely decorative.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport has no progress to report.
      el.style.setProperty("--p", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div className="progress" ref={ref} aria-hidden="true" />;
}
