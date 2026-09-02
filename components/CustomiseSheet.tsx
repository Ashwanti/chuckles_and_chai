"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "./Icons";
import { useCart } from "@/lib/cart";
import {
  defaultSelections,
  groupsFor,
  missingRequired,
  optionsPaise,
  toSelected,
  toggle,
  variantId,
  type Selections,
} from "@/lib/customise";
import { formatRupees, lineId, parsePaise } from "@/lib/orders.ts";
import { SITE } from "@/lib/site.config";
import type { CustomiseGroup, MenuCategory, MenuItem } from "@/lib/types";

export interface CustomiseTarget {
  category: MenuCategory;
  item: MenuItem;
}

/**
 * "Make it yours" - the sheet between tapping Add and the basket.
 *
 * Which questions appear is entirely config-driven (SITE.customise), so the
 * café can add a syrup or retire a milk without anyone touching a component.
 * An item with nothing to ask about never opens this at all; MenuSection adds
 * it straight to the basket.
 */
export function CustomiseSheet({
  target,
  onClose,
}: {
  target: CustomiseTarget | null;
  onClose: () => void;
}) {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [selections, setSelections] = useState<Selections>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [savedUsual, setSavedUsual] = useState(false);

  const base = target ? lineId(target.category.id, target.item.name) : "";

  const groups = useMemo<CustomiseGroup[]>(
    () => (target ? groupsFor(SITE.customise, target.category.id, base) : []),
    [target, base],
  );

  // Reset to the house defaults every time the sheet opens on a new item, so
  // yesterday's oat flat white does not preselect today's tea.
  useEffect(() => {
    if (!target) return;
    setSelections(defaultSelections(groups));
    setQty(1);
    setNote("");
    setTried(false);
    setSavedUsual(false);
    closeRef.current?.focus();
  }, [target, groups]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("is-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [target, onClose]);

  const selected = useMemo(() => toSelected(groups, selections), [groups, selections]);
  const missing = useMemo(() => missingRequired(groups, selections), [groups, selections]);

  /** Live price on the button. Null anywhere means "confirmed in store". */
  const priceLabel = useMemo(() => {
    if (!target) return "";
    const basePaise = parsePaise(target.item.price);
    const extras = optionsPaise(selected);
    if (basePaise === null || extras === null) return "";
    return formatRupees((basePaise + extras) * qty);
  }, [target, selected, qty]);

  if (!target) return null;

  const { category, item } = target;

  const commit = () => {
    setTried(true);
    if (missing.length > 0) return;
    cart.add(
      {
        id: variantId(base, selections),
        base,
        name: item.name,
        category: category.title,
        price: item.price,
        ...(item.tags ? { tags: item.tags } : {}),
        ...(selected.length ? { options: selected } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      qty,
    );
    onClose();
  };

  /* "Save my usual" keeps one drink in this browser only. It is never sent
     anywhere and holds no personal data - just the drink and the choices. */
  const saveUsual = () => {
    try {
      localStorage.setItem(
        "chuckles-usual-v1",
        JSON.stringify({
          id: variantId(base, selections),
          base,
          name: item.name,
          category: category.title,
          price: item.price,
          ...(item.tags ? { tags: item.tags } : {}),
          ...(selected.length ? { options: selected } : {}),
        }),
      );
      setSavedUsual(true);
      window.dispatchEvent(new Event("chuckles:usual"));
    } catch {
      // Private mode or full storage. Nothing else in the flow depends on it.
    }
  };

  return (
    <div
      className="sheet is-open"
      role="dialog"
      aria-modal="true"
      aria-label={`Customise ${item.name}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sheet__panel" ref={panelRef}>
        <div className="sheet__hero">
          <Image
            src={category.image}
            alt=""
            width={900}
            height={1125}
            sizes="(min-width: 640px) 520px, 100vw"
            aria-hidden="true"
          />
          <button className="sheet__close" ref={closeRef} type="button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
          <div className="sheet__title">
            <p className="kicker">{category.kicker}</p>
            <h2>{item.name}</h2>
            {item.desc ? <p className="sheet__desc">{item.desc}</p> : null}
          </div>
        </div>

        <div className="sheet__body">
          {groups.map((group) => {
            const chosen = selections[group.id] ?? [];
            const unanswered = tried && group.required && chosen.length === 0;
            return (
              <fieldset
                className={`sheet__group${unanswered ? " is-missing" : ""}`}
                key={group.id}
              >
                <legend>
                  {group.label}
                  {group.required ? <span className="sheet__req"> Required</span> : null}
                </legend>
                {group.help ? <p className="sheet__help">{group.help}</p> : null}
                <div className="sheet__options">
                  {group.options.map((option) => {
                    const on = chosen.includes(option.id);
                    const extra = option.surcharge ? parsePaise(option.surcharge) : null;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`sheet__opt${on ? " is-on" : ""}`}
                        role={group.choose === "one" ? "radio" : "checkbox"}
                        aria-checked={on}
                        onClick={() => setSelections((s) => toggle(s, group, option.id))}
                      >
                        <span className="sheet__opt-mark" aria-hidden="true">
                          {on ? <Icon name="check" /> : null}
                        </span>
                        <span className="sheet__opt-text">
                          {option.label}
                          {option.note ? <small>{option.note}</small> : null}
                        </span>
                        {extra !== null && extra > 0 ? (
                          <span className="sheet__opt-price">+{formatRupees(extra)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <fieldset className="sheet__group">
            <legend>Anything else</legend>
            <input
              className="sheet__note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. extra hot, no chocolate on top"
              aria-label={`Note for ${item.name}`}
              maxLength={120}
            />
          </fieldset>

          {SITE.features.usual && (
            <button className="sheet__usual" type="button" onClick={saveUsual} disabled={savedUsual}>
              <Icon name={savedUsual ? "check" : "star"} />
              {savedUsual ? "Saved as your usual" : "Save this as my usual"}
              <small>Kept in this browser. Never sent anywhere.</small>
            </button>
          )}
        </div>

        <footer className="sheet__foot">
          {tried && missing.length > 0 && (
            <p className="sheet__problem" aria-live="assertive">
              Still to choose: {missing.join(", ")}.
            </p>
          )}

          <div className="sheet__qty" role="group" aria-label={`Quantity of ${item.name}`}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">
              &minus;
            </button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="One more">
              +
            </button>
          </div>

          <button className="btn btn--accent sheet__add" type="button" onClick={commit}>
            Add to basket
            <span className="sheet__add-price">{priceLabel || "Price in store"}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
