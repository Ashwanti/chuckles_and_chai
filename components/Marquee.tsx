import type { IconName } from "./Icons";
import { Icon } from "./Icons";
import { SITE } from "@/lib/site.config";

/**
 * Scrolling ticker. The list is rendered twice so the CSS animation can loop
 * seamlessly, and the whole strip is aria-hidden — it is decoration, and the
 * same words appear as real content elsewhere on the page.
 */
export function Marquee({ items, tone }: { items: readonly string[]; tone?: "wine" }) {
  const track = (
    <div className="marquee__track">
      {items.map((item, i) => (
        <span key={`${item}-${i}`}>{item}</span>
      ))}
    </div>
  );

  return (
    <div className={`marquee${tone === "wine" ? " marquee--wine" : ""}`} aria-hidden="true">
      {track}
      {track}
    </div>
  );
}

export const BRAND_TICKER = [
  "Slow-boiled masala chai",
  "Spices pounded daily",
  "Degree filter kaapi",
  "Kulhad service",
  "Veg & non-veg",
  "Open from 4pm",
  "Est. 2025",
] as const;

export const SOCIAL_TICKER = [
  "Follow the aroma",
  `@${SITE.business.instagram}`,
  "Follow the aroma",
  `@${SITE.business.instagram}`,
] as const;

const QUICK_FACTS: { icon: IconName; label: string; sub: string }[] = [
  { icon: "clock", label: "Open from 4pm", sub: "Every day of the week" },
  { icon: "kettle", label: "Boiled, not steeped", sub: "Three boils, twice strained" },
  { icon: "leaf", label: "Veg, egg & non-veg", sub: "Marked on every line" },
  { icon: "bag", label: "Order ahead", sub: `Pay at the counter · ${SITE.business.priceBand}` },
];

/** The scannable strip of essentials, straight after the hero. */
export function QuickBar() {
  return (
    <section className="quick" aria-label="At a glance">
      <div className="wrap" style={{ paddingInline: 0 }}>
        <div className="quick__inner">
          {QUICK_FACTS.map((fact) => (
            <div className="quick__item" key={fact.label}>
              <Icon name={fact.icon} className="quick__ico" />
              <span className="quick__label">
                {fact.label}
                <span className="quick__sub">{fact.sub}</span>
              </span>
            </div>
          ))}
          <div className="quick__cta">
            <a
              className="btn btn--sm"
              href={SITE.business.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <Icon name="nav" className="ico" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
