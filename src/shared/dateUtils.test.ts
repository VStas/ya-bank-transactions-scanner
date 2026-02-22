import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseCustomDate } from "./dateUtils";

describe("parseCustomDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-15T12:00:00")); // Noon local time for consistent results
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today's date for 'Сегодня'", () => {
    expect(parseCustomDate("Сегодня")).toBe("3/15/2024");
  });

  it("returns yesterday's date for 'Вчера'", () => {
    expect(parseCustomDate("Вчера")).toBe("3/14/2024");
  });

  it("parses '8 января' using current year", () => {
    expect(parseCustomDate("8 января")).toBe("1/8/2024");
  });

  it("parses '8 января 2024' with explicit year", () => {
    expect(parseCustomDate("8 января 2024")).toBe("1/8/2024");
  });

  it("parses '25 декабря 2023'", () => {
    expect(parseCustomDate("25 декабря 2023")).toBe("12/25/2023");
  });

  it("parses all Russian month names", () => {
    expect(parseCustomDate("1 января")).toBe("1/1/2024");
    expect(parseCustomDate("1 февраля")).toBe("2/1/2024");
    expect(parseCustomDate("1 марта")).toBe("3/1/2024");
    expect(parseCustomDate("1 апреля")).toBe("4/1/2024");
    expect(parseCustomDate("1 мая")).toBe("5/1/2024");
    expect(parseCustomDate("1 июня")).toBe("6/1/2024");
    expect(parseCustomDate("1 июля")).toBe("7/1/2024");
    expect(parseCustomDate("1 августа")).toBe("8/1/2024");
    expect(parseCustomDate("1 сентября")).toBe("9/1/2024");
    expect(parseCustomDate("1 октября")).toBe("10/1/2024");
    expect(parseCustomDate("1 ноября")).toBe("11/1/2024");
    expect(parseCustomDate("1 декабря")).toBe("12/1/2024");
  });

  it("returns null for unrecognized format", () => {
    expect(parseCustomDate("invalid")).toBe(null);
  });

  it("returns current date when month is unknown", () => {
    expect(parseCustomDate("8 unknownmonth")).toBe("3/15/2024");
  });
});
