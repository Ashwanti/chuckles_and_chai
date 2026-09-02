import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { ADDRESS_IS_PLACEHOLDER, SITE } from "@/lib/site.config";

/**
 * Visit us.
 *
 * A plain embedded map, loaded with the page — no click-to-load gate. That is
 * the café's call, and it has one consequence worth knowing: Google sets its
 * own cookies as soon as the page opens, which is why /cookies says so plainly
 * rather than claiming the map is opt-in.
 *
 * The address, the contact details and the map all read off site.config.ts, so
 * correcting the address in one place fixes the map pin too.
 */
function MapEmbed() {
  const { name, street, area, city, state, postcode } = SITE.business;

  /* Google renders an empty grey rectangle for an address it cannot find, so
     an unfinished config would put what looks like a broken map in the middle
     of the page. Until the address is real, show the one thing that is. */
  if (ADDRESS_IS_PLACEHOLDER) {
    return (
      <div className="visit__map-wait">
        <Icon name="map" className="visit__map-ico" />
        <p>
          <strong>{name}</strong>
          <span>
            Our full address is going up shortly. Tap Get directions, or give us a ring and we
            will point you the right way.
          </span>
        </p>
      </div>
    );
  }

  const query = encodeURIComponent(
    [name, street, area, city, state, postcode].filter(Boolean).join(", "),
  );

  return (
    <iframe
      src={`https://www.google.com/maps?q=${query}&output=embed`}
      title={`Map showing where to find ${name}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

export function Visit() {
  const b = SITE.business;

  /* Built as a list so every line starts on the same left edge and the labels
     sit in one column. Strung together in a paragraph, the address, the phone
     number and the handle each began at a different indent. */
  const DETAILS = [
    {
      label: "Address",
      icon: "pin" as const,
      value: (
        <address className="visit__addr">
          {b.street}
          <br />
          {b.area}, {b.city}
          <br />
          {b.state} {b.postcode}
        </address>
      ),
    },
    {
      label: "Phone",
      icon: "phone" as const,
      value: (
        <a className="link-sweep" href={`tel:${b.phoneLink}`}>
          {b.phoneDisplay}
        </a>
      ),
    },
    {
      label: "Instagram",
      icon: "ig" as const,
      value: (
        <a
          className="link-sweep"
          href={b.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{b.instagram}
        </a>
      ),
    },
  ];

  return (
    <section className="section visit" id="visit">
      <div className="wrap">
        <Reveal className="head head--split">
          <div>
            <p className="kicker">Visit us</p>
            <h2>
              Come and <span className="wink">find us.</span>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: "32ch" }}>
            Walk in, sit down, stay longer than you meant to.
          </p>
        </Reveal>

        <div className="visit__grid">
          <Reveal kind="left" className="visit__map">
            <MapEmbed />
          </Reveal>

          <Reveal kind="right" className="visit__panel">
            <dl className="visit__details">
              {DETAILS.map((row) => (
                <div className="visit__row" key={row.label}>
                  <dt className="visit__label">
                    <Icon name={row.icon} />
                    {row.label}
                  </dt>
                  <dd className="visit__value">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="cta-row visit__cta">
              <a className="btn" href={b.directionsUrl} target="_blank" rel="noopener noreferrer">
                Get directions <Icon name="nav" className="ico" />
              </a>
              <a className="btn btn--ghost" href={`tel:${b.phoneLink}`}>
                Call the café
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
