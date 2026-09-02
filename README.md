# Chuckles & Chai

Website for **Chuckles & Chai** — *Awaken With Aroma*. An evening chai café:
slow-boiled masala chai, degree filter kaapi, cold shakes and all-day bites,
open from 4pm.

Next.js 15 (App Router) · React 19 · TypeScript · one hand-written CSS design
system · no UI framework, no animation library, no tracking.

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## !! Before launch — five things are still placeholders

Everything below was **not** in the material supplied, so it ships as an
obvious blank rather than an invented value. `npm run build` prints the list
again every time, so it cannot be missed. All five live in
**`lib/site.config.ts`** — search the file for `TO CONFIRM`.

| # | What | Where | What breaks until it is set |
|---|------|-------|------------------------------|
| 1 | Street address, area, city, state, postcode | `business.street` … `business.postcode` | The Visit section shows a "we'll point you the right way" panel instead of a map; the footer prints the placeholder lines |
| 2 | Phone number | `business.phoneDisplay` / `phoneLink` | Every "Call" button dials nothing |
| 3 | Map coordinates | `business.lat` / `lng` | The `geo` block is omitted from the schema.org data (0,0 would pin the café in the Atlantic) |
| 4 | Closing time | `hours.*.close` | "Opens 4 pm" is verified from the Google listing. **The 11pm close is an assumption.** It is not printed on the page, but it *is* published in the JSON-LD that feeds the Google panel |
| 5 | WhatsApp number | `ordering.whatsapp` | The "Send order on WhatsApp" button opens a dead chat. Set `features.ordering: false` to switch order-ahead off entirely instead |

**Verified, do not "correct":** the name, the tagline, established 2025,
4.9 from 72 Google reviews, the ₹1–400 price band, the Instagram handle, and
the 4pm opening time.

Also set `NEXT_PUBLIC_SITE_URL` in the host to the real domain before deploy —
it is what canonical URLs, the sitemap and the OG tags are built from.

---

## Editing the site

`lib/site.config.ts` is the only file the café needs for day-to-day changes.
Save it, and `npm run dev` hot-reloads. It holds:

- **`business`** — name, address, phone, Instagram, price band
- **`features`** — switches for order-ahead, dietary filters, the Ritual board,
  the "make it yours" sheet and "save my usual". Turn one off and the section
  and its JavaScript disappear
- **`hours`** + **`exceptions`** — not printed anywhere on the page, but still
  published in the structured data. Festival closures go in `exceptions`
- **`menu`** — five categories, ~33 items. Prices are plain strings: `"79"`
  renders as ₹79, and `"-"` renders as an em dash meaning *not priced yet*.
  An unpriced item is still orderable; the basket says "confirmed in store"
- **`ritual`** — the three-step "how the chai is made" board
- **`ordering`** — pickup only. See below
- **`customise`** — the questions asked before an item reaches the basket
- **`reviews`** / **`ratings`** — see *Reviews* below
- **`moodboard`** — the pinboard photographs
- **`faq`** — also emitted as FAQ structured data

A typo in any of it is a **build error**, not a blank section on a live page:
`lib/types.ts` types the lot and `npm run typecheck` catches it.

### Menu diet marks

| Tag | Renders as | Meaning |
|-----|-----------|---------|
| `veg` | green mark | no meat, no egg |
| `egg` | amber mark | contains egg |
| `nonveg` | red mark | non-vegetarian |
| `vegan` | green mark | no dairy either; implies `veg` |
| `new` | wine chip | seasonal special, not a diet |

The filters above the menu are **OR**, not AND — ticking *Veg* and *Non-veg*
shows both, which is what anyone would expect. An AND filter would show
nothing.

---

## Order ahead: pickup only

- **No delivery**, and **no collection time slot.** The basket asks for a name,
  a phone number and any notes, and nothing else. An order goes over on
  WhatsApp, the counter starts on it, and it is ready when it is ready. A time
  picker on the page would be a promise nobody in the kitchen agreed to.
- **No payment is taken anywhere on this site.** That needs a payment provider
  and a merchant account, and a fake checkout is worse than no checkout. Money
  changes hands at the counter.
- The basket lives in the visitor's own browser (`chuckles-basket-v1`), as does
  "my usual" (`chuckles-usual-v1`). Neither ever reaches a server.

To switch the whole thing off: `features.ordering: false`. The cart provider,
the basket drawer and the customise sheet then ship no code at all.

---

## Photography

**None of the photographs are of Chuckles & Chai.** They are real, openly
licensed photographs of the right subject — chai in a kulhad where the page
says chai, samosas where it says snacks, filter kaapi where it says filter
kaapi — so the design can be judged on real images until the café's own
pictures exist.

```bash
npm run photos                       # fetch, crop and install all 30 slots
npm run photos -- --dry              # show what would be picked, download nothing
npm run photos -- --only=a.jpg,b.jpg # re-fetch just those slots
npm run placeholders                 # draw plain "photo to come" panels for empty slots
```

`scripts/fetch-photos.mjs` pulls from Wikimedia Commons and accepts **only**
CC0, public domain, CC BY and CC BY-SA. Non-commercial and no-derivatives are
rejected outright: this is a commercial site and every image is cropped, so
both would be breached the moment the file was written.

CC BY and CC BY-SA require attribution, and cropping a share-alike photo makes
an adaptation that must be offered under the same licence. **`/credits`
discharges both obligations and is linked from the footer.** It is not
decoration — do not remove it while these photographs are in use.

### Replacing them with the café's own photos

Drop a real photo over the matching file in `public/images`. The dimensions
already match and **nothing in the code changes**. Two slots deserve it first:

- `public/images/story-interior.jpg` — the room, in Our Story
- `public/images/story-detail.jpg` — the detail beside it

Update the matching `alt` in `lib/site.config.ts` (and in
`scripts/fetch-photos.mjs`, which is the source of truth for alt text) so the
caption describes the new frame. Once every slot is the café's own work,
delete `lib/photo-credits.json`, the `/credits` route and the footer link.

> **Eyeball every fetched photograph.** Commons file titles are not reliable:
> a file titled "Samosas plate" turned out to be a photograph of somebody's
> baby, and the smart crop framed the child rather than the food. A photo of
> an identifiable person — a child especially — must never end up on a
> business's marketing page. `npm run photos -- --only=<slot>` re-rolls one
> slot, and pinning an exact `File:` name in the `SLOTS` table is the reliable
> fix.

**Pinterest images cannot be used.** A Pinterest board is other people's
copyrighted work, re-pinned with no licence attached. Publishing one on a real
business's website is an infringement waiting to be found. The pinboard on this
site is that *look* — masonry, mixed crops, tight gutters — built from
photography that is actually licensed for it.

---

## Reviews

The **4.9 from 72 Google reviews** figure is verified and is rendered as a
score panel and in the structured data.

`reviews` in `lib/site.config.ts` **ships empty on purpose.** We were not given
any quotes, and writing testimonials for a real business and attributing them
to real-sounding customers is fabrication, not copywriting. Until real ones are
pasted in, the section shows the true score and links to the actual Google
reviews. To fill it in, copy each review **exactly as published**, attributed
as the reviewer chose to appear:

```ts
reviews: [{ quote: "…", name: "…", meta: "Google" }],
```

They then appear as cards *and* in the schema.org `review` array.

---

## Privacy, cookies and the map

- No analytics, no tracking pixels, no advertising cookies, no third-party
  fonts. Typefaces are self-hosted by `next/font` at build time.
- Two `localStorage` keys, both the visitor's own: the basket and the cookie
  acknowledgement.
- **The Visit map is embedded from Google and loads with the page**, so Google
  sets its own cookies as soon as the site opens. `/cookies` and `/privacy` say
  so plainly rather than claiming it is opt-in. If that is not wanted, the
  honest fix is to remove the embed — not to reword the policy.
- `/privacy`, `/cookies` and `/terms` are **working drafts** written around what
  the site actually does, with the legal framework set to India (DPDP Act 2023,
  Indian courts). The business legal name, the jurisdiction city and the
  retention periods are marked `[TO BE CONFIRMED]` and need a qualified human
  before launch.

---

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server (regenerates robots/sitemap/manifest first) |
| `npm run build` | Production build; prints the pre-launch placeholder list |
| `npm run start` | Serve the production build |
| `npm run check` | `typecheck` + `lint` + `test` |
| `npm test` | 76 unit tests: money, hours, ordering, the customise sheet, and the shipped config itself |
| `npm run photos` | Install real photographs (see above) |
| `npm run placeholders` | Draw plain panels for any empty image slot |
| `npm run icons` | Rasterise `favicon.svg` into the touch icon |
| `npm run meta` | Regenerate robots.txt / sitemap.xml / manifest.webmanifest |

`qa/qa-site.cjs` is a whole-page regression pass (accessibility, SEO, layout,
tap targets, reduced motion, console errors) and `qa/shot.cjs` takes desktop,
phone and basket screenshots. Both need Chrome and a running server:

```bash
npm run build && npm run start -- -p 4000
BASE=http://127.0.0.1:4000 node qa/qa-site.cjs
BASE=http://127.0.0.1:4000 OUT=. node qa/shot.cjs
```

If a photograph looks stale after replacing the file, clear Next's image cache:
`rm -rf .next/cache/images`.

---

## How it is put together

```
app/            layout, homepage, four legal routes, globals.css
components/     one file per section, plus the header, footer and basket
lib/            site.config.ts (content) · types.ts · hours · orders · customise · schema
scripts/        photo fetcher, placeholder drawer, icon and meta generators (plain JS)
qa/             regression pass and screenshot script
tests/          Node's built-in test runner, no framework
public/images/  30 photo slots
```

- **`app/globals.css`** is the whole design system: tokens, then one numbered
  section per part of the page. `--sect` and `--pad` are the two levers for how
  tall and how airy the page feels; `--t-*` is the type scale. Every rule is
  written mobile-first — wider layouts are additions inside `min-width`
  queries, never overrides of something desktop-shaped.
- **Light throughout**, with the footer as the single dark surface. Ivory paper,
  deep wine ink, one saffron accent.
- **Motion is decoration.** Scroll reveals, the headline wipe, the marquee and
  the hero drift are all switched off by a single `prefers-reduced-motion`
  block, and the page works completely without any of them.
- **Money is integers.** Prices are parsed to paise, so no total is ever
  `7.699999999999999`. Rupees print `₹79`, and group the Indian way — five
  figures read `₹1,20,000`, not `₹120,000`.
- **Hours are computed in Asia/Kolkata** regardless of the visitor's own clock,
  and every function takes an explicit `at: Date` so the awkward cases are unit
  tested rather than discovered on a festival day.
- The whole menu is in the server HTML, not just the open tab, so search engines
  index all of it and browser find-on-page reaches items in categories nobody
  has opened.
