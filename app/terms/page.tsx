import type { Metadata } from "next";

import { DraftNote, LastUpdated, LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms on which this website is provided.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const b = SITE.business;
  return (
    <LegalPage title="Terms of Use" intro="The terms on which this website is provided.">
      <DraftNote>
        <strong>To be completed before launch.</strong> These are plain-English website terms only.
        They are not legal advice, and the business details below must be confirmed. Have them
        checked by someone qualified before publishing.
      </DraftNote>

      <h2>About this site</h2>
      <p>
        This website is operated by <strong>[BUSINESS LEGAL NAME TO BE CONFIRMED]</strong>, trading
        as {b.name}, {b.street}, {b.area}, {b.city}, {b.state} {b.postcode}. By using the site you accept
        these terms.
      </p>

      <h2>Menus, prices and availability</h2>
      <p>
        The menu shown here is a guide, not an offer. We cook to order, the specials board changes
        daily and the cake counter changes with it, so some items will not be available every day.{" "}
        <strong>The menu and prices displayed in the shop are always the ones that apply.</strong>
      </p>

      <h2>Allergies and dietary requirements</h2>
      <p>
        Dietary markers on this site (vegan, vegetarian, gluten free) are given in good faith, but
        recipes and suppliers change. Our kitchen handles gluten, dairy, nuts, eggs, soya and other
        allergens, so we cannot guarantee any dish is free from traces of them.
      </p>
      <p>
        <strong>If you have an allergy or intolerance, always tell a member of staff when you
        order</strong> so we can talk you through the options with the current information in front
        of us. Do not rely on this website for that.
      </p>

      <h2>Opening hours</h2>
      <p>
        The hours and the open/closed indicator on this site are generated from the times we have
        published. They may not reflect short-notice changes, bank holidays or unexpected closures.
        Our Instagram is the fastest place to find out if anything has changed on the day.
      </p>

      <h2>Tables and bookings</h2>
      <p>
        We do not take table bookings and this website does not offer any. {b.name} is walk-in only
        for eating in.
      </p>

      {SITE.features.ordering && (
        <>
          <h2>Collection orders</h2>
          <p>
            An order sent from this site is a <strong>request</strong>, not a confirmed sale. We will
            do our best to have it ready at the time you chose, but we may not be able to accept it
            &mdash; if we are unexpectedly busy, short-staffed, or an item has sold out. Nothing is
            agreed until we reply.
          </p>
          <p>
            <strong>No payment is taken online.</strong> You pay at the counter when you collect,
            and the price on the till at that moment is the price that applies. Where an item is
            shown here without a price, the total is confirmed in store.
          </p>
          <p>
            Please collect at the time you chose. Food made to order does not improve sitting on a
            counter, and we cannot hold it indefinitely.
          </p>
        </>
      )}

      <h2>Accuracy and availability</h2>
      <p>
        We try to keep everything here accurate and up to date, but we do not promise the site will
        always be available or completely free of errors. We may change or remove content at any
        time without notice.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The name {b.name}, the logo, the photography and the written content on this site belong to
        us or are used with permission. Please do not reproduce them commercially without asking
        first. Customer reviews quoted on this site remain the words of the people who wrote them and
        are reproduced from their public posts, with the source shown.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Where we link out &mdash; to Instagram or Google Maps &mdash; we are not
        responsible for the content of those sites or how they handle your data.
      </p>

      <h2>Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by
        negligence, for fraud, or for anything else that cannot be limited under Indian law. Beyond
        that, we are not liable for loss arising from your use of this website.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts at
        <strong> [CITY TO BE CONFIRMED]</strong> have exclusive jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        Ring <a href={`tel:${b.phoneLink}`}>{b.phoneDisplay}</a>, message us on{" "}
        <a href={b.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>, or call in
        at {b.street}.
      </p>

      <LastUpdated />
    </LegalPage>
  );
}
