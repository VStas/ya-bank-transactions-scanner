import { parseCustomDate } from "../shared/dateUtils";


/** If the row is a date row, parses and returns the date. Otherwise returns null. */
export function tryParseDate(node: Element): string | null {
  if (!node.textContent) {
    return null;
  }
  return parseCustomDate(node.textContent);
}
