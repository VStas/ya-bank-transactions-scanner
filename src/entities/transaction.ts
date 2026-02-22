import {
  getOperationNameElement,
  getOperationDescriptionElement,
  getBalanceChangeElement,
} from "../shared/domAccessor";

export interface TransactionRecord {
  date: string;
  operation: string;
  description: string;
  balanceChange: number;
  currency: string;
}

/** Returns true if the row is a transaction row (has operation div) */
// export function isTransactionRow(node: Element): boolean {
//   return getOperationNameElement(node) !== null;
// }

const specialSpaceSymbol = "\u00A0"; // Non-breaking space used in YaBank
const specialMinus = "−";

function parseCurrency(str: string) {
  return str.at(-1) === "₽" ? "RUB" : "BONUS";
}

function parseBalanceChange(str: string) {
  return parseFloat(
    str
      .replace(",", ".")
      .replaceAll(specialSpaceSymbol, "")
      .replaceAll(specialMinus, "-")
  );
}

export function tryExtractTransactionInfo(
  node: Element,
  currentDate: string | null
): TransactionRecord | null {
  const operationDiv = getOperationNameElement(node);
  const operationDescriptionDiv = getOperationDescriptionElement(node);
  const operationBalanceChangeDiv = getBalanceChangeElement(node);

  if (!operationDiv) {
    return null;
  }

  if (!operationBalanceChangeDiv) {
    return null;
  }

  return {
    date: currentDate ?? "",
    operation: operationDiv.textContent,
    description: operationDescriptionDiv?.textContent || "",
    balanceChange: parseBalanceChange(operationBalanceChangeDiv.textContent),
    currency: parseCurrency(operationBalanceChangeDiv.textContent),
  };
}
