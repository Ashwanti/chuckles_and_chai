"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "./Icons";
import { SITE } from "@/lib/site.config";

/**
 * Sticky bottom bar for phones: Menu | Directions | Call.
 *
 * Appears once the hero has scrolled by, so it never competes with the hero's
 * own call to action on first paint. Light, like the rest of the page, with a
 * hairline rather than a slab so it does not eat the bottom of a small screen.
 */
export function MobileDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const hero = document.getElementById("top");
        const past = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 500);
        setVisible(past);
        document.body.classList.toggle("has-dock", past);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("has-dock");
    };
  }, []);

  return (
    <nav className={`dock${visible ? " is-visible" : ""}`} aria-label="Quick actions">
      <a href="#menu" className="is-primary">
        <Icon name="list" /> Menu
      </a>
      <a href={SITE.business.directionsUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="nav" /> Directions
      </a>
      <a href={`tel:${SITE.business.phoneLink}`}>
        <Icon name="phone" /> Call
      </a>
    </nav>
  );
}

const STORAGE_KEY = "chuckles-cookie-ack";

/**
 * Informational cookie notice.
 *
 * This site sets no tracking cookies, so nothing here is consent-gated. It is
 * held back until the visitor scrolls off the hero rather than covering the
 * "View menu" button the moment the page opens.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Publish the notice's real height as --cookie-h so the floating basket
     button can sit clear of it. On a phone the two occupy the same corner,
     and the notice was landing on top of the basket - which is a dismissable
     panel covering the one control someone mid-order needs. Measured rather
     than guessed at, because the panel's height depends on how the copy
     wraps at that width. */
  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    if (!visible) {
      root.style.setProperty("--cookie-h", "0px");
      return;
    }
    const measure = () => root.style.setProperty("--cookie-h", `${el.offsetHeight}px`);
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      root.style.setProperty("--cookie-h", "0px");
    };
  }, [visible]);

  useEffect(() => {
    let seen: string | null = "1";
    try {
      seen = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private mode or blocked storage: say nothing rather than nag on every view.
      seen = "1";
    }
    if (seen) return;

    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.6) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing to do - it will simply appear again next visit.
    }
  };

  return (
    <div
      className={`cookie${visible ? " is-visible" : ""}`}
      ref={ref}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
    >
      <h2>A quick note on cookies</h2>
      <p>
        This site sets no tracking or advertising cookies of its own, and the fonts are served
        from our own domain. We store one small preference on your device so this message stays
        shut. The Visit Us map is embedded from Google, which sets its own cookies when the page
        loads.
      </p>
      <div className="cookie__row">
        <button className="btn btn--sm" type="button" onClick={dismiss} tabIndex={visible ? 0 : -1}>
          Got it
        </button>
        <Link className="btn btn--ghost btn--sm" href="/cookies" tabIndex={visible ? 0 : -1}>
          Read more
        </Link>
      </div>
    </div>
  );
}
