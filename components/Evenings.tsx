import Image from "next/image";

import { Icon, Stars } from "./Icons";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site.config";

const HOURS_OF_THE_EVENING = [
  { time: "4pm", place: "the first pot goes on and the counter is still quiet" },
  { time: "6pm", place: "the after-work hour — cutting chai, bun maska, ten minutes to yourself" },
  { time: "8pm", place: "the long tables fill up and the kitchen is at full tilt" },
  { time: "10pm", place: "last orders in, one more kahwa, nobody in a hurry" },
];

/**
 * The evening section.
 *
 * Where the template this grew from ran a section about its own street, this
 * one is about the time of day, because the café's location was not supplied
 * and writing a neighbourhood we invented would be a lie about a real place.
 * Swap this copy for the local one once the address in site.config.ts is real.
 */
export function Evenings() {
  return (
    <section className="section evening">
      <div className="evening__bg">
        <Image
          src="/images/evening.jpg"
          alt=""
          width={1600}
          height={1000}
          sizes="100vw"
          loading="lazy"
          aria-hidden="true"
        />
      </div>
      <div className="wrap">
        <Reveal className="evening__inner">
          <p className="kicker">An evening café</p>
          <h2>
            We do not do mornings. <span className="wink">We do the rest of it.</span>
          </h2>
          <p className="lede">
            Four in the afternoon is when the first pot goes on, and everything after that is the
            good part of the day: the hour when work stops, the hour when it gets dark, and the
            hour nobody wants to leave.
          </p>

          <ul className="evening__steps">
            {HOURS_OF_THE_EVENING.map((entry) => (
              <li key={entry.time}>
                <b>{entry.time}</b> <span>{entry.place}</span>
              </li>
            ))}
          </ul>

          <div className="cta-row">
            <a className="btn" href="#menu">
              What to order <Icon name="arrow" className="ico" />
            </a>
            <a className="btn btn--ghost" href="#visit">
              Where to find us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Reviews() {
  const rating = SITE.ratings[0];

  return (
    <section className="section reviews" id="reviews">
      <div className="wrap">
        <Reveal className="reviews__top">
          <div>
            <p className="kicker">What people say</p>
            <h2 style={{ fontSize: "var(--t-xxl)" }}>
              Rated {rating?.score ?? "4.9"} by{" "}
              <span className="wink">the people who came in.</span>
            </h2>
          </div>
          <div className="score">
            {SITE.ratings.map((r) => (
              <div className="score__box" key={r.source}>
                <div className="score__num">
                  {r.score} <small>/ 5</small>
                </div>
                <Stars label={`${r.score} out of 5 on ${r.source}`} />
                <div className="score__src">
                  {r.source} &middot; {r.count} reviews
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Individual quotes ship empty on purpose — see the note in
            site.config.ts. Until the café pastes in its own published Google
            reviews, this points at the real ones rather than inventing any. */}
        {SITE.reviews.length === 0 ? (
          <Reveal className="reviews__none">
            <Icon name="quote" className="reviews__none-ico" />
            <div>
              <h3>Read them where they were written</h3>
              <p>
                {rating ? `${rating.count} people` : "People"} have reviewed us on Google and given
                us {rating?.score ?? "4.9"} out of 5. We would rather send you to the real thing
                than pick the flattering ones out and reprint them here.
              </p>
              <div className="cta-row">
                <a
                  className="btn btn--sm"
                  href={SITE.business.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the reviews on Google <Icon name="arrow" className="ico" />
                </a>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="reviews__grid">
            {SITE.reviews.map((review, i) => (
              <Reveal as="article" className="review" key={review.name} delay={(i % 3) * 80}>
                <Stars label="Rated 5 out of 5" />
                <blockquote className="review__quote">&ldquo;{review.quote}&rdquo;</blockquote>
                <div className="review__by">
                  <span className="review__avatar" aria-hidden="true">
                    {review.name.charAt(0)}
                  </span>
                  <span>
                    <span className="review__name">{review.name}</span>
                    <span className="review__meta" style={{ display: "block" }}>
                      via {review.meta}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
