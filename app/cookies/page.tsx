import type { Metadata } from "next";
import Link from "next/link";

import { DraftNote, LastUpdated, LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "What this website stores on your device, and what it does not.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" intro="What this site stores on your device, and what it does not.">
      <DraftNote>
        <strong>To be reviewed before launch.</strong> This describes the site exactly as built. If
        analytics, a booking tool, a pixel or any embedded feed is added later, this page must be
        updated and a proper consent banner will be needed instead of the simple notice used now.
      </DraftNote>

      <h2>The short version</h2>
      <p>
        This website sets <strong>no tracking cookies, no advertising cookies and no analytics
        cookies</strong>. There is nothing here that follows you around the internet.
      </p>

      <h2>What we do store</h2>
      <p>
        In your browser&rsquo;s local storage rather than in cookies, and never sent to us:
      </p>
      <ul>
        <li>
          <strong>chuckles-cookie-ack</strong> &mdash; set when you press &ldquo;Got it&rdquo; on
          the notice at the bottom of the page, so it does not reappear on every visit. It holds the
          value <code>1</code>.
        </li>
        {SITE.features.ordering && (
          <li>
            <strong>chuckles-basket-v1</strong> &mdash; the pickup basket you have built, so it
            survives a refresh or an accidental back button. It holds the items and any notes you
            typed, stays on your device, and is cleared when you empty the basket.
          </li>
        )}
      </ul>
      <p>
        Both stay on your device and you can clear them at any time by clearing site data in your
        browser.
      </p>

      <h2>Cookies other companies may set</h2>
      <ul>
        <li>
          <strong>Google Maps</strong> &mdash; the map in the Visit Us section is embedded from
          Google and loads with the page, so Google sets its own cookies under its own policy as
          soon as you open the site. We do not see them and we cannot read them. If you would
          rather Google set nothing, block third-party cookies for this site; the address and the
          &ldquo;Get directions&rdquo; link work perfectly well without the map.
        </li>
        <li>
          <strong>Fonts</strong> &mdash; none. The typefaces are built into the site and served from
          our own domain, so unlike most websites there is no request to Google Fonts at all.
        </li>
      </ul>
      <p>
        Following any link to Instagram takes you to Instagram, where Meta&rsquo;s own cookies and
        policies apply. Nothing from Instagram is embedded in this page.
      </p>

      <h2>Turning cookies off</h2>
      <p>
        Every major browser lets you block or delete cookies and local storage through its settings.
        Because this site does not rely on them for anything except remembering that you dismissed a
        message, blocking them will not break it.
      </p>

      <h2>Questions</h2>
      <p>
        Ask us next time you are in, or ring{" "}
        <a href={`tel:${SITE.business.phoneLink}`}>{SITE.business.phoneDisplay}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <LastUpdated />
    </LegalPage>
  );
}
