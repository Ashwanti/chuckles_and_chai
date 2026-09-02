import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site.config";

/**
 * "The Ritual" — how the chai is actually made.
 *
 * Deliberately evergreen. A "today's special" board is only ever as good as
 * the last person who remembered to edit it, and a stale one is worse than no
 * board at all. This describes method, which does not go out of date. It is
 * still config-driven (SITE.ritual), so the café can rewrite or reorder the
 * steps, and the section renders an honest empty state if the array is
 * emptied rather than disappearing without explanation.
 */
export function Ritual() {
  if (!SITE.features.ritual) return null;
  const steps = SITE.ritual;

  return (
    <section className="section ritual" id="ritual">
      <div className="wrap">
        <Reveal className="head head--split">
          <div>
            <p className="kicker">The ritual</p>
            <h2>
              Four minutes, and <span className="wink">not one of them skipped.</span>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: "32ch" }}>
            Nothing here is a secret. It is just the slow version of something most places do
            quickly.
          </p>
        </Reveal>

        {steps.length === 0 ? (
          <Reveal className="ritual__empty">
            <Icon name="kettle" className="ritual__empty-ico" />
            <div>
              <h3>Ask at the counter</h3>
              <p>
                Whoever is on the stove will happily talk you through what is in the pot, how long
                it has been on and why it is worth the wait.
              </p>
              <a
                className="btn btn--ghost btn--sm"
                href={SITE.business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="ig" className="ico" /> See it on Instagram
              </a>
            </div>
          </Reveal>
        ) : (
          <div className="ritual__grid">
            {steps.map((step, i) => (
              <Reveal as="article" className="ritual__card" key={step.step} delay={i * 80}>
                <p className="ritual__step">{step.step}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {step.notes.length > 0 && (
                  <ul className="ritual__notes">
                    {step.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
