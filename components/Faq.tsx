"use client";

import { useState } from "react";

import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site.config";

/**
 * Accordion. One answer open at a time; the closed answers stay in the DOM so
 * they remain searchable on the page and indexable, rather than being mounted
 * only on click.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section section--tint" id="faq">
      <div className="wrap">
        <div className="faq__grid">
          <Reveal kind="left">
            <p className="kicker">Good to know</p>
            <h2 style={{ fontSize: "var(--t-xl)" }}>
              Questions we get asked <span className="wink">most evenings.</span>
            </h2>
            <p className="lede" style={{ marginTop: "1.25rem" }}>
              Anything else, just ask when you are in &mdash; or give us a ring.
            </p>
            <div className="cta-row" style={{ marginTop: "1.75rem" }}>
              <a className="btn btn--ghost btn--sm" href={`tel:${SITE.business.phoneLink}`}>
                <Icon name="phone" className="ico" /> {SITE.business.phoneDisplay}
              </a>
            </div>
          </Reveal>

          <Reveal kind="right" className="faq__list">
            {SITE.faq.map((entry, i) => {
              const isOpen = open === i;
              return (
                <div className={`faq__item${isOpen ? " is-open" : ""}`} key={entry.q}>
                  <button
                    className="faq__q"
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{entry.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                  <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                    <div>
                      <p>{entry.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
