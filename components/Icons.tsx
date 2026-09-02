/**
 * One inline SVG sprite, rendered once in the layout. Every icon on the site
 * is a <use href="#i-..."/> reference, so the paths are downloaded once and
 * inherit currentColor wherever they appear.
 */

export type IconName =
  | "pin" | "cup" | "kettle" | "spice" | "leaf" | "clock" | "phone"
  | "nav" | "ig" | "arrow" | "close" | "left" | "right" | "zoom" | "list" | "map"
  | "bag" | "check" | "plus" | "filter" | "star" | "sliders" | "repeat" | "quote";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Renders an icon from the sprite. Decorative by default. */
export function Icon({ name, className, title }: { name: IconName; className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <g id="i-pin" {...stroke}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </g>
        {/* A cutting glass with steam - the chai equivalent of a coffee cup. */}
        <g id="i-cup" {...stroke}>
          <path d="M6.5 9h11l-1.4 10.2a2 2 0 0 1-2 1.8h-4.2a2 2 0 0 1-2-1.8Z" />
          <path d="M8.5 3.2c-.8 1 .8 1.7 0 2.7M12 2.6c-.8 1 .8 1.7 0 2.7M15.5 3.2c-.8 1 .8 1.7 0 2.7" />
        </g>
        {/* A stovetop chai pan with a long handle. */}
        <g id="i-kettle" {...stroke}>
          <path d="M3.5 10h13v5a4 4 0 0 1-4 4h-5a4 4 0 0 1-4-4Z" />
          <path d="M16.5 12h3.2a.8.8 0 0 1 0 1.6h-3.2" />
          <path d="M7 7c-.7-.9.7-1.5 0-2.4M11 6.4c-.7-.9.7-1.5 0-2.4" />
        </g>
        {/* Star anise, standing in for whole spice. */}
        <g id="i-spice" {...stroke}>
          <path d="M12 3.2 13.6 9l5.9.2-4.6 3.6 1.6 5.7L12 15.2 7.5 18.5l1.6-5.7L4.5 9.2 10.4 9Z" />
          <circle cx="12" cy="11.6" r="1.9" />
        </g>
        <g id="i-leaf" {...stroke}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </g>
        <g id="i-clock" {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </g>
        <g id="i-phone" {...stroke}>
          <path d="M15.5 21A13.5 13.5 0 0 1 3 8.5 3 3 0 0 1 6 5.5h1.5a1.5 1.5 0 0 1 1.5 1.3c.1.9.3 1.8.6 2.6a1.5 1.5 0 0 1-.4 1.6l-1 1a12 12 0 0 0 4.8 4.8l1-1a1.5 1.5 0 0 1 1.6-.4c.8.3 1.7.5 2.6.6a1.5 1.5 0 0 1 1.3 1.5V19a3 3 0 0 1-3 2Z" />
        </g>
        <g id="i-nav" {...stroke}>
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </g>
        <g id="i-ig" {...stroke}>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </g>
        <g id="i-arrow" {...stroke} strokeWidth={1.7}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </g>
        <g id="i-close" {...stroke} strokeWidth={1.7}>
          <path d="M6 6l12 12M18 6L6 18" />
        </g>
        <g id="i-left" {...stroke} strokeWidth={1.7}>
          <path d="M15 6l-6 6 6 6" />
        </g>
        <g id="i-right" {...stroke} strokeWidth={1.7}>
          <path d="M9 6l6 6-6 6" />
        </g>
        <g id="i-zoom" {...stroke} strokeWidth={1.7}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
        </g>
        <g id="i-list" {...stroke}>
          <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
        </g>
        <g id="i-bag" {...stroke}>
          <path d="M4 8h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9Z" />
          <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
        </g>
        <g id="i-check" {...stroke} strokeWidth={2}>
          <path d="M4 12.5l5.5 5.5L20 7" />
        </g>
        <g id="i-plus" {...stroke} strokeWidth={2}>
          <path d="M12 5v14M5 12h14" />
        </g>
        <g id="i-star" {...stroke}>
          <path d="M12 3.2l2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83L6.6 19.85l1.03-6L3.28 9.6l6.02-.9Z" />
        </g>
        <g id="i-sliders" {...stroke}>
          <path d="M4 7h11M19 7h1M4 17h4M12 17h8" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </g>
        <g id="i-repeat" {...stroke}>
          <path d="M4 11V9a4 4 0 0 1 4-4h9M17 5l-3-3M17 5l-3 3" />
          <path d="M20 13v2a4 4 0 0 1-4 4H7M7 19l3 3M7 19l3-3" />
        </g>
        <g id="i-filter" {...stroke}>
          <path d="M3 5h18l-7 8.2V20l-4-2.2v-4.6Z" />
        </g>
        <g id="i-map" {...stroke}>
          <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
          <path d="M9 3v15M15 6v15" />
        </g>
        <g id="i-quote" fill="currentColor" stroke="none">
          <path d="M9.6 5.4c-3.3 1.5-5.2 4.3-5.2 7.9 0 3.2 1.8 5.3 4.3 5.3 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.3 0-.7 0-1 .2.3-1.6 1.5-3 3.2-4Zm9.2 0c-3.3 1.5-5.2 4.3-5.2 7.9 0 3.2 1.8 5.3 4.3 5.3 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.3 0-.7 0-1 .2.3-1.6 1.5-3 3.2-4Z" />
        </g>
      </defs>
    </svg>
  );
}

/**
 * The brand mark at small sizes: the seal reduced to a ring, a steaming
 * cutting glass and two rule marks. The arced wordmark on the full seal is
 * unreadable below about 80px, so it is deliberately not here — the lockup in
 * the header sets the name as live text beside this instead.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="18.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="20" cy="20" r="15.6" stroke="currentColor" strokeWidth=".7" opacity=".45" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        {/* Steam */}
        <path d="M16.4 11.4c-.9 1.1.9 1.9 0 3" />
        <path d="M20 10.6c-.9 1.1.9 1.9 0 3" />
        <path d="M23.6 11.4c-.9 1.1.9 1.9 0 3" />
      </g>
      {/* Cutting glass */}
      <path
        d="M13.6 17.4h12.8l-1.5 9.1a2.4 2.4 0 0 1-2.4 2h-5a2.4 2.4 0 0 1-2.4-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * The full circular seal, for the hero and anywhere it can be shown at 78px
 * or more. The ring type is set with <textPath>, so it stays live text and
 * scales without going soft.
 */
export function BrandSeal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Chuckles & Chai, Awaken With Aroma, established 2025"
    >
      <defs>
        <path id="seal-top" d="M 30 88 A 70 70 0 0 1 170 88" fill="none" />
        <path id="seal-bottom" d="M 22 118 A 78 78 0 0 0 178 118" fill="none" />
      </defs>

      <circle cx="100" cy="100" r="100" fill="currentColor" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#FBF8F2" strokeWidth="1" opacity=".38" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="#FBF8F2" strokeWidth="2" opacity=".85" />

      <text
        fill="#FBF8F2"
        fontFamily="var(--display), Georgia, serif"
        fontSize="19"
        fontWeight="600"
        letterSpacing="2.4"
      >
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
          CHUCKLES &amp; CHAI
        </textPath>
      </text>

      <text
        fill="#E2C39D"
        fontFamily="var(--sans), sans-serif"
        fontSize="10"
        fontWeight="600"
        letterSpacing="3.4"
      >
        <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">
          AWAKEN WITH AROMA
        </textPath>
      </text>

      {/* EST / 2025 on the flanks */}
      <text x="26" y="104" fill="#E2C39D" fontFamily="var(--sans), sans-serif" fontSize="8.5" fontWeight="600" letterSpacing="1.6" textAnchor="middle">EST</text>
      <text x="174" y="104" fill="#E2C39D" fontFamily="var(--sans), sans-serif" fontSize="8.5" fontWeight="600" letterSpacing="1.2" textAnchor="middle">2025</text>

      {/* Steaming cutting glass */}
      <g stroke="#FBF8F2" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M85 72c-3.4 4.4 3.4 7.2 0 11.6" />
        <path d="M100 68c-3.4 4.4 3.4 7.2 0 11.6" />
        <path d="M115 72c-3.4 4.4 3.4 7.2 0 11.6" />
      </g>
      <path
        d="M76 92h48l-5.6 33.4a9 9 0 0 1-8.9 7.6H90.5a9 9 0 0 1-8.9-7.6Z"
        fill="#FBF8F2"
      />
      <rect x="74" y="139" width="52" height="5" rx="2.5" fill="#FBF8F2" opacity=".85" />
    </svg>
  );
}

export const STAR_PATH = "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z";

/** A five-star row. Labelled once for assistive tech, not five times. */
export function Stars({ label = "Rated 5 out of 5" }: { label?: string }) {
  return (
    <div className="stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
