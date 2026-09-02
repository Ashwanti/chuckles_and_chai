import Link from "next/link";

import { Brand } from "./Header";
import { Icon } from "./Icons";
import { NAV_LINKS } from "@/lib/nav";
import { SITE } from "@/lib/site.config";

export function Footer() {
  const b = SITE.business;

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <Brand />
            <p>
              An evening chai café. Whole spices pounded daily, Assam leaf boiled three times,
              poured from four in the afternoon. {b.tagline}.
            </p>
            <div className="footer__social">
              <a
                href={b.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${b.name} on Instagram`}
              >
                <Icon name="ig" />
              </a>
              <a href={`tel:${b.phoneLink}`} aria-label={`Call ${b.name} on ${b.phoneDisplay}`}>
                <Icon name="phone" />
              </a>
              <a
                href={b.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Directions to ${b.name} on Google Maps`}
              >
                <Icon name="nav" />
              </a>
            </div>
          </div>

          <div>
            <p className="footer__title">Find us</p>
            {/* An <address> rather than a list: every line then starts on the
                same left edge instead of inheriting a list item's own indent,
                which is what had the street sitting proud of the city. */}
            <address className="footer__addr">
              {b.street}
              <br />
              {b.area}
              <br />
              {b.city}, {b.state}
              <br />
              {b.postcode}
            </address>
            <p className="footer__addr-links">
              <a href={b.mapsUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
              </a>
              <br />
              <a href={`tel:${b.phoneLink}`}>{b.phoneDisplay}</a>
            </p>
          </div>

          <div>
            <p className="footer__title">Quick links</p>
            <ul className="footer__list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
              <li>
                <a href="#ritual">The Ritual</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer__title">Good to know</p>
            <ul className="footer__list">
              <li>
                <span>Open from 4pm, every day</span>
              </li>
              <li>
                <span>Walk in &mdash; no bookings needed</span>
              </li>
              <li>
                <span>Order ahead for pickup on WhatsApp</span>
              </li>
              <li>
                <span>Veg, egg and non-veg, all marked</span>
              </li>
              <li>
                <span>{b.priceBand} a head</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__mark" aria-hidden="true">
          <div className="footer__wordmark">Chuckles &amp; Chai</div>
        </div>

        <div className="footer__legal">
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} {b.name}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/credits">Photo credits</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
