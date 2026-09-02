import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  defaultSelections,
  describeOptions,
  groupsFor,
  hasChoices,
  isSelectedOption,
  missingRequired,
  optionsPaise,
  toSelected,
  toggle,
  variantId,
} from "../lib/customise.ts";
import { linePaise } from "../lib/orders.ts";
import { SITE } from "../lib/site.config.ts";
import type { CartLine, CustomiseGroup } from "../lib/types.ts";

const GROUPS: CustomiseGroup[] = [
  {
    id: "serve",
    label: "How are you having it?",
    choose: "one",
    required: true,
    options: [
      { id: "in", label: "Eat in", preselect: true },
      { id: "out", label: "Takeaway" },
    ],
  },
  {
    id: "milk",
    label: "Milk",
    choose: "one",
    categories: ["coffee"],
    except: ["coffee:espresso"],
    options: [
      { id: "dairy", label: "Dairy", preselect: true },
      { id: "oat", label: "Oat" },
    ],
  },
  {
    id: "shot",
    label: "Single or double?",
    choose: "one",
    required: true,
    items: ["coffee:espresso"],
    options: [{ id: "single", label: "Single" }, { id: "double", label: "Double" }],
  },
  {
    id: "extras",
    label: "Extras",
    choose: "many",
    categories: ["coffee"],
    options: [
      { id: "syrup", label: "Syrup", surcharge: "0.50" },
      { id: "cream", label: "Cream", surcharge: "0.60" },
    ],
  },
];

describe("which questions apply", () => {
  test("a category group reaches every line in that category", () => {
    const ids = groupsFor(GROUPS, "coffee", "coffee:latte").map((g) => g.id);
    assert.deepEqual(ids, ["serve", "milk", "extras"]);
  });

  test("an untargeted group applies to everything", () => {
    const ids = groupsFor(GROUPS, "sweet", "sweet:brownie").map((g) => g.id);
    assert.deepEqual(ids, ["serve"]);
  });

  test("`except` removes a single line from a category group", () => {
    const ids = groupsFor(GROUPS, "coffee", "coffee:espresso").map((g) => g.id);
    assert.ok(!ids.includes("milk"), "an espresso must not be asked which milk");
  });

  test("`items` targets exactly one line and no others", () => {
    assert.ok(groupsFor(GROUPS, "coffee", "coffee:espresso").some((g) => g.id === "shot"));
    assert.ok(!groupsFor(GROUPS, "coffee", "coffee:latte").some((g) => g.id === "shot"));
  });

  test("a category with nothing to ask reports no choices", () => {
    assert.equal(hasChoices([]), false);
    assert.equal(hasChoices(groupsFor(GROUPS, "coffee", "coffee:latte")), true);
  });
});

describe("selections", () => {
  const groups = groupsFor(GROUPS, "coffee", "coffee:latte");

  test("opens on the house defaults", () => {
    assert.deepEqual(defaultSelections(groups), { serve: ["in"], milk: ["dairy"], extras: [] });
  });

  test("a radio replaces rather than accumulating", () => {
    const next = toggle(defaultSelections(groups), groups[1]!, "oat");
    assert.deepEqual(next.milk, ["oat"]);
  });

  test("re-clicking a chosen radio leaves it chosen", () => {
    // Emptying it would leave a required group unanswered with no visible
    // cause, and the customer would have no idea what changed.
    const once = toggle(defaultSelections(groups), groups[0]!, "out");
    const twice = toggle(once, groups[0]!, "out");
    assert.deepEqual(twice.serve, ["out"]);
  });

  test("a checkbox toggles both ways", () => {
    const on = toggle(defaultSelections(groups), groups[2]!, "syrup");
    assert.deepEqual(on.extras, ["syrup"]);
    assert.deepEqual(toggle(on, groups[2]!, "syrup").extras, []);
  });

  test("required groups are reported until answered", () => {
    assert.deepEqual(missingRequired(groups, { serve: [], milk: ["oat"] }), ["How are you having it?"]);
    assert.deepEqual(missingRequired(groups, defaultSelections(groups)), []);
  });
});

describe("what the cafe reads", () => {
  const groups = groupsFor(GROUPS, "coffee", "coffee:latte");

  test("selections become labelled choices", () => {
    const selected = toSelected(groups, { serve: ["out"], milk: ["oat"], extras: ["syrup"] });
    assert.deepEqual(selected, [
      { group: "How are you having it?", label: "Takeaway" },
      { group: "Milk", label: "Oat" },
      { group: "Extras", label: "Syrup", surcharge: "0.50" },
    ]);
  });

  test("an unknown option id is dropped rather than crashing", () => {
    // Storage is user-writable and survives deploys.
    assert.deepEqual(toSelected(groups, { milk: ["almond"] }), []);
  });

  test("summarises for the basket row", () => {
    assert.equal(
      describeOptions([
        { group: "Milk", label: "Oat" },
        { group: "Serve", label: "Takeaway" },
      ]),
      "Oat · Takeaway",
    );
    assert.equal(describeOptions(), "");
  });
});

describe("variant ids", () => {
  test("different choices make different basket lines", () => {
    const oat = variantId("coffee:latte", { milk: ["oat"] });
    const dairy = variantId("coffee:latte", { milk: ["dairy"] });
    assert.notEqual(oat, dairy);
  });

  test("the same choices make the same line whatever order they were ticked", () => {
    // Otherwise "oat then takeaway" and "takeaway then oat" sit in the basket
    // as two identical rows.
    const a = variantId("coffee:latte", { milk: ["oat"], serve: ["out"], extras: ["syrup", "cream"] });
    const b = variantId("coffee:latte", { serve: ["out"], extras: ["cream", "syrup"], milk: ["oat"] });
    assert.equal(a, b);
  });

  test("empty groups do not pollute the id", () => {
    assert.equal(variantId("sweet:brownie", { extras: [] }), "sweet:brownie");
  });

  test("the id still starts with the base, so basket counts can match on it", () => {
    assert.ok(variantId("coffee:latte", { milk: ["oat"] }).startsWith("coffee:latte#"));
  });
});

describe("surcharges", () => {
  test("adds up in paise", () => {
    assert.equal(optionsPaise([{ group: "x", label: "Syrup", surcharge: "0.50" }, { group: "x", label: "Cream", surcharge: "0.60" }]), 110);
  });

  test("no options and no surcharges both cost nothing", () => {
    assert.equal(optionsPaise(), 0);
    assert.equal(optionsPaise([{ group: "x", label: "Oat" }]), 0);
  });

  test("an unreadable surcharge makes the line price unknown, not free", () => {
    // Silently treating it as free would undercharge the cafe.
    assert.equal(optionsPaise([{ group: "x", label: "?", surcharge: "ask" }]), null);
  });

  test("line total includes surcharges and quantity", () => {
    const line: CartLine = {
      id: "coffee:latte#extras=syrup",
      name: "Latte",
      category: "Coffee",
      price: "3.40",
      qty: 2,
      options: [{ group: "Extras", label: "Syrup", surcharge: "0.50" }],
    };
    assert.equal(linePaise(line), 780);
  });

  test("an unpriced item stays unpriced however it is customised", () => {
    const line: CartLine = {
      id: "coffee:latte",
      name: "Latte",
      category: "Coffee",
      price: "-",
      qty: 1,
      options: [{ group: "Milk", label: "Oat" }],
    };
    assert.equal(linePaise(line), null);
  });
});

describe("options read back out of storage", () => {
  test("accepts a well-formed option", () => {
    assert.equal(isSelectedOption({ group: "Milk", label: "Oat" }), true);
    assert.equal(isSelectedOption({ group: "Milk", label: "Oat", surcharge: "0.50" }), true);
  });

  test("rejects anything else", () => {
    for (const bad of [null, undefined, "Oat", 42, {}, { group: "Milk" }, { group: 1, label: "Oat" }, { group: "Milk", label: "Oat", surcharge: 50 }]) {
      assert.equal(isSelectedOption(bad), false, `should reject ${JSON.stringify(bad)}`);
    }
  });
});

describe("the shipped configuration", () => {
  test("every group targets menu lines that actually exist", () => {
    // A typo in an id would silently mean a question never appears.
    const real = new Set(
      SITE.menu.flatMap((cat) =>
        cat.items.map(
          (item) =>
            `${cat.id}:${item.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
        ),
      ),
    );
    for (const group of SITE.customise) {
      for (const id of [...(group.items ?? []), ...(group.except ?? [])]) {
        assert.ok(real.has(id), `customise group "${group.id}" targets "${id}", which is not on the menu`);
      }
    }
  });

  test("every group targets categories that exist", () => {
    const ids = new Set(SITE.menu.map((c) => c.id));
    for (const group of SITE.customise) {
      for (const id of group.categories ?? []) {
        assert.ok(ids.has(id), `customise group "${group.id}" targets category "${id}", which does not exist`);
      }
    }
  });

  test("no shipped option invents a surcharge", () => {
    // We have no confirmed price list. A made-up 50p on a live site is worse
    // than showing nothing.
    for (const group of SITE.customise) {
      for (const option of group.options) {
        assert.equal(option.surcharge, undefined, `"${option.label}" carries an invented surcharge`);
      }
    }
  });

  test("every required group has a preselected answer, so nothing blocks silently", () => {
    for (const group of SITE.customise) {
      if (!group.required) continue;
      assert.ok(
        group.options.some((o) => o.preselect),
        `required group "${group.id}" has no default, so the button would refuse with nothing obviously wrong`,
      );
    }
  });

  test("a chai is asked which cup; a coffee is not", () => {
    assert.ok(
      groupsFor(SITE.customise, "chai", "chai:irani-chai").some((g) => g.id === "cup"),
      "chai should be asked kulhad / cutting / full glass",
    );
    assert.ok(
      !groupsFor(SITE.customise, "coffee", "coffee:flat-white").some((g) => g.id === "cup"),
      "a flat white does not come in a kulhad",
    );
  });

  test("filter kaapi is not asked which milk — it comes with it", () => {
    const ids = groupsFor(SITE.customise, "coffee", "coffee:degree-filter-kaapi").map((g) => g.id);
    assert.ok(!ids.includes("milk"));
    assert.ok(ids.includes("strength"));
  });

  test("the jaggery-only chai is not offered a sweetness setting", () => {
    // Gud Wali Chai has no sugar in it to adjust, and the config says so.
    const ids = groupsFor(SITE.customise, "chai", "chai:gud-wali-chai").map((g) => g.id);
    assert.ok(!ids.includes("sweet"));
    assert.ok(ids.includes("cup"));
  });

  test("a plate of food is asked about spice, not milk", () => {
    const ids = groupsFor(SITE.customise, "bites", "bites:peri-peri-paneer-momos").map((g) => g.id);
    assert.ok(ids.includes("spice"));
    assert.ok(!ids.includes("milk"));
  });
});
