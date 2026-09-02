"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CustomiseSheet, type CustomiseTarget } from "./CustomiseSheet";
import { Icon } from "./Icons";
import { Reveal } from "./Reveal";
import { useOptionalCart } from "@/lib/cart";
import { describeOptions, groupsFor, hasChoices } from "@/lib/customise";
import { lineId } from "@/lib/orders.ts";
import { SITE } from "@/lib/site.config";
import type { CartLine, DietTag, MenuCategory, MenuItem } from "@/lib/types";

const USUAL_KEY = "chuckles-usual-v1";

const CHIP_LABEL: Record<DietTag, string> = {
  veg: "Veg",
  vegan: "Vegan",
  egg: "Egg",
  nonveg: "Non-veg",
  new: "New",
};

const LEGEND: { tag: DietTag; text: string }[] = [
  { tag: "veg", text: "Vegetarian" },
  { tag: "vegan", text: "Vegan — no dairy" },
  { tag: "egg", text: "Contains egg" },
  { tag: "nonveg", text: "Non-vegetarian" },
];

/** Filters offered above the menu. "new" is a highlight, not a diet. */
const FILTERS: { tag: DietTag; label: string }[] = [
  { tag: "veg", label: "Veg" },
  { tag: "vegan", label: "Vegan" },
  { tag: "nonveg", label: "Non-veg" },
];

/**
 * "-" is the deliberate not-yet-confirmed state and renders as an em dash.
 * A bare number becomes a rupee price; anything else prints as written.
 */
function formatPrice(price: string): string {
  const value = price.trim();
  if (!value || value === "-" || value === "—") return "—";
  return /^[\d.]+$/.test(value) ? `₹${value}` : value;
}

function Chips({ tags }: { tags?: DietTag[] }) {
  if (!tags?.length) return null;
  return (
    <>
      {tags.map((tag) => (
        <span className={`chip chip--${tag}`} key={tag}>
          {CHIP_LABEL[tag]}
        </span>
      ))}
    </>
  );
}

/**
 * Filters are OR, not AND.
 *
 * "Veg" and "Non-veg" together has to mean "show me both", not "show me the
 * items that are somehow simultaneously both" — which is what an AND filter
 * would produce, i.e. nothing. Vegan implies veg, since a vegan dish
 * obviously suits a vegetarian and the config only tags it "vegan".
 */
function matchesDiet(item: MenuItem, active: DietTag[]): boolean {
  if (active.length === 0) return true;
  const tags = item.tags ?? [];
  return active.some((tag) =>
    tag === "veg" ? tags.includes("veg") || tags.includes("vegan") : tags.includes(tag),
  );
}

function AddToCart({
  category,
  item,
  onCustomise,
}: {
  category: MenuCategory;
  item: MenuItem;
  onCustomise: (target: CustomiseTarget) => void;
}) {
  const cart = useOptionalCart();
  if (!cart) return null;

  const base = lineId(category.id, item.name);
  /* Customised lines carry their choices in the id ("chai:irani-chai#cup=kulhad"),
     so the count has to match on the base rather than the exact id — two kulhad
     chais and one cutting should read "3 in basket", not "1". */
  const inBasket = cart.lines
    .filter((l) => l.id === base || l.id.startsWith(`${base}#`))
    .reduce((sum, l) => sum + l.qty, 0);
  const added = cart.lastAdded === base || (cart.lastAdded?.startsWith(`${base}#`) ?? false);

  const groups = SITE.features.customise ? groupsFor(SITE.customise, category.id, base) : [];
  const customisable = hasChoices(groups);

  const onClick = () => {
    if (customisable) {
      onCustomise({ category, item });
      return;
    }
    cart.add({
      id: base,
      name: item.name,
      category: category.title,
      price: item.price,
      ...(item.tags ? { tags: item.tags } : {}),
    });
  };

  return (
    <button
      className={`menu__add${added ? " is-added" : ""}`}
      type="button"
      onClick={onClick}
      aria-label={
        customisable
          ? `Customise ${item.name} and add to basket`
          : inBasket
            ? `Add another ${item.name}, ${inBasket} in basket`
            : `Add ${item.name} to basket`
      }
      aria-haspopup={customisable ? "dialog" : undefined}
    >
      <Icon name={added ? "check" : customisable ? "sliders" : "plus"} />
      <span>
        {added ? "Added" : inBasket > 0 ? `${inBasket} in basket` : customisable ? "Make it yours" : "Add"}
      </span>
    </button>
  );
}

/**
 * One-tap reorder of the drink saved from the customise sheet.
 *
 * The saved drink lives in this browser and nowhere else — it is not an
 * account, it never reaches us, and clearing site data clears it. Renders
 * nothing until something has actually been saved.
 */
function MyUsual() {
  const cart = useOptionalCart();
  const [usual, setUsual] = useState<Omit<CartLine, "qty"> | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(USUAL_KEY);
        if (!raw) return setUsual(null);
        const parsed: unknown = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof (parsed as CartLine).id === "string" &&
          typeof (parsed as CartLine).name === "string" &&
          typeof (parsed as CartLine).price === "string"
        ) {
          setUsual(parsed as Omit<CartLine, "qty">);
        }
      } catch {
        setUsual(null);
      }
    };
    read();
    // Saved from the sheet in this tab, or in another one.
    window.addEventListener("chuckles:usual", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("chuckles:usual", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  if (!cart || !usual) return null;
  const summary = describeOptions(usual.options);

  return (
    <div className="usual">
      <button className="usual__go" type="button" onClick={() => cart.add(usual)}>
        <Icon name="repeat" />
        <span>
          <b>The usual</b>
          <small>
            {usual.name}
            {summary ? ` · ${summary}` : ""}
          </small>
        </span>
        <Icon name="plus" className="usual__plus" />
      </button>
      <button
        className="usual__forget"
        type="button"
        onClick={() => {
          try {
            localStorage.removeItem(USUAL_KEY);
          } catch {
            /* nothing to do */
          }
          setUsual(null);
        }}
      >
        Forget
      </button>
    </div>
  );
}

function Row({
  category,
  item,
  onCustomise,
}: {
  category: MenuCategory;
  item: MenuItem;
  onCustomise: (target: CustomiseTarget) => void;
}) {
  return (
    <li className="menu__item">
      <span className="menu__name">
        {item.name}
        <Chips tags={item.tags} />
      </span>
      <span className="menu__price">{formatPrice(item.price)}</span>
      {item.desc ? <span className="menu__desc">{item.desc}</span> : null}
      {SITE.features.ordering ? (
        <AddToCart category={category} item={item} onCustomise={onCustomise} />
      ) : null}
    </li>
  );
}

export function MenuSection() {
  const [index, setIndex] = useState(0);
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [customising, setCustomising] = useState<CustomiseTarget | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Fade the trailing edge only while tabs remain off-screen to the right, so
     the strip visibly invites a swipe on a phone instead of looking finished. */
  const measure = useCallback(() => {
    const el = tabsRef.current;
    if (el) setHasMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const select = useCallback((next: number) => {
    setIndex(next);
    const el = tabsRef.current;
    const tab = tabRefs.current[next];
    if (el && tab) {
      // Scroll the strip itself, not the element — scrollIntoView would drag
      // the whole page as well.
      el.scrollTo({
        left: Math.max(0, tab.offsetLeft - (el.clientWidth - tab.offsetWidth) / 2),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }, []);

  /* Arrow-key movement between tabs, per the WAI-ARIA tabs pattern. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = SITE.menu.length;
    const map: Record<string, number | undefined> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: count - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const wrapped = (next + count) % count;
    select(wrapped);
    tabRefs.current[wrapped]?.focus();
  };

  const toggleDiet = (tag: DietTag) =>
    setDiets((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );

  /** Matches per category, so a tab can show how much survives the filter. */
  const counts = useMemo(
    () => SITE.menu.map((cat) => cat.items.filter((item) => matchesDiet(item, diets)).length),
    [diets],
  );

  return (
    <section className="section menu" id="menu">
      <div className="wrap">
        <Reveal className="head head--split">
          <div>
            <p className="kicker">The menu</p>
            <h2>
              Everything we pour, <span className="wink">and what it costs.</span>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: "34ch" }}>
            Prices are what you pay at the counter. The board in the  is always the final word.
          </p>
        </Reveal>

        {SITE.features.ordering && SITE.features.usual && <MyUsual />}

        {SITE.features.dietaryFilter && (
          <div className="menu__filters">
            <span className="menu__filters-label">
              <Icon name="filter" /> Show me
            </span>
            {FILTERS.map((f) => (
              <button
                key={f.tag}
                className={`menu__filter${diets.includes(f.tag) ? " is-on" : ""}`}
                type="button"
                aria-pressed={diets.includes(f.tag)}
                onClick={() => toggleDiet(f.tag)}
              >
                {f.label}
              </button>
            ))}
            {diets.length > 0 && (
              <button
                className="menu__filter menu__filter--clear"
                type="button"
                onClick={() => setDiets([])}
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div
          className={`menu__tabs${hasMore ? " has-more" : ""}`}
          role="tablist"
          aria-label="Menu categories"
          ref={tabsRef}
          onScroll={measure}
          onKeyDown={onKeyDown}
        >
          {SITE.menu.map((cat, i) => (
            <button
              key={cat.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`menu__tab${counts[i] === 0 ? " is-empty" : ""}`}
              type="button"
              role="tab"
              id={`tab-${cat.id}`}
              aria-controls={`panel-${cat.id}`}
              aria-selected={i === index}
              tabIndex={i === index ? 0 : -1}
              onClick={() => select(i)}
            >
              {cat.title}
              {diets.length > 0 && <span className="menu__tab-count">{counts[i]}</span>}
            </button>
          ))}
        </div>

        {/* Every category is rendered and the inactive ones are hidden, rather
            than mounting only the active panel. The whole menu is then present
            in the server HTML — so search engines index all of it, and browser
            find-on-page reaches items in categories the visitor has not opened. */}
        {SITE.menu.map((cat, i) => {
          const visible = cat.items.filter((item) => matchesDiet(item, diets));
          return (
            <div
              key={cat.id}
              className={`menu__panel${i === index ? " is-active" : ""}`}
              role="tabpanel"
              id={`panel-${cat.id}`}
              aria-labelledby={`tab-${cat.id}`}
              hidden={i !== index}
            >
              <div className="menu__layout">
                <div className="menu__media">
                  <div className="frame frame--zoom">
                    <Image
                      src={cat.image}
                      alt={cat.alt}
                      width={900}
                      height={1125}
                      sizes="(min-width: 940px) 32vw, 100vw"
                      loading="lazy"
                    />
                  </div>
                  {cat.note ? <p className="menu__note">{cat.note}</p> : null}
                </div>

                <div>
                  <div className="menu__head">
                    <p className="kicker">{cat.kicker}</p>
                    <h3>{cat.title}</h3>
                  </div>

                  {visible.length === 0 ? (
                    <p className="menu__none">
                      Nothing in {cat.title.toLowerCase()} matches that filter. Try another
                      category, or ask us &mdash; we can usually adapt something.
                    </p>
                  ) : (
                    <ul className="menu__list">
                      {visible.map((item) => (
                        <Row category={cat} item={item} key={item.name} onCustomise={setCustomising} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Reveal className="menu__legend">
          {LEGEND.map((entry) => (
            <div key={entry.tag}>
              <span className={`chip chip--${entry.tag}`}>{CHIP_LABEL[entry.tag]}</span> {entry.text}
            </div>
          ))}
          <div style={{ marginLeft: "auto" }}>
            Allergies? Tell us when you order and we will talk you through it.
          </div>
        </Reveal>
      </div>

      {SITE.features.ordering && SITE.features.customise && (
        <CustomiseSheet target={customising} onClose={() => setCustomising(null)} />
      )}
    </section>
  );
}
