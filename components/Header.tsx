"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark, Icon } from "./Icons";
import { NAV_LINKS } from "@/lib/nav";
import { SITE } from "@/lib/site.config";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      className={["brand", className].filter(Boolean).join(" ")}
      href="/"
      aria-label={`${SITE.business.name}, back to top`}
    >
      <BrandMark className="brand__mark" />
      <span className="brand__text">
        <span className="brand__name">Chuckles &amp; Chai</span>
        <span className="brand__sub">Awaken With Aroma</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");
  const burgerRef = useRef<HTMLButtonElement>(null);

  /* Solid header once the page has started to move. The hero is light and the
     header ink never changes colour, so unlike the dark-hero pattern there is
     nothing here that can flash on first paint. */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight the section the visitor is currently reading. */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  /* Lock the page behind the full-screen menu, and close it on Escape. */
  useEffect(() => {
    document.body.classList.toggle("is-locked", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => document.body.classList.remove("is-locked"), []);

  const close = useCallback(() => setOpen(false), []);
  const b = SITE.business;

  return (
    <>
      <header className={`header${scrolled ? " is-stuck" : ""}`}>
        <div className="header__inner">
          <Brand />

          <nav className="nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                className={`nav__link${active === link.href.slice(1) ? " is-active" : ""}`}
                href={link.href}
                aria-current={active === link.href.slice(1) ? "true" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <a className="btn btn--ghost btn--sm" href={`tel:${b.phoneLink}`}>
              <Icon name="phone" className="ico" /> Call
            </a>
            <a className="btn btn--sm" href="#menu">
              Order ahead
            </a>
            <button
              ref={burgerRef}
              className="burger"
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="drawer"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer${open ? " is-open" : ""}`} id="drawer" aria-hidden={!open}>
        <nav className="drawer__nav" aria-label="Mobile">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              className="drawer__link"
              href={link.href}
              onClick={close}
              tabIndex={open ? 0 : -1}
            >
              <i>{String(i + 1).padStart(2, "0")}</i> {link.label}
            </a>
          ))}
        </nav>

        <div className="drawer__foot">
          <div className="drawer__cta">
            <a className="btn btn--sm" href="#menu" onClick={close} tabIndex={open ? 0 : -1}>
              See the menu
            </a>
            <a
              className="btn btn--ghost btn--sm"
              href={b.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              tabIndex={open ? 0 : -1}
            >
              Directions <Icon name="nav" className="ico" />
            </a>
          </div>
          <div>
            <a href={`tel:${b.phoneLink}`} tabIndex={open ? 0 : -1}>
              {b.phoneDisplay}
            </a>
            <br />
            <a
              href={b.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
            >
              @{b.instagram}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
