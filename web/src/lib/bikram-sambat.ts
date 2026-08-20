/**
 * Bikram Sambat (BS) ↔ Gregorian (AD) conversion.
 *
 * BS month lengths are irregular and vary year to year, so conversion relies on
 * a reference table of days-per-month for each BS year. We anchor at a known
 * correspondence (1 Baisakh 2000 BS = 14 April 1943 AD) and walk day counts.
 *
 * The backend always stores/returns AD. This utility is presentation-only:
 * it converts AD → BS for display across the Nepali UI.
 */

// Nepali month names
export const BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_MONTHS_NP = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
] as const;

export const BS_DAYS_NP = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिहि",
  "शुक्र",
  "शनि",
] as const;
export const BS_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

// Days in each month for BS years 2000–2100.
// Each entry: [year, m1..m12]. This is standard reference data.
const BS_CALENDAR: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2023: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2024: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2030: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2031: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2032: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2033: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2034: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2042: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2043: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2044: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2045: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2046: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2047: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2048: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2054: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2061: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2065: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2066: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2069: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2072: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2073: [31, 31, 32, 31, 31, 31, 30, 30, 29, 29, 30, 30],
  2074: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2075: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2096: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2097: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 30, 29, 30, 30],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2100: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

// Anchor: 1 Baisakh 2000 BS = 14 April 1943 AD.
const ANCHOR_BS = { year: 2000, month: 0, day: 1 };
const ANCHOR_AD = Date.UTC(1943, 3, 14); // April = month 3 (0-indexed)
const MS_PER_DAY = 86400000;

export interface BsDate {
  year: number;
  month: number; // 0-indexed (0 = Baisakh)
  day: number;
  weekday: number; // 0 = Sunday
}

/** Convert an AD date (Date or ISO string) to BS. */
export function adToBs(input: Date | string): BsDate | null {
  const date =
    typeof input === "string"
      ? new Date(input.split("T")[0] + "T00:00:00Z")
      : input;
  if (isNaN(date.getTime())) return null;

  const target = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  let daysSinceAnchor = Math.round((target - ANCHOR_AD) / MS_PER_DAY);
  if (daysSinceAnchor < 0) return null; // before our range

  const weekday = new Date(target).getUTCDay();

  let year = ANCHOR_BS.year;
  let month = ANCHOR_BS.month;
  let day = ANCHOR_BS.day;

  while (daysSinceAnchor > 0) {
    const monthsInYear = BS_CALENDAR[year];
    if (!monthsInYear) return null; // out of range
    const daysInMonth = monthsInYear[month];
    const remainingInMonth = daysInMonth - day;

    if (daysSinceAnchor <= remainingInMonth) {
      day += daysSinceAnchor;
      daysSinceAnchor = 0;
    } else {
      daysSinceAnchor -= remainingInMonth + 1;
      day = 1;
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  return { year, month, day, weekday };
}

/** Convert Nepali digits. */
export function toNepaliDigits(input: string | number): string {
  const map = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(input).replace(/\d/g, (d) => map[Number(d)]);
}

/**
 * Format an AD date as BS for display.
 * formatBS("2024-12-01")            → "16 Mangsir 2081"
 * formatBS("2024-12-01", { np: true }) → "१६ मंसिर २०८१"
 * formatBS("2024-12-01", { short: true }) → "2081/08/16"
 */
export function formatBS(
  input: Date | string | null | undefined,
  opts: { np?: boolean; short?: boolean; weekday?: boolean } = {},
): string {
  if (!input) return "—";
  const bs = adToBs(input);
  if (!bs) return typeof input === "string" ? input.split("T")[0] : "—";

  if (opts.short) {
    const m = String(bs.month + 1).padStart(2, "0");
    const d = String(bs.day).padStart(2, "0");
    const s = `${bs.year}/${m}/${d}`;
    return opts.np ? toNepaliDigits(s) : s;
  }

  const monthName = opts.np ? BS_MONTHS_NP[bs.month] : BS_MONTHS[bs.month];
  const dayStr = opts.np ? toNepaliDigits(bs.day) : String(bs.day);
  const yearStr = opts.np ? toNepaliDigits(bs.year) : String(bs.year);
  const base = `${dayStr} ${monthName} ${yearStr}`;

  if (opts.weekday) {
    const wd = opts.np ? BS_DAYS_NP[bs.weekday] : BS_DAYS[bs.weekday];
    return `${wd}, ${base}`;
  }
  return base;
}

/** Today in BS, formatted. */
export function todayBS(
  opts: { np?: boolean; weekday?: boolean } = {},
): string {
  return formatBS(new Date(), opts);
}
