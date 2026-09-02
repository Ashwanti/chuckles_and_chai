/**
 * Shared content types for the Chuckles & Chai site.
 *
 * These exist so that a typo in site.config.ts is a build error rather than a
 * blank section on a live page. `npm run typecheck` catches it before deploy.
 */

/**
 * Dietary markers rendered as small chips beside a menu item.
 *
 *   "veg"    green mark — no meat, no egg
 *   "egg"    contains egg (the honest middle ground Indian menus need)
 *   "nonveg" red mark
 *   "vegan"  no dairy either; implies "veg"
 *   "new"    seasonal special, not a diet
 */
export type DietTag = "veg" | "egg" | "nonveg" | "vegan" | "new";

/** Keys for the weekly opening pattern. */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * A day the cafe is open, in 24-hour Asia/Kolkata time.
 *
 * Hours are no longer printed anywhere on the page — the café asked for the
 * opening-hours block to come off. They are still here because the schema.org
 * JSON-LD publishes them, which is what puts the hours in the Google panel
 * people actually check.
 */
export interface OpenDay {
  open: string;
  close: string;
  closed?: false;
}

/** A day the cafe is shut. */
export interface ClosedDay {
  closed: true;
  open?: never;
  close?: never;
}

export type DaySchedule = OpenDay | ClosedDay;

/**
 * A one-off override for a single date ("YYYY-MM-DD"), such as a festival.
 * Takes precedence over the weekly pattern.
 */
export type HoursException = { date: string; note?: string } & DaySchedule;

export interface MenuItem {
  name: string;
  desc?: string;
  /**
   * Price as a plain string, e.g. "79" renders as ₹79.
   * "-" renders as an em dash: the deliberate "not yet confirmed" state.
   */
  price: string;
  tags?: DietTag[];
}

export interface MenuCategory {
  id: string;
  title: string;
  kicker: string;
  image: string;
  alt: string;
  note?: string;
  items: MenuItem[];
}

export interface Review {
  quote: string;
  name: string;
  meta: string;
}

export interface Photo {
  src: string;
  alt: string;
  /** Intrinsic size. Required so layout space is reserved before the image loads. */
  w: number;
  h: number;
  /** Optional deep link, used by the Instagram tiles. */
  href?: string;
}

export interface FaqEntry {
  q: string;
  a: string;
}

export interface Business {
  name: string;
  /** Shown under the wordmark and in the seal. */
  tagline: string;
  established: number;
  street: string;
  area: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phoneDisplay: string;
  phoneLink: string;
  instagram: string;
  instagramUrl: string;
  /** Google Business listing / reviews page. */
  googleUrl: string;
  lat: number;
  lng: number;
  directionsUrl: string;
  mapsUrl: string;
  /** As Google lists it, e.g. "₹1–400". */
  priceBand: string;
}

export interface RatingSource {
  score: string;
  count: string;
  source: string;
}

/**
 * One card on "The Ritual" board — how a thing is actually made here.
 * Evergreen by design: it describes our own method, so it does not go stale
 * the way a "today's special" board would.
 */
export interface RitualStep {
  /** Short label, e.g. "The boil". */
  step: string;
  title: string;
  body: string;
  /** Two or three plain-language details. */
  notes: string[];
}

export interface OrderingConfig {
  /**
   * Master switch for order-ahead. Turn on ONLY once the café has agreed to
   * actually offer and staff it, and the WhatsApp number below is real.
   *
   * There is deliberately no scheduling here. The café does not deliver and
   * does not take timed collection slots: an order is sent over, the counter
   * makes it, and it is ready when it is ready. Adding a time picker would be
   * promising something nobody has agreed to hit.
   */
  enabled: boolean;
  /** Cap on total items, to keep orders realistic for a small kitchen. */
  maxItems: number;
  /**
   * How a finished basket reaches the café. No card details are ever taken:
   * that needs a payment provider and a merchant account, and faking it
   * would be worse than not having it. Payment happens at the counter.
   */
  send: "whatsapp" | "email";
  /** E.164 without the plus, for wa.me links. Used when send is "whatsapp". */
  whatsapp?: string;
  /** Used when send is "email". */
  email?: string;
}

export interface FeatureFlags {
  /** Order-ahead basket. */
  ordering: boolean;
  /** Filter the menu by veg / vegan / non-veg. */
  dietaryFilter: boolean;
  /** "The Ritual" board. */
  ritual: boolean;
  /** "Make it yours" sheet - milk, sweetness, strength, cup. */
  customise: boolean;
  /** "Save my usual" - one-tap reorder of a saved drink, kept on the device. */
  usual: boolean;
}

/* == CUSTOMISING A DRINK ================================================== */

/** One choice inside a group, e.g. "Kulhad". */
export interface CustomiseOption {
  id: string;
  label: string;
  /** Small grey note under the label, e.g. "No extra charge". */
  note?: string;
  /**
   * Extra cost as a plain string, e.g. "20". Leave it out for no charge.
   * Nothing here ships with a surcharge: we have no confirmed price list for
   * extras, and an invented one on a live site is worse than none.
   */
  surcharge?: string;
  /** Selected when the sheet opens. */
  preselect?: boolean;
}

/**
 * A question asked about an item before it goes in the basket.
 *
 * Targeting: `items` (exact line ids) wins over `categories`, and `except`
 * removes individual lines from either. A cold brew has no "how strong";
 * a plate of momos has no "which cup".
 */
export interface CustomiseGroup {
  id: string;
  label: string;
  /** "one" renders radios, "many" renders checkboxes. */
  choose: "one" | "many";
  /** A "one" group that must be answered before the item can be added. */
  required?: boolean;
  /** Sentence shown under the group label. */
  help?: string;
  /** Menu category ids this applies to, e.g. ["chai"]. */
  categories?: string[];
  /** Exact line ids, e.g. ["chai:kulhad-masala-chai"]. Overrides `categories`. */
  items?: string[];
  /** Line ids to exclude. */
  except?: string[];
  options: CustomiseOption[];
}

/** A choice the customer actually made, carried on the basket line. */
export interface SelectedOption {
  /** Group label, so the café reads "Milk: Oat" rather than "milk: oat". */
  group: string;
  label: string;
  surcharge?: string;
}

export interface SiteContent {
  business: Business;
  features: FeatureFlags;
  hours: Record<DayKey, DaySchedule>;
  exceptions: HoursException[];
  menu: MenuCategory[];
  ritual: RitualStep[];
  ordering: OrderingConfig;
  customise: CustomiseGroup[];
  reviews: Review[];
  ratings: RatingSource[];
  /**
   * One pinboard of photographs, in the order they appear. Rendered as a
   * masonry, so mixed portrait and square crops are a feature rather than
   * something to normalise away.
   */
  moodboard: Photo[];
  faq: FaqEntry[];
}

/* == ORDERING ============================================================= */

export interface CartLine {
  /**
   * Stable id. "<categoryId>:<slugified item name>" for a plain item, with the
   * chosen options appended for a customised one - so a chai with oat milk and
   * a chai with buffalo milk are two lines, not one with quantity 2.
   */
  id: string;
  /** The un-customised id, kept so "add another" can reopen the same sheet. */
  base?: string;
  name: string;
  /** Category title, shown as context in the basket. */
  category: string;
  /** Raw config price string; "-" means not yet priced. */
  price: string;
  qty: number;
  /** Free-text note, e.g. "extra kadak". */
  note?: string;
  tags?: DietTag[];
  /** Choices made in the customise sheet. */
  options?: SelectedOption[];
}
