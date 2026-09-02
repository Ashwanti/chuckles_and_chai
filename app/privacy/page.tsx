import type { Metadata } from "next";

import { DraftNote, LastUpdated, LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Chuckles & Chai handles personal data on this website.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const b = SITE.business;
  return (
    <LegalPage title="Privacy Policy" intro="How we handle personal data on this website.">
      <DraftNote>
        <strong>To be completed before launch.</strong> This is a working draft written around how
        the site actually behaves. The named data fiduciary and the retention
        periods below must be confirmed by the business, and the whole policy should be reviewed
        by someone qualified in Indian data protection law before it goes live.
      </DraftNote>

      <h2>Who we are</h2>
      <p>
        {b.name}, {b.street}, {b.area}, {b.city}, {b.state} {b.postcode}. You can reach us on{" "}
        <a href={`tel:${b.phoneLink}`}>{b.phoneDisplay}</a> or on Instagram at{" "}
        <a href={b.instagramUrl} target="_blank" rel="noopener noreferrer">@{b.instagram}</a>.
      </p>
      <p>
        For the purposes of the Digital Personal Data Protection Act, 2023, the data fiduciary for
        this website is <strong>[BUSINESS LEGAL NAME TO BE CONFIRMED]</strong>.
      </p>

      <h2>What this website collects</h2>
      <p>
        Very little. This site has no account sign-up, no newsletter and no booking system, and it
        stores nothing about you on our servers.
      </p>
      <ul>
        <li><strong>No analytics.</strong> There is no Google Analytics or comparable tracking on this site as built.</li>
        <li><strong>No advertising or tracking cookies</strong> are set by us.</li>
        <li>
          <strong>Preferences kept on your device.</strong> If you dismiss the cookie notice we store
          a single value so it stays shut{SITE.features.ordering ? ", and a pickup basket is kept in your browser so it survives a refresh" : ""}.
          {" "}These never leave your device and we cannot read them.
        </li>
      </ul>

      {SITE.features.ordering && (
        <>
          <h2>Pickup orders</h2>
          <p>
            If you build a basket and send it to us, you give us a{" "}
            <strong>name and a phone number</strong> so we know whose order it is and can ring you if
            something is off. You can add notes, which some people use to tell us about allergies.
            We do not deliver, and there is no collection time to choose.
          </p>
          <p>
            That information is <strong>not submitted to this website</strong>. Pressing the send
            button opens {SITE.ordering.send === "whatsapp" ? "WhatsApp" : "your email app"} with the
            order written out, and <em>you</em> send it. Nothing reaches us until you do, and the
            message travels through{" "}
            {SITE.ordering.send === "whatsapp"
              ? "WhatsApp, so Meta's privacy policy applies to it in transit"
              : "your own email provider, so their privacy policy applies to it in transit"}.
          </p>
          <p>
            We keep the message only as long as we need it to prepare and hand over your order, and
            we use it for nothing else &mdash; no marketing list, no sharing with anyone.{" "}
            <strong>[RETENTION PERIOD TO BE CONFIRMED BY THE BUSINESS]</strong>
          </p>
          <p>
            <strong>No card or payment details are taken anywhere on this site.</strong> You pay at
            the counter when you collect.
          </p>
        </>
      )}

      <h2>Things loaded from other companies</h2>
      <p>
        This site is built to keep third parties out of the page unless they earn their place:
      </p>
      <ul>
        <li>
          <strong>Fonts are self-hosted.</strong> The typefaces are downloaded at build time and
          served from our own domain, so no request is made to Google Fonts when you visit.
        </li>
        <li>
          <strong>Google Maps</strong> is embedded in the Visit Us section and loads with the
          page, which means your browser contacts Google and Google sets its own cookies under its
          own privacy policy. We receive nothing from that and have no access to it. Blocking
          third-party cookies for this site stops it; the address and the directions link still
          work.
        </li>
        <li>
          <strong>Instagram</strong> is linked to, but not embedded. Following a link takes you to
          Instagram, where their own privacy policy applies.
        </li>
      </ul>

      <h2>Your hosting provider</h2>
      <p>
        Whoever hosts this site will keep standard server logs, which typically include IP addresses
        and the pages requested. These are used to keep the site running and secure.{" "}
        <strong>[HOSTING PROVIDER AND LOG RETENTION PERIOD TO BE CONFIRMED]</strong>.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the Digital Personal Data Protection Act, 2023 you have the right to ask what personal
        data we hold about you, to have it corrected or erased, to nominate someone to exercise
        these rights on your behalf, and to withdraw consent you have given. Contact us using the
        details above and we will respond within one month.
      </p>
      <p>
        If you are unhappy with how we have handled your data, raise it with us first using the
        details above. If that does not resolve it, you may complain to the Data Protection Board
        of India.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes we will update this page and the date below.</p>

      <LastUpdated />
    </LegalPage>
  );
}
