import Image from "next/image";

import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site.config";

/**
 * The pinboard.
 *
 * A masonry of chai, spice and café photographs in the pinned-board style —
 * mixed crops, tight gutters, every tile opening the café's Instagram. It
 * replaces the old lightbox gallery: one place for the photography instead of
 * two, and no modal to trap a phone user in.
 *
 * It is a server component with no JavaScript of its own. Tiles are plain
 * links, so they work before hydration and behave correctly on a long-press.
 */
export function Moodboard() {
  const photos = SITE.moodboard;
  if (photos.length === 0) return null;

  return (
    <section className="section section--tint" id="moodboard">
      <div className="wrap">
        <Reveal className="head head--split">
          <div>
            <p className="kicker">The pinboard</p>
            <h2>
              Follow <span className="wink">the aroma.</span>
            </h2>
          </div>
          <a
            className="btn btn--sm"
            href={SITE.business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="ig" className="ico" /> @{SITE.business.instagram}
          </a>
        </Reveal>

        <div className="board">
          {photos.map((photo, i) => (
            <a
              key={photo.src}
              className="board__pin"
              href={photo.href || SITE.business.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${photo.alt} — opens Instagram in a new tab`}
              style={{ "--i": i % 6 } as React.CSSProperties}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                sizes="(min-width: 1200px) 20vw, (min-width: 760px) 33vw, 50vw"
                loading="lazy"
              />
              <span className="board__ico" aria-hidden="true">
                <Icon name="ig" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
