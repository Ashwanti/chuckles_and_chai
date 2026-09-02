/**
 * "Make it yours" - the questions asked about a drink before it reaches the
 * basket, and the answers carried with it afterwards.
 *
 * Pure functions with no React in them, so the fiddly parts are unit-tested:
 * which groups apply to which item, what a required answer means, and how two
 * differently-customised flat whites stay two separate basket lines.
 *
 * The groups themselves live in lib/site.config.ts. Nothing is hard-coded
 * here, because what a café offers is content, not logic.
 */

// Explicit ".ts" so this resolves under Next's bundler and under Node's native
// test runner, which does not do extensionless resolution.
import { parsePaise } from "./orders.ts";
import type { CustomiseGroup, CustomiseOption, SelectedOption } from "./types";

/** Group id -> the option ids chosen in it. */
export type Selections = Record<string, string[]>;

/**
 * The groups that apply to one menu line.
 *
 * `items` targets exact lines and beats `categories`; `except` removes lines
 * from either. That is what keeps "which milk?" off an espresso and "single or
 * double?" off a latte.
 */
export function groupsFor(
  groups: CustomiseGroup[],
  categoryId: string,
  lineId: string,
): CustomiseGroup[] {
  return groups.filter((group) => {
    if (group.except?.includes(lineId)) return false;
    if (group.items?.length) return group.items.includes(lineId);
    if (group.categories?.length) return group.categories.includes(categoryId);
    // Neither targeted: applies to everything.
    return true;
  });
}

/** Options marked `preselect`, so the sheet opens on the house default. */
export function defaultSelections(groups: CustomiseGroup[]): Selections {
  const out: Selections = {};
  for (const group of groups) {
    const chosen = group.options.filter((o) => o.preselect).map((o) => o.id);
    // A radio group can only hold one, however the config is written.
    out[group.id] = group.choose === "one" ? chosen.slice(0, 1) : chosen;
  }
  return out;
}

/** Applies a click: radios replace, checkboxes toggle. */
export function toggle(
  selections: Selections,
  group: CustomiseGroup,
  optionId: string,
): Selections {
  const current = selections[group.id] ?? [];
  if (group.choose === "one") {
    // Re-clicking the selected radio keeps it, rather than emptying a group
    // the customer cannot then re-answer without noticing.
    return { ...selections, [group.id]: [optionId] };
  }
  const next = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  return { ...selections, [group.id]: next };
}

/** Labels of required groups still unanswered. Empty means good to add. */
export function missingRequired(groups: CustomiseGroup[], selections: Selections): string[] {
  return groups
    .filter((group) => group.required && (selections[group.id]?.length ?? 0) === 0)
    .map((group) => group.label);
}

/** Flattens the selections into what the basket and the café will read. */
export function toSelected(groups: CustomiseGroup[], selections: Selections): SelectedOption[] {
  const out: SelectedOption[] = [];
  for (const group of groups) {
    for (const id of selections[group.id] ?? []) {
      const option = group.options.find((o) => o.id === id);
      if (!option) continue;
      out.push({
        group: group.label,
        label: option.label,
        ...(option.surcharge ? { surcharge: option.surcharge } : {}),
      });
    }
  }
  return out;
}

/**
 * Basket id for a customised line.
 *
 * Sorted so the id does not depend on the order the customer happened to tick
 * things in - otherwise "oat then takeaway" and "takeaway then oat" would sit
 * in the basket as two identical lines.
 */
export function variantId(baseId: string, selections: Selections): string {
  const parts = Object.keys(selections)
    .sort()
    .flatMap((groupId) => {
      const ids = [...(selections[groupId] ?? [])].sort();
      return ids.length ? [`${groupId}=${ids.join("+")}`] : [];
    });
  return parts.length ? `${baseId}#${parts.join(",")}` : baseId;
}

/** "Oat milk · Takeaway · Double" - the one-line summary under a basket row. */
export function describeOptions(options?: SelectedOption[]): string {
  if (!options?.length) return "";
  return options.map((o) => o.label).join(" · ");
}

/**
 * Total surcharge in paise, or null if any is written in a way we cannot read.
 * Returning null makes the whole line "confirmed in store", which is the honest
 * outcome - quietly dropping an unreadable surcharge would undercharge the café.
 */
export function optionsPaise(options?: SelectedOption[]): number | null {
  if (!options?.length) return 0;
  let total = 0;
  for (const option of options) {
    if (!option.surcharge) continue;
    const paise = parsePaise(option.surcharge);
    if (paise === null) return null;
    total += paise;
  }
  return total;
}

/** True when there is at least one thing to ask about this line. */
export function hasChoices(groups: CustomiseGroup[]): boolean {
  return groups.some((group) => group.options.length > 0);
}

/** Runtime guard for options coming back out of localStorage. */
export function isSelectedOption(value: unknown): value is SelectedOption {
  if (!value || typeof value !== "object") return false;
  const o = value as SelectedOption;
  return (
    typeof o.group === "string" &&
    typeof o.label === "string" &&
    (o.surcharge === undefined || typeof o.surcharge === "string")
  );
}

/** Exported for the sheet's "no charge" hint. */
export function isFree(option: CustomiseOption): boolean {
  return !option.surcharge;
}
