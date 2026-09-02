import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  describeDay,
  formatTime,
  datePlus,
  localNow,
  nextOpening,
  openState,
  schemaOpeningHours,
  scheduleFor,
  toMinutes,
} from "../lib/hours.ts";
import type { DayKey, DaySchedule, HoursException } from "../lib/types.ts";

/* The shipped pattern: an evening café, 4pm to 11pm, every day.
   Every instant below is written as UTC and asserted in IST (UTC+5:30, no
   daylight saving), because that is exactly the conversion the site has to get
   right for a visitor reading the page from anywhere else. */
const EVERY_DAY_4_TO_11: Record<DayKey, DaySchedule> = {
  mon: { open: "16:00", close: "23:00" },
  tue: { open: "16:00", close: "23:00" },
  wed: { open: "16:00", close: "23:00" },
  thu: { open: "16:00", close: "23:00" },
  fri: { open: "16:00", close: "23:00" },
  sat: { open: "16:00", close: "23:00" },
  sun: { open: "16:00", close: "23:00" },
};

const base = (exceptions: HoursException[] = []) => ({ hours: EVERY_DAY_4_TO_11, exceptions });

describe("time helpers", () => {
  test("toMinutes parses 24h clock", () => {
    assert.equal(toMinutes("00:00"), 0);
    assert.equal(toMinutes("16:00"), 960);
    assert.equal(toMinutes("23:30"), 1410);
  });

  test("formatTime renders the way a board is written", () => {
    assert.equal(formatTime("16:00"), "4pm");
    assert.equal(formatTime("23:00"), "11pm");
    assert.equal(formatTime("12:00"), "12pm");
    assert.equal(formatTime("00:00"), "12am");
    assert.equal(formatTime("16:30"), "4:30pm");
  });

  test("describeDay renders a range or Closed", () => {
    assert.equal(describeDay({ open: "16:00", close: "23:00" }), "4pm – 11pm");
    assert.equal(describeDay({ closed: true }), "Closed");
  });
});

describe("localNow", () => {
  test("converts a UTC instant into IST wall-clock time", () => {
    // 1 Sep 2026 12:00 UTC is 17:30 IST on a Tuesday.
    const now = localNow(new Date("2026-09-01T12:00:00Z"));
    assert.equal(now.key, "tue");
    assert.equal(now.date, "2026-09-01");
    assert.equal(now.minutes, 17 * 60 + 30);
  });

  test("the half-hour offset is not lost", () => {
    // 09:30 UTC is 15:00 IST — the case a whole-hour offset would get wrong.
    const now = localNow(new Date("2026-01-06T09:30:00Z"));
    assert.equal(now.key, "tue");
    assert.equal(now.date, "2026-01-06");
    assert.equal(now.minutes, 15 * 60);
  });

  test("a late-evening UTC instant is already the next day in India", () => {
    // 23:30 UTC is 05:00 IST the following morning.
    const now = localNow(new Date("2026-06-10T23:30:00Z"));
    assert.equal(now.date, "2026-06-11");
    assert.equal(now.minutes, 5 * 60);
  });
});

describe("datePlus", () => {
  test("adds days across a month boundary", () => {
    assert.equal(datePlus("2026-08-31", 1), "2026-09-01");
  });

  test("adds days across a year boundary", () => {
    assert.equal(datePlus("2026-12-31", 1), "2027-01-01");
  });

  test("adds days across a leap day", () => {
    assert.equal(datePlus("2028-02-28", 1), "2028-02-29");
    assert.equal(datePlus("2028-02-29", 1), "2028-03-01");
  });

  test("is anchored at midday, so a near-midnight instant cannot slip a day", () => {
    // The arithmetic must not depend on the visitor's own clock.
    assert.equal(datePlus("2026-03-29", 1), "2026-03-30");
    assert.equal(datePlus("2026-10-25", 1), "2026-10-26");
  });
});

describe("openState", () => {
  test("open in the middle of the evening", () => {
    const s = openState(base(), new Date("2026-09-01T13:00:00Z")); // 18:30 IST
    assert.equal(s.open, true);
    assert.equal(s.label, "Open now · until 11pm");
  });

  test("warns when closing within 45 minutes", () => {
    const s = openState(base(), new Date("2026-09-01T17:00:00Z")); // 22:30 IST
    assert.equal(s.open, true);
    assert.equal(s.label, "Open · closing at 11pm");
  });

  test("closed before opening, points at today's opening time", () => {
    const s = openState(base(), new Date("2026-09-01T06:30:00Z")); // 12:00 IST
    assert.equal(s.open, false);
    assert.equal(s.label, "Closed · opens at 4pm");
  });

  test("closed after closing, points at tomorrow", () => {
    const s = openState(base(), new Date("2026-09-01T18:00:00Z")); // 23:30 IST
    assert.equal(s.open, false);
    assert.equal(s.label, "Closed · opens tomorrow at 4pm");
  });

  test("exactly at opening time counts as open", () => {
    const s = openState(base(), new Date("2026-09-01T10:30:00Z")); // 16:00 IST
    assert.equal(s.open, true);
  });

  test("exactly at closing time counts as closed", () => {
    const s = openState(base(), new Date("2026-09-01T17:30:00Z")); // 23:00 IST
    assert.equal(s.open, false);
    assert.equal(s.label, "Closed · opens tomorrow at 4pm");
  });

  test("a visitor's own timezone does not affect the answer", () => {
    // The same instant, whatever clock the visitor's device is set to.
    const instant = new Date("2026-09-01T13:00:00Z");
    assert.equal(openState(base(), instant).open, true);
    assert.equal(openState(base(), new Date(instant.getTime())).label, "Open now · until 11pm");
  });
});

describe("exceptions", () => {
  // 8 Nov 2026 is a Sunday; the 7th is the Saturday before it.
  const diwali: HoursException[] = [
    { date: "2026-11-08", closed: true, note: "Diwali" },
    { date: "2026-11-07", open: "16:00", close: "21:00", note: "Diwali eve" },
  ];

  test("a closed-day override shuts the café", () => {
    const s = openState(base(diwali), new Date("2026-11-08T13:00:00Z")); // 18:30 IST
    assert.equal(s.open, false);
    assert.equal(s.label, "Closed · opens tomorrow at 4pm");
  });

  test("a shortened-day override is respected", () => {
    const late = openState(base(diwali), new Date("2026-11-07T16:30:00Z")); // 22:00 IST
    assert.equal(late.open, false);
    const earlier = openState(base(diwali), new Date("2026-11-07T12:30:00Z")); // 18:00 IST
    assert.equal(earlier.open, true);
    assert.equal(earlier.label, "Open now · until 9pm");
  });

  test("next opening skips over a closed day", () => {
    const now = localNow(new Date("2026-11-07T17:30:00Z")); // Sat 23:00 IST
    const next = nextOpening(base(diwali), now);
    // Sunday is shut, so the next opening is Monday.
    assert.equal(next?.key, "mon");
    assert.equal(next?.label, "Monday");
  });

  test("scheduleFor prefers an override over the weekly pattern", () => {
    assert.deepEqual(scheduleFor(base(diwali), "sun", "2026-11-08"), { closed: true });
    assert.deepEqual(scheduleFor(base(diwali), "sun", "2026-11-01"), {
      open: "16:00",
      close: "23:00",
    });
  });
});

describe("a café that closes one day a week", () => {
  const closedMondays = {
    hours: { ...EVERY_DAY_4_TO_11, mon: { closed: true } as DaySchedule },
    exceptions: [] as HoursException[],
  };

  test("reports closed on that day", () => {
    const s = openState(closedMondays, new Date("2026-09-07T13:00:00Z")); // Monday 18:30 IST
    assert.equal(s.open, false);
    assert.equal(s.label, "Closed · opens tomorrow at 4pm");
  });

  test("Sunday night points past the closed Monday", () => {
    const now = localNow(new Date("2026-09-06T18:00:00Z")); // Sunday 23:30 IST
    const next = nextOpening(closedMondays, now);
    assert.equal(next?.key, "tue");
    assert.equal(next?.label, "Tuesday");
  });
});

describe("schemaOpeningHours", () => {
  test("groups every day into a single specification", () => {
    const spec = schemaOpeningHours(base());
    assert.equal(spec.length, 1);
    assert.equal(spec[0]?.opens, "16:00");
    assert.equal(spec[0]?.closes, "23:00");
    assert.equal(spec[0]?.days.length, 7);
  });

  test("splits when a day differs, and omits closed days", () => {
    const spec = schemaOpeningHours({
      hours: {
        ...EVERY_DAY_4_TO_11,
        sat: { open: "16:00", close: "23:59" },
        sun: { closed: true },
      },
      exceptions: [],
    });
    assert.equal(spec.length, 2);
    assert.deepEqual(
      spec.map((s) => s.days.length),
      [5, 1],
    );
  });
});
