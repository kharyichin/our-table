import { describe, expect, it } from "vitest";
import { weekStartIso, weekStartIsoForDate } from "@/lib/week";

describe("week calculations", () => {
  it("uses Monday as the first day throughout the week", () => {
    expect(weekStartIsoForDate("2026-09-03")).toBe("2026-08-31");
    expect(weekStartIsoForDate("2026-09-06")).toBe("2026-08-31");
    expect(weekStartIsoForDate("2026-09-07")).toBe("2026-09-07");
  });

  it("returns a local calendar date without UTC rollover", () => {
    expect(weekStartIso(new Date(2026, 7, 31, 23, 30))).toBe("2026-08-31");
  });

  it("uses the supplied fallback for invalid input", () => {
    expect(weekStartIsoForDate("not-a-date", new Date(2026, 8, 2, 12))).toBe("2026-08-31");
  });
});
