/**
 * Opening-hours logic for Chuckles & Chai.
 *
 * Everything here is pure and takes an explicit `at: Date`, so the awkward
 * cases - a visitor in another timezone, a festival closure, an order placed
 * four minutes before last orders - are unit-testable rather than a thing you
 * find out about on Diwali. See tests/hours.test.ts.
 *
 * All reasoning happens in Asia/Kolkata regardless of where the visitor is.
 * IST has no daylight saving, but the arithmetic below never assumes that.
 */

import type { DayKey, DaySchedule, HoursException } from "./types";

/** Indexed to match Date#getDay / Intl weekday order. */
export const DAY_INDEX: readonly DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Display order for the hours table: the week starts on Monday. */
export const WEEK_ORDER: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const DAY_NAMES: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export interface LocalNow {
  /** Day key in India, e.g. "tue". */
  key: DayKey;
  /** 0 = Sunday, matching DAY_INDEX. */
  dayIndex: number;
  /** Local calendar date (IST) as "YYYY-MM-DD". */
  date: string;
  /** Minutes since midnight, India Standard Time. */
  minutes: number;
}

/** Resolves an instant into the café's calendar date, weekday and clock time. */
export function localNow(at: Date = new Date()): LocalNow {
  const parts: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at)) {
    parts[p.type] = p.value;
  }

  const idx = SHORT_WEEKDAYS.indexOf((parts.weekday ?? "Sun") as (typeof SHORT_WEEKDAYS)[number]);
  const dayIndex = idx < 0 ? 0 : idx;

  return {
    key: DAY_INDEX[dayIndex] ?? "sun",
    dayIndex,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour ?? 0) * 60 + Number(parts.minute ?? 0),
  };
}

/** "08:30" -> 510 */
export function toMinutes(hhmm: string): number {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/** "08:00" -> "8am", "16:30" -> "4:30pm" */
export function formatTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""}${suffix}`;
}

/**
 * Adds whole days to a Local calendar date (IST).
 *
 * Anchored at midday UTC so the arithmetic stays clear of any timezone edge -
 * adding 24h to an instant near midnight can otherwise land on the wrong
 * calendar date.
 */
export function datePlus(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface HoursInput {
  hours: Record<DayKey, DaySchedule>;
  exceptions: HoursException[];
}

/** The schedule that actually applies on a date, honouring one-off overrides. */
export function scheduleFor(content: HoursInput, dayKey: DayKey, date: string): DaySchedule {
  const override = content.exceptions.find((e) => e.date === date);
  if (override) {
    return override.closed ? { closed: true } : { open: override.open!, close: override.close! };
  }
  return content.hours[dayKey];
}

export interface NextOpening {
  key: DayKey;
  open: string;
  /** "tomorrow", or a weekday name when further out. */
  label: string;
}

/** Walks forward up to a week to find the next day the cafe opens. */
export function nextOpening(content: HoursInput, now: LocalNow): NextOpening | null {
  for (let i = 1; i <= 7; i++) {
    const date = datePlus(now.date, i);
    const key = DAY_INDEX[(now.dayIndex + i) % 7] ?? "sun";
    const schedule = scheduleFor(content, key, date);
    if (!schedule.closed && schedule.open) {
      return { key, open: schedule.open, label: i === 1 ? "tomorrow" : DAY_NAMES[key] };
    }
  }
  return null;
}

export interface OpenState {
  open: boolean;
  /** Human sentence, e.g. "Open now · until 11pm". */
  label: string;
}

/** Whether the cafe is open at `at`, and the sentence to show beside the dot. */
export function openState(content: HoursInput, at: Date = new Date()): OpenState {
  const now = localNow(at);
  const today = scheduleFor(content, now.key, now.date);

  if (!today.closed && today.open && today.close) {
    const opens = toMinutes(today.open);
    const closes = toMinutes(today.close);

    if (now.minutes < opens) {
      return { open: false, label: `Closed · opens at ${formatTime(today.open)}` };
    }
    if (now.minutes < closes) {
      const remaining = closes - now.minutes;
      return {
        open: true,
        label:
          remaining <= 45
            ? `Open · closing at ${formatTime(today.close)}`
            : `Open now · until ${formatTime(today.close)}`,
      };
    }
  }

  const next = nextOpening(content, now);
  return {
    open: false,
    label: next ? `Closed · opens ${next.label} at ${formatTime(next.open)}` : "Closed today",
  };
}

/** Formats a day's hours for the table, e.g. "4pm – 11pm" or "Closed". */
export function describeDay(schedule: DaySchedule): string {
  if (schedule.closed || !schedule.open || !schedule.close) return "Closed";
  return `${formatTime(schedule.open)} – ${formatTime(schedule.close)}`;
}

/**
 * A time-independent summary of the week, e.g. "Open every day 4pm – 11pm".
 *
 * Used as the server-rendered fallback for the status badge. It is true
 * regardless of when the page is viewed, so there is no hydration mismatch and
 * a visitor without JavaScript still sees something accurate and useful.
 */
export function summariseWeek(content: HoursInput): string {
  const open = WEEK_ORDER.map((k) => content.hours[k]).filter((s) => !s.closed);
  if (open.length === 0) return "See opening hours";

  const first = open[0]!;
  const allSame = open.every((s) => s.open === first.open && s.close === first.close);
  if (!allSame) return "See opening hours";

  const range = describeDay(first);
  return open.length === 7 ? `Open every day ${range}` : `Open ${range}`;
}

/** ISO-8601 opening hours for schema.org, grouping days that share times. */
export function schemaOpeningHours(content: HoursInput): { opens: string; closes: string; days: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const key of WEEK_ORDER) {
    const s = content.hours[key];
    if (s.closed || !s.open || !s.close) continue;
    const slot = `${s.open}-${s.close}`;
    groups.set(slot, [...(groups.get(slot) ?? []), DAY_NAMES[key]]);
  }
  return [...groups.entries()].map(([slot, days]) => {
    const [opens = "", closes = ""] = slot.split("-");
    return { opens, closes, days };
  });
}
