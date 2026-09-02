/**
 * schema.org structured data.
 *
 * Generated from the same config that renders the page, so the hours Google
 * reads can never drift from the hours a visitor sees.
 */

import { schemaOpeningHours } from "./hours";
import { SITE, SITE_URL } from "./site.config";

export function localBusinessSchema() {
  const b = SITE.business;
  const google = SITE.ratings.find((r) => r.source === "Google");

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${SITE_URL}/#business`,
    name: b.name,
    alternateName: b.tagline,
    slogan: b.tagline,
    description:
      "Evening chai café serving slow-boiled masala chai, filter kaapi, cold shakes and all-day bites. Whole spices pounded daily, Assam leaf boiled three times, poured from four in the afternoon.",
    url: `${SITE_URL}/`,
    telephone: b.phoneLink,
    image: `${SITE_URL}/images/og-image.jpg`,
    logo: `${SITE_URL}/assets/logo.svg`,
    priceRange: b.priceBand,
    foundingDate: String(b.established),
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    servesCuisine: ["Chai", "Coffee", "Indian", "Cafe", "Desserts"],
   address: {
  "@type": "PostalAddress",
  streetAddress: "Shop No. 12, Gera Park View -1, Near Gera Commerzone IT Park Rd",
  addressLocality: "Kharadi",
  addressRegion: "Maharashtra",
  postalCode: "411014",
  addressCountry: "IN",
},
    // Zeroed coordinates are the "not supplied yet" state in site.config.ts.
    // Publishing 0,0 would pin the café in the Atlantic, so the block is
    // omitted entirely until real numbers are filled in.
    ...(b.lat && b.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng } }
      : {}),
    hasMap: b.mapsUrl,
    sameAs: [b.instagramUrl],
    openingHoursSpecification: schemaOpeningHours(SITE).map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    amenityFeature: [
      "Vegetarian options",
      "Vegan options",
      "Non-vegetarian options",
      "Takeaway",
      "Dine in",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    ...(google
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: google.score,
            reviewCount: google.count,
            bestRating: "5",
          },
        }
      : {}),
    // Only real, published reviews go in here. The array in site.config.ts
    // ships empty on purpose, so this key simply does not appear until the
    // café pastes its own Google reviews in.
    ...(SITE.reviews.length
      ? {
          review: SITE.reviews.slice(0, 3).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
            reviewBody: r.quote,
          })),
        }
      : {}),
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
