// DOM selectors for YaBank transaction history page
const SELECTORS = {
  // global selectors
  transactionRow: (id: number) => `div[data-index="${id}"]`,
  scrollContainer: '[class*="PageLayout-module__content__"]',

  // selectors inside a transaction
  operationName: '[class*="operationName"]',
  operationDescription: '[class*="operationDescription"]',
  operationBalanceChange: '[class*="balanceChange"]',
} as const;

export function findTransactionRowById(id: number): Element | null {
  return document.querySelector(SELECTORS.transactionRow(id));
}

export function getScrollContainer(): HTMLElement | null {
  return document.querySelector(SELECTORS.scrollContainer) as HTMLElement | null;
}

export function getOperationNameElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(SELECTORS.operationName);
}

export function getOperationDescriptionElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(SELECTORS.operationDescription);
}

export function getBalanceChangeElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(SELECTORS.operationBalanceChange);
}
