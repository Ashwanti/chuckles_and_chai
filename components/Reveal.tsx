"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealKind = "up" | "fade" | "left" | "right" | "scale" | "curtain";

interface RevealProps {
  children: ReactNode;
  /** Direction the element travels in as it appears. */
  kind?: RevealKind;
  /** Stagger, in milliseconds. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}

/**
 * Reveals its children once, when they first scroll into view.
 *
 * Falls back to "already visible" when IntersectionObserver is missing or the
 * visitor has asked for reduced motion, so content is never trapped behind an
 * animation that will not run.
 */
export function Reveal({ children, kind = "up", delay = 0, as, className, id }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={[className, shown ? "is-in" : ""].filter(Boolean).join(" ")}
      data-reveal={kind}
      style={delay ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
