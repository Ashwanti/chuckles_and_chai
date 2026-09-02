/**
 * Order-ahead logic for Chuckles & Chai.
 *
 * Pure functions with no React and no clock of their own, so the fiddly parts
 * - integer money, an unpriced line, an unreadable surcharge - are unit-tested
 * rather than discovered by a customer.
 *
 * Deliberately absent, and both on purpose:
 *
 *   Payment.   Taking card details needs a payment provider and a merchant
 *              account. This builds an order and hands it to the café; money
 *              changes hands at the counter.
 *   Delivery,  The café does not deliver and does not take timed collection
 *   and times. slots. An order is sent over and it is ready when it is ready,
 *              so there is no slot picker to mislead anybody with.
 */

// Explicit ".ts" so this resolves both under Next's bundler and under Node's
// native test runner, which does not do extensionless resolution.
import type { CartLine, MenuCategory, OrderingConfig } from "./types";

/** "Gud Wali Chai" -> "gud-wali-chai". Used to build stable line ids. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function lineId(categoryId: string, itemName: string): string {
  return `${categoryId}:${slugify(itemName)}`;
}

/**
 * Config prices are strings so "-" can mean "not yet confirmed".
 *
 * Returns paise - integers - rather than rupees as a float. Menu prices here
 * are whole rupees, but a surcharge written "12.50" would otherwise drag the
 * whole total into binary-float territory, and 7.699999999999999 is not a
 * thing to print on a bill.
 */
export function parsePaise(price: string): number | null {
  const value = price.trim();
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return null;
  return Math.round(Number(value) * 100);
}

/**
 * Paise -> "₹79" / "₹1,247.50".
 *
 * Whole rupees print without a decimal, because that is how a price is
 * written on a board in India; anything with paise keeps two places. Grouping
 * is en-IN, so five figures read "₹1,20,000" rather than "₹120,000".
 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * What one basket line costs, in paise, including any option surcharges and
 * multiplied by the quantity. Null means "not confirmed online" - either the
 * item has no price yet, or an option carries a surcharge we cannot read.
 *
 * Kept here rather than in customise.ts so there is one definition of what a
 * line costs, used by the total, the basket row and the message to the café.
 */
export function linePaise(line: CartLine): number | null {
  const base = parsePaise(line.price);
  if (base === null) return null;

  let extras = 0;
  for (const option of line.options ?? []) {
    if (!option.surcharge) continue;
    const paise = parsePaise(option.surcharge);
    // An unreadable surcharge makes the line "confirmed in store" rather than
    // silently free - guessing in the café's favour is not ours to do either.
    if (paise === null) return null;
    extras += paise;
  }

  return (base + extras) * line.qty;
}

export interface CartTotal {
  /** Total in paise, or null when any line has no confirmed price. */
  paise: number | null;
  /** Number of items (sum of quantities). */
  count: number;
  /** Lines whose price is not yet set. */
  unpriced: CartLine[];
}

export function cartTotal(lines: CartLine[]): CartTotal {
  let paise = 0;
  let count = 0;
  const unpriced: CartLine[] = [];

  for (const line of lines) {
    count += line.qty;
    const each = linePaise(line);
    if (each === null) unpriced.push(line);
    else paise += each;
  }

  return { paise: unpriced.length ? null : paise, count, unpriced };
}

/** Human total, honest when prices are not set yet. */
export function describeTotal(total: CartTotal): string {
  if (total.count === 0) return "₹0";
  return total.paise === null ? "Confirmed in store" : formatRupees(total.paise);
}

export interface OrderDraft {
  lines: CartLine[];
  name: string;
  phone: string;
  notes?: string;
}

/**
 * Plain-text order the café receives. Deliberately readable on a phone behind
 * a counter: what, how many, who, and whether the total is settled. There is
 * no collection time in it, because the café does not take one.
 */
export function formatOrderMessage(draft: OrderDraft, businessName: string): string {
  const total = cartTotal(draft.lines);
  const rows = draft.lines.flatMap((line) => {
    const each = linePaise(line);
    const money = each === null ? "price TBC" : formatRupees(each);
    const row = `${line.qty} x ${line.name} - ${money}`;
    // Choices go on their own indented lines. A barista reading this off a
    // phone behind the counter needs "Milk: Oat" to stand out, not to be
    // buried in a bracket at the end of a long line.
    const choices = (line.options ?? []).map((o) => `    ${o.group}: ${o.label}`);
    const note = line.note ? [`    Note: ${line.note}`] : [];
    return [row, ...choices, ...note];
  });

  return [
    `Pickup order - ${businessName}`,
    "",
    ...rows,
    "",
    `Total: ${describeTotal(total)}`,
    `Name: ${draft.name || "-"}`,
    `Phone: ${draft.phone || "-"}`,
    ...(draft.notes ? ["", `Notes: ${draft.notes}`] : []),
    "",
    "Sent from the website. Pay at the counter on pickup.",
  ].join("\n");
}

/** Builds the hand-off link for a finished basket. */
export function orderHandoffUrl(
  draft: OrderDraft,
  config: OrderingConfig,
  businessName: string,
): string {
  const body = formatOrderMessage(draft, businessName);
  if (config.send === "whatsapp" && config.whatsapp) {
    return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(body)}`;
  }
  const subject = `Pickup order - ${draft.name || "website"}`;
  return `mailto:${config.email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export interface ValidationResult {
  ok: boolean;
  problems: string[];
}

/** What still needs doing before the order can be sent. */
export function validateOrder(draft: OrderDraft, config: OrderingConfig): ValidationResult {
  const problems: string[] = [];
  const total = cartTotal(draft.lines);

  if (total.count === 0) problems.push("Your basket is empty.");
  if (total.count > config.maxItems) {
    problems.push(`Please keep orders to ${config.maxItems} items or fewer — ring us for anything larger.`);
  }
  if (!draft.name.trim()) problems.push("Add a name for the order.");
  // Loose on purpose: a number gets written with a +91, a 0, spaces or none
  // of the above, and a strict regex rejecting a real customer costs more
  // than a typo reaching the counter.
  if (draft.phone.replace(/\D/g, "").length < 10) problems.push("Add a contact phone number.");

  return { ok: problems.length === 0, problems };
}

/** Every orderable line on the menu, flattened for lookup. */
export function orderableItems(menu: MenuCategory[]) {
  return menu.flatMap((category) =>
    category.items.map((item) => ({
      id: lineId(category.id, item.name),
      name: item.name,
      category: category.title,
      price: item.price,
      tags: item.tags,
    })),
  );
}
