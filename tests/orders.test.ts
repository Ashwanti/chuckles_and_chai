import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  cartTotal,
  describeTotal,
  formatOrderMessage,
  formatRupees,
  lineId,
  orderHandoffUrl,
  parsePaise,
  slugify,
  validateOrder,
} from "../lib/orders.ts";
import type { CartLine, OrderingConfig } from "../lib/types.ts";

/* Pickup only: no delivery, and no timed collection slot to configure. */
const CONFIG: OrderingConfig = {
  enabled: true,
  maxItems: 20,
  send: "whatsapp",
  whatsapp: "919876543210",
};

const line = (over: Partial<CartLine> = {}): CartLine => ({
  id: "chai:kulhad-masala-chai",
  name: "Kulhad Masala Chai",
  category: "Signature Chai",
  price: "79",
  qty: 1,
  ...over,
});

describe("slugify / lineId", () => {
  test("makes stable ids from menu names", () => {
    assert.equal(slugify("Chuckles & Chai"), "chuckles-and-chai");
    assert.equal(slugify("Gud Wali Chai"), "gud-wali-chai");
    assert.equal(slugify("  Peri Peri  Paneer Momos "), "peri-peri-paneer-momos");
    assert.equal(lineId("bites", "Bun Maska"), "bites:bun-maska");
  });
});

describe("prices", () => {
  test("parses confirmed prices into paise", () => {
    assert.equal(parsePaise("79"), 7900);
    assert.equal(parsePaise("299"), 29900);
    assert.equal(parsePaise("12.50"), 1250);
  });

  test("treats the placeholder and anything odd as unpriced", () => {
    assert.equal(parsePaise("-"), null);
    assert.equal(parsePaise(""), null);
    assert.equal(parsePaise("ask"), null);
    assert.equal(parsePaise("79.5.5"), null);
    assert.equal(parsePaise("₹79"), null);
  });

  test("formats paise back to rupees", () => {
    // Whole rupees lose the decimal, because that is how a price is written.
    assert.equal(formatRupees(7900), "₹79");
    assert.equal(formatRupees(29900), "₹299");
    assert.equal(formatRupees(1250), "₹12.50");
    assert.equal(formatRupees(5), "₹0.05");
  });

  test("groups the Indian way, not the Western way", () => {
    // 120000 rupees is "1,20,000", not "120,000".
    assert.equal(formatRupees(12_000_000), "₹1,20,000");
  });

  test("adds up in integers, so no floating point paise", () => {
    // 12.50 + 4.40 in floats is 16.900000000000002.
    const total = cartTotal([line({ price: "12.50" }), line({ id: "x", price: "4.40" })]);
    assert.equal(total.paise, 1690);
    assert.equal(formatRupees(total.paise!), "₹16.90");
  });

  test("multiplies by quantity", () => {
    const total = cartTotal([line({ price: "79", qty: 3 })]);
    assert.equal(total.paise, 23700);
    assert.equal(total.count, 3);
  });

  test("a single unpriced line makes the whole total unknown", () => {
    const total = cartTotal([line(), line({ id: "y", name: "Cake of the day", price: "-" })]);
    assert.equal(total.paise, null);
    assert.equal(total.unpriced.length, 1);
    assert.equal(describeTotal(total), "Confirmed in store");
  });

  test("an empty basket is ₹0, not 'confirmed in store'", () => {
    assert.equal(describeTotal(cartTotal([])), "₹0");
  });
});

describe("validateOrder", () => {
  const good = { lines: [line()], name: "Aditi", phone: "98765 43210" };

  test("accepts a complete order", () => {
    assert.equal(validateOrder(good, CONFIG).ok, true);
  });

  test("rejects an empty basket", () => {
    const r = validateOrder({ ...good, lines: [] }, CONFIG);
    assert.equal(r.ok, false);
    assert.ok(r.problems.some((p) => /empty/i.test(p)));
  });

  test("rejects a missing name or phone", () => {
    assert.ok(validateOrder({ ...good, name: "  " }, CONFIG).problems.some((p) => /name/i.test(p)));
    assert.ok(validateOrder({ ...good, phone: "12345" }, CONFIG).problems.some((p) => /phone/i.test(p)));
  });

  test("accepts an Indian mobile however it is written", () => {
    for (const phone of ["9876543210", "98765 43210", "+91 98765 43210", "+919876543210"]) {
      assert.equal(validateOrder({ ...good, phone }, CONFIG).ok, true, `rejected ${phone}`);
    }
  });

  test("caps oversized orders", () => {
    const r = validateOrder({ ...good, lines: [line({ qty: 25 })] }, CONFIG);
    assert.equal(r.ok, false);
    assert.ok(r.problems.some((p) => /20 items/i.test(p)));
  });
});

describe("order hand-off", () => {
  const draft = {
    lines: [
      line({ qty: 2, note: "extra kadak" }),
      line({
        id: "desserts:cake-of-the-day",
        name: "Cake of the day",
        category: "Sweet Endings",
        price: "-",
      }),
    ],
    name: "Aditi",
    phone: "98765 43210",
  };

  test("message lists quantities, notes and an honest total", () => {
    const msg = formatOrderMessage(draft, "Chuckles & Chai");
    assert.ok(msg.includes("2 x Kulhad Masala Chai - ₹158"));
    // Notes and choices sit on their own indented lines rather than in a
    // bracket at the end, so they are readable off a phone behind a counter.
    assert.ok(msg.includes("    Note: extra kadak"));
    assert.ok(msg.includes("1 x Cake of the day - price TBC"));
    assert.ok(msg.includes("Total: Confirmed in store"));
    assert.ok(msg.includes("Pay at the counter on pickup"));
  });

  test("the message promises no collection time, because we take none", () => {
    // A time in this message would be a commitment nobody in the kitchen made.
    const msg = formatOrderMessage(draft, "Chuckles & Chai");
    assert.ok(!/collect:/i.test(msg));
    assert.ok(!/deliver/i.test(msg));
  });

  test("builds a wa.me link with the order encoded", () => {
    const url = orderHandoffUrl(draft, CONFIG, "Chuckles & Chai");
    assert.ok(url.startsWith("https://wa.me/919876543210?text="));
    assert.ok(decodeURIComponent(url).includes("2 x Kulhad Masala Chai"));
  });

  test("falls back to mailto when configured for email", () => {
    const url = orderHandoffUrl(
      draft,
      { ...CONFIG, send: "email", email: "hello@example.com" },
      "Chuckles & Chai",
    );
    assert.ok(url.startsWith("mailto:hello@example.com?subject="));
    assert.ok(decodeURIComponent(url).includes("Name: Aditi"));
  });

  test("a fully priced basket shows a real total", () => {
    const priced = { ...draft, lines: [line({ qty: 2 })] };
    assert.ok(formatOrderMessage(priced, "X").includes("Total: ₹158"));
  });
});
