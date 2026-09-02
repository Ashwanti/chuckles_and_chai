"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { BrandSeal, Icon } from "./Icons";
import { SITE } from "@/lib/site.config";

/* Authored line breaks. Each line is clipped by its own overflow:hidden
   wrapper for the reveal, so a wrap would slice a row in half - the type
   scale in globals.css is set so these stay one line at every width. */
const HEADLINE = ["Awaken", "with aroma."] as const;

export function Hero() {
  const [revealed, setRevealed] = useState(false);

  // Runs the headline reveal on mount rather than on scroll: this is the
  // first thing on the page, so there is nothing to scroll into view.
  useEffect(() => setRevealed(true), []);

  const b = SITE.business;

  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div>
          <h1 className={`reveal-lines${revealed ? " is-in" : ""}`}>
            {HEADLINE.map((line, i) => (
              <span className="line" key={line}>
                <span style={{ "--i": i } as React.CSSProperties}>{line}</span>
              </span>
            ))}
            <span className="line">
              <span className="wink" style={{ "--i": HEADLINE.length } as React.CSSProperties}>
                Chai, the long way round.
              </span>
            </span>
          </h1>

          <p className="lede">
            Whole spices pounded every morning, Assam leaf boiled three times and never steeped,
            strained twice and pulled between two vessels. It takes four minutes a pot, and we
            are not shortening it. The kettle goes on at four.
          </p>

          <div className="cta-row">
            <a className="btn" href="#menu">
              See the menu <Icon name="arrow" className="ico" />
            </a>
            <a className="btn btn--ghost" href="#visit">
              Find us
            </a>
          </div>

          <div className="hero__facts">
            <div className="hero__fact">
              <b>4.9&#9733;</b>
              <span>72 Google reviews</span>
            </div>
            <div className="hero__fact">
              <b>12</b>
              <span>spices, ground daily</span>
            </div>
            <div className="hero__fact">
              <b>4pm</b>
              <span>open every day</span>
            </div>
          </div>
        </div>

        <div className="hero__media">
          <div className="frame">
            <Image
              src="/images/hero-main.jpg"
              alt="Masala chai in a clay kulhad"
              width={1200}
              height={1600}
              priority
              fetchPriority="high"
              sizes="(min-width: 940px) 46vw, 100vw"
              quality={82}
            />
          </div>
          <BrandSeal className="hero__seal" />
        </div>
      </div>

      <span className="sr-only">
        {b.name} — {b.tagline}. Established {b.established}.
      </span>
    </section>
  );
}
