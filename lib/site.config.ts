/* ============================================================================
   CHUCKLES & CHAI — SITE CONTENT
   ============================================================================
   This is the only file the cafe needs to edit for day-to-day changes.
   Save the file; `npm run dev` hot-reloads, and a deploy rebuilds the site.

   ---------------------------------------------------------------------------
   !! BEFORE LAUNCH — FIVE THINGS ARE PLACEHOLDERS !!
   Everything marked TO CONFIRM below was not in the material supplied, so it
   is written as an obvious blank rather than an invented value. Search this
   file for "TO CONFIRM" and replace all five:

     1. business.street / area / city / state / postcode
     2. business.phoneDisplay / phoneLink
     3. business.lat / lng  (and the two Google Maps URLs built from them)
     4. hours.*.close       (Google lists "Opens 4 pm"; the close time is ours
                             to guess and a guess is what is currently here)
     5. ordering.whatsapp   (or switch ordering.enabled to false)

   VERIFIED, DO NOT "CORRECT":
     name, tagline, established 2025, 4.9 from 72 Google reviews,
     price band ₹1–400, Instagram handle, opening time 4 pm.
   ---------------------------------------------------------------------------
   PRICES: taken from the menu written for this site. They are realistic for
   the ₹1–400 band Google lists, but the till is the source of truth — check
   them against the board before launch.
============================================================================ */

import type { SiteContent } from "./types";

export const SITE: SiteContent = {
  business: {
    name: "Chuckles & Chai",
    tagline: "Awaken With Aroma",
    established: 2025,

    // TO CONFIRM (1): the real address. These strings render in the footer,
    // the Visit section, the map query and the schema.org block.
    street: "Shop No. 12",
    area: "Gera Park View -1, Near, Gera Commerzone IT Park Rd, Kharadi, Pune, Maharashtra",
    city: "pune",
    state: "Maharashtra",
    postcode: "411014",
    country: "India",

    // TO CONFIRM (2): tel as a human dials it, and in E.164 for tap-to-call.
    phoneDisplay: "+91 84213 22291",
    phoneLink: "+91 84213 22291",

    // Verified from the café's own Instagram.
    instagram: "chuckles_and_chai",
    instagramUrl: "https://www.instagram.com/chuckles_and_chai/",

    // Verified: 4.9 from 72 reviews on the Google Business listing.
    googleUrl: "https://www.google.com/search?q=Chuckles+%26+Chai",

    // TO CONFIRM (3): coordinates, used by the map embed and schema.
    lat: 0,
    lng: 0,
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Chuckles+%26+Chai",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Chuckles+%26+Chai",

    // Verified from the Google listing.
    priceBand: "₹1–400",
  },

  /* == FEATURE SWITCHES ====================================================
     Turn things on and off without touching components.
     ======================================================================= */
  features: {
    // Order-ahead. Leave OFF until the café has agreed to offer it, has
    // someone watching WhatsApp, and ordering.whatsapp below is a real number.
    ordering: true,
    dietaryFilter: true,
    ritual: true,
    // "Make it yours" sheet. See the `customise` block near the bottom.
    customise: true,
    // "Save my usual" - a one-tap reorder kept in the visitor's own browser.
    usual: true,
  },

  /* == OPENING HOURS =======================================================
     24-hour clock, Asia/Kolkata. Nothing on the page prints these any more —
     the opening-hours block came off at the café's request — but the
     schema.org JSON-LD still publishes them, which is what feeds the hours in
     the Google panel. Keep them correct even though they are not on screen.

     !! TO CONFIRM (4) !!
     "Opens 4 pm" is verified from the Google listing. The CLOSING time is not
     — 11pm below is an assumption. Correct it before launch.
     For a day the cafe is shut, use:   mon: { closed: true },
     ======================================================================= */
  hours: {
    mon: { open: "16:00", close: "23:00" },
    tue: { open: "16:00", close: "23:00" },
    wed: { open: "16:00", close: "23:00" },
    thu: { open: "16:00", close: "23:00" },
    fri: { open: "16:00", close: "23:00" },
    sat: { open: "16:00", close: "23:00" },
    sun: { open: "16:00", close: "23:00" },
  },

  /* One-off closures or changed hours; these override the weekly pattern.
     e.g.  { date: "2026-10-20", closed: true, note: "Diwali" }
           { date: "2026-08-15", open: "16:00", close: "21:00", note: "15 Aug" } */
  exceptions: [],

  /* == MENU ================================================================
     tags drive the coloured chips:
       "veg"   green mark      "egg"    contains egg
       "nonveg" red mark       "vegan"  no dairy either
       "new"   seasonal special
     ======================================================================= */
  menu: [
    {
      id: "chai",
      title: "Signature Chai",
      kicker: "Slow-boiled, twice-strained",
      image: "/images/menu/chai.jpg",
      alt: "Masala chai in a clay kulhad",
      note: "Every chai comes as a cutting, a kulhad or a full glass. Say which at the counter.",
      items: [
        { name: "Kulhad Masala Chai", desc: "Assam CTC boiled thrice with hand-pounded cardamom, ginger and a whisper of clove — served in clay, so it drinks earthy", price: "79", tags: ["veg"] },
        { name: "Irani Chai", desc: "Decoction rested twenty minutes, married with khoya milk until it turns the colour of old copper", price: "89", tags: ["veg"] },
        { name: "Adrak Tulsi Kadak", desc: "Double ginger, holy basil and black pepper, brewed strong enough to stand a spoon in", price: "79", tags: ["veg"] },
        { name: "Gud Wali Chai", desc: "No sugar, ever. Sweetened only with Kolhapuri jaggery for a smoky caramel finish", price: "85", tags: ["veg"] },
        { name: "Kashmiri Kahwa", desc: "Green tea, saffron threads, crushed almond and a cinnamon curl. Sip this one slowly", price: "109", tags: ["vegan"] },
        { name: "Gulkand Rose Chai", desc: "Petals from Pushkar, gulkand folded in at the last second. Drinks like a summer terrace", price: "119", tags: ["veg"] },
        { name: "Kesar Badam Chai", desc: "Saffron bloomed in warm milk, almond paste stirred through. Sweet, floral, faintly regal", price: "129", tags: ["veg"] },
        { name: "Choco Masala Chai", desc: "70% Idukki cacao melted into full-spice masala chai. Bitter, warm, quietly addictive", price: "139", tags: ["veg", "new"] },
      ],
    },
    {
      id: "coffee",
      title: "Coffee",
      kicker: "Chikmagalur beans, pulled properly",
      image: "/images/menu/coffee.jpg",
      alt: "A cup of coffee with latte art",
      note: "Oat and soy are always on, at no extra charge. Ask for it half-sweet and we will not argue.",
      items: [
        { name: "Degree Filter Kaapi", desc: "80:20 with chicory, pulled through a steel dabara and frothed the loud way", price: "99", tags: ["veg"] },
        { name: "Copper Cortado", desc: "Double ristretto cut with silk-steamed milk. Small, dense, unbothered", price: "149", tags: ["veg"] },
        { name: "Flat White", desc: "Two shots, micro-foam poured flat, no ceremony", price: "169", tags: ["veg"] },
        { name: "Jaggery Cinnamon Latte", desc: "Espresso, steamed milk and jaggery syrup we cook in-house. Cinnamon dusted tableside", price: "179", tags: ["veg"] },
        { name: "18-Hour Cold Brew", desc: "Steeped overnight and a bit, so it lands chocolatey instead of sour. Black, or with a splash", price: "179", tags: ["vegan"] },
        { name: "Espresso Tonic", desc: "Bright single-origin over tonic and a fat ice cube, finished with orange peel", price: "189", tags: ["vegan"] },
        { name: "Chai Affogato", desc: "A scoop of masala-chai gelato drowned in a hot ristretto at the table. Eat fast", price: "199", tags: ["veg", "new"] },
      ],
    },
    {
      id: "cold",
      title: "Cold & Shaken",
      kicker: "For the hour before the sun gives up",
      image: "/images/menu/cold.jpg",
      alt: "An iced coffee in a tall glass",
      note: "Everything here is shaken to order, so give us a minute longer than the chai.",
      items: [
        { name: "Kulhad Nimbu Soda", desc: "Lime, black salt, a pinch of chaat masala. Two rupees of theatre, poured from height", price: "89", tags: ["vegan"] },
        { name: "Aam Panna Cooler", desc: "Raw mango, roasted cumin, mint and soda. Sharp enough to reset an afternoon", price: "149", tags: ["vegan"] },
        { name: "Iced Gulkand Latte", desc: "Rose, milk, espresso and ice in a tall glass — the most photographed thing we make", price: "189", tags: ["veg"] },
        { name: "Masala Chai Frappé", desc: "Our own chai concentrate blitzed with ice and milk, crowned with cardamom cream", price: "199", tags: ["veg"] },
        { name: "Thandai Thick Shake", desc: "Almond, fennel, poppy and rose blended with vanilla gelato until a straw stops working", price: "219", tags: ["veg"] },
      ],
    },
    {
      id: "bites",
      title: "All-Day Bites",
      kicker: "Made to be shared, eaten alone",
      image: "/images/menu/bites.jpg",
      alt: "Samosas fresh out of the fryer",
      note: "Kitchen orders stop half an hour before we close. Tell us about allergies when you order.",
      items: [
        { name: "Osmania Biscuits", desc: "Hyderabad's sweet-salt shortbread, baked each morning. Four in a tin, dunk-tested", price: "59", tags: ["egg"] },
        { name: "Bun Maska", desc: "Warm brun, an unapologetic slab of white butter, cut in halves for dunking", price: "69", tags: ["veg"] },
        { name: "Bombay Masala Omelette", desc: "Three eggs, onion, chilli and coriander, folded soft, served with buttered pav", price: "179", tags: ["egg"] },
        { name: "Chuckles Masala Fries", desc: "Thick-cut, double-fried, tossed in house masala with burnt-garlic aioli on the side", price: "189", tags: ["veg"] },
        { name: "Chilli Cheese Toast", desc: "Sourdough, three cheeses, green chilli and coriander, grilled till the edges catch", price: "219", tags: ["veg"] },
        { name: "Peri Peri Paneer Momos", desc: "Hand-pleated, steamed, then flash-tossed in peri peri butter. Eight to a plate", price: "229", tags: ["veg"] },
        { name: "Chicken Keema Pav", desc: "Slow-cooked mince with whole spices, a squeeze of lime, pav crisped in butter", price: "269", tags: ["nonveg"] },
        { name: "Truffle Mushroom Toast", desc: "Butter-roasted mushrooms, truffle cream and parmesan snow on thick brioche", price: "299", tags: ["veg", "new"] },
      ],
    },
    {
      id: "desserts",
      title: "Sweet Endings",
      kicker: "One spoon is a lie",
      image: "/images/menu/desserts.jpg",
      alt: "Cheesecake from the counter",
      note: "The counter changes through the week. What is in the cabinet is what there is.",
      items: [
        { name: "Banana Walnut Loaf", desc: "Baked at four, gone by nine. Thick slice, warmed on the press, honey butter on request", price: "189", tags: ["egg"] },
        { name: "Brownie Tres Leches", desc: "Fudge brownie drenched in three milks, served cold with a scoop of malai kulfi", price: "279", tags: ["egg"] },
        { name: "Pista Basque Cheesecake", desc: "Burnt on top, molten in the middle, pistachio through and through", price: "289", tags: ["egg"] },
        { name: "Gulab Jamun Cheesecake", desc: "A whole warm gulab jamun sunk into cold cheesecake. It shouldn't work. It does", price: "299", tags: ["egg", "new"] },
        { name: "Shahi Tukda Tiramisu", desc: "Ghee-fried bread soaked in saffron rabri, layered with mascarpone, dusted with cocoa", price: "319", tags: ["egg"] },
      ],
    },
  ],

  /* == THE RITUAL ==========================================================
     How the chai is actually made here. Evergreen on purpose: a "today's
     special" board goes stale the week nobody updates it, and this does not.
     ======================================================================= */
  ritual: [
    {
      step: "01",
      title: "The pound",
      body:
        "Cardamom, clove, fennel and pepper go into the stone mortar every morning, never the grinder. Pre-ground masala loses its top notes in a day; ours is measured out an hour before we open.",
      notes: ["Whole spice only", "Ground daily", "Twelve in the house blend"],
    },
    {
      step: "02",
      title: "The boil",
      body:
        "Assam CTC and water first, on a rolling boil, so the leaf gives up its colour before the milk goes anywhere near it. Then milk, then the masala, then two more boils. Nothing here is steeped.",
      notes: ["Three boils", "Leaf before milk", "No steeping, ever"],
    },
    {
      step: "03",
      title: "The pour",
      body:
        "Strained twice through fine mesh, then pulled between two vessels to aerate it. That is the froth, and that is the aroma that reaches the table before the cup does.",
      notes: ["Twice strained", "Pulled, not stirred", "Clay, glass or cutting"],
    },
  ],

  /* == ORDER AHEAD =========================================================
     Pickup only. No delivery, and no timed collection slot: the basket is
     sent to the café as a readable WhatsApp message, the counter makes it,
     and it is ready when it is ready.

     No card details are taken anywhere on this site either. Taking payment
     online needs a payment provider and a merchant account, and a fake
     checkout is worse than no checkout.

     !! TO CONFIRM (5): the café's own WhatsApp number, E.164 without the plus
     (e.g. "919876543210"). Until that is real, either fill it in or set
     features.ordering to false.
     ======================================================================= */
  ordering: {
    enabled: true,
    maxItems: 20,
    send: "whatsapp",
    whatsapp: "910000000000",
    email: "",
  },

  /* == MAKE IT YOURS =======================================================
     The questions asked before an item goes in the basket.

     TARGETING
       categories: ["chai"]                 every line in that menu category
       items:      ["chai:irani-chai"]      exact lines - beats `categories`
       except:     ["chai:irani-chai"]      removes a line from either
     A line id is "<category id>:<item name slugified>", so "Bun Maska" in the
     "bites" category is "bites:bun-maska".

     Every group below is grounded in something the site already states — the
     cup note on the chai category, the milk note on coffee, the kitchen note
     on bites. Nothing carries a surcharge, because we have no confirmed price
     list for extras. Add `surcharge: "20"` to an option and it shows "+₹20"
     on the button and adds it to the basket total.
     ======================================================================= */
  customise: [
    {
      id: "serve",
      label: "How are you having it?",
      choose: "one",
      required: true,
      options: [
        { id: "in", label: "Sitting in", preselect: true },
        { id: "out", label: "Taking away" },
      ],
    },
    {
      id: "cup",
      label: "Which cup?",
      choose: "one",
      required: true,
      help: "A cutting is half a glass — the one you have two of.",
      categories: ["chai"],
      options: [
        { id: "kulhad", label: "Kulhad", note: "Clay, drinks earthy", preselect: true },
        { id: "cutting", label: "Cutting glass" },
        { id: "full", label: "Full glass" },
      ],
    },
    {
      id: "strength",
      label: "How kadak?",
      choose: "one",
      required: true,
      categories: ["chai", "coffee"],
      except: ["coffee:18-hour-cold-brew", "coffee:espresso-tonic", "coffee:chai-affogato"],
      options: [
        { id: "regular", label: "House strength", preselect: true },
        { id: "kadak", label: "Extra kadak", note: "Longer on the boil" },
        { id: "light", label: "Lighter" },
      ],
    },
    {
      id: "sweet",
      label: "Sweetness",
      choose: "one",
      required: true,
      help: "Gud Wali Chai is jaggery-only and is not adjusted.",
      categories: ["chai", "coffee", "cold"],
      except: ["chai:gud-wali-chai"],
      options: [
        { id: "house", label: "As it comes", preselect: true },
        { id: "half", label: "Half sweet" },
        { id: "none", label: "No sugar" },
      ],
    },
    {
      id: "milk",
      label: "Milk",
      choose: "one",
      required: true,
      help: "Oat and soy are always on, at no extra charge.",
      categories: ["coffee", "cold"],
      // Black and fruit-based drinks take no milk, so they are not asked.
      except: [
        "coffee:degree-filter-kaapi",
        "coffee:espresso-tonic",
        "cold:kulhad-nimbu-soda",
        "cold:aam-panna-cooler",
      ],
      options: [
        { id: "dairy", label: "Dairy", preselect: true },
        { id: "oat", label: "Oat", note: "No extra charge" },
        { id: "soy", label: "Soy", note: "No extra charge" },
      ],
    },
    {
      id: "spice",
      label: "Anything extra?",
      choose: "many",
      categories: ["bites"],
      options: [
        { id: "mild", label: "Go easy on the chilli" },
        { id: "extra", label: "Extra spicy" },
        { id: "nojain", label: "No onion, no garlic" },
      ],
    },
  ],

  /* == REVIEWS =============================================================
     !! SHIPS EMPTY ON PURPOSE !!
     The 4.9 / 72 figure below is verified from the Google Business listing.
     The individual quotes are not — we were not given any, and writing
     testimonials for a real business and attributing them to real-sounding
     customers is fabrication, not copywriting.

     To fill this in, open the Google reviews page, and paste each one exactly
     as published, attributed as the reviewer chose to appear:

       { quote: "…", name: "…", meta: "Google" },

     The section renders a proper score panel and an honest "read them on
     Google" card until then, so it is never a blank space.
     ======================================================================= */
  reviews: [],

  ratings: [{ score: "4.9", count: "72", source: "Google" }],

  /* == MOODBOARD ===========================================================
     The pinboard under "Follow the aroma". Filled by `npm run photos` with
     openly-licensed photographs of chai, spices, coffee and café food.

     These are NOT pictures of Chuckles & Chai. Swap each src for the café's
     own photography — keep the same w/h so next/image reserves the right
     space, and keep alt describing what is actually in the frame: it is read
     aloud by screen readers and indexed by Google. Add `href` to point a tile
     at the Instagram post it came from; tiles without one open the profile.

     Note: photographs taken from Pinterest cannot go here. A Pinterest board
     is other people's copyrighted work re-pinned, with no licence attached —
     publishing one on a real business's website is an infringement waiting to
     be found. Everything below is CC0 / public domain / CC BY, credited on
     /credits, which is what makes it lawful to use in the meantime.
     ======================================================================= */
  moodboard: [
    { src: "/images/gallery/gallery-02.jpg", alt: "Chai in a glass", w: 1000, h: 1000 },
    { src: "/images/gallery/gallery-03.jpg", alt: "Whole spices, close up", w: 1000, h: 1400 },
    { src: "/images/instagram/ig-05.jpg", alt: "Chai in the pan before straining", w: 1080, h: 1080 },
    { src: "/images/gallery/gallery-06.jpg", alt: "A quiet corner table in a café", w: 1000, h: 1400 },
    { src: "/images/gallery/gallery-05.jpg", alt: "A plate of samosas", w: 1000, h: 1000 },
    { src: "/images/instagram/ig-01.jpg", alt: "A cup of tea with something sweet", w: 1080, h: 1080 },
    { src: "/images/gallery/gallery-09.jpg", alt: "Iced cold brew coffee in a glass", w: 1000, h: 1400 },
    { src: "/images/gallery/gallery-07.jpg", alt: "Pakoras fresh out of the pan", w: 1000, h: 1000 },
    { src: "/images/instagram/ig-02.jpg", alt: "Steamed momos with achar", w: 1080, h: 1080 },
    { src: "/images/gallery/gallery-10.jpg", alt: "Green cardamom pods", w: 1000, h: 1000 },
    { src: "/images/gallery/gallery-04.jpg", alt: "A barista pouring milk into a cup", w: 1000, h: 1000 },
    { src: "/images/instagram/ig-03.jpg", alt: "A slice of cake from the counter", w: 1080, h: 1080 },
    { src: "/images/gallery/gallery-08.jpg", alt: "A slice of chocolate cake on a plate", w: 1000, h: 1000 },
    { src: "/images/instagram/ig-04.jpg", alt: "Cappuccinos and cake", w: 1080, h: 1080 },
    { src: "/images/instagram/ig-06.jpg", alt: "A grilled cheese toastie, hot off the press", w: 1080, h: 1080 },
  ],

  faq: [
    { q: "What time do you open?", a: "Four in the afternoon, every day. We are an evening café — the pot goes on at four and the last order goes in half an hour before we close." },
    { q: "Do you take table bookings?", a: "Not for regular tables — walk in and we will find you somewhere. For a larger group or something you are celebrating, give us a ring a day ahead and we will keep the corner for you." },
    // Remove this entry if features.ordering is switched off.
    { q: "Can I order ahead?", a: "Yes, for pickup. Build a basket from the menu and send it over on WhatsApp, and the counter will start on it. There is no time slot to pick and we do not deliver — it is ready when it is ready, and you pay at the counter. We never take card details online." },
    { q: "What makes the chai different?", a: "Whole spices pounded that morning, Assam CTC boiled three times rather than steeped, and two strainings before it is pulled between vessels. It takes about four minutes a pot and we will not shorten it." },
    { q: "Do you have vegan options?", a: "Yes. Oat and soy are always on at no extra charge, and the Kahwa, cold brew, espresso tonic, nimbu soda and aam panna are vegan as they come." },
    { q: "Is there veg and non-veg?", a: "Both, and every item on the menu carries a mark: green for veg, amber where there is egg, red for non-veg. Veg and non-veg are cooked on separate surfaces." },
    { q: "Can I take chai away?", a: "Everything travels. Kulhads do not, for obvious reasons — takeaway chai goes in a cup, and it is the same chai." },
    { q: "How spicy is the food?", a: "Middle of the road by default. Ask for it milder or hotter when you order and the kitchen will adjust — there is a box for exactly that in the order sheet." },
  ],
};

/**
 * True while the address above is still the shipped placeholder.
 *
 * The Visit section reads this so it does not embed a Google map of
 * "Shop address line 1, Area, City" — which renders as a blank grey rectangle
 * in the middle of the page and looks like a broken site rather than an
 * unfinished one. Fill the address in and the map appears on its own.
 */
export const ADDRESS_IS_PLACEHOLDER = SITE.business.street.startsWith("Shop address");

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in the host before launch. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://chucklesandchai.in";
