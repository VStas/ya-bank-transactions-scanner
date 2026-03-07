// DOM selectors for YaBank transaction history page

const GLOBAL_SELECTORS = {
  transactionRow: (id: number) => `div[data-index="${id}"]`,
  scrollContainer: '[class*="PageLayout-module__content__"]',
} as const;

const TRANSACTION_SELECTORS = {
  operationName: '[class*="operationName"]',
  operationDescription: '[class*="operationDescription"]',
  operationBalanceChange: '[class*="balanceChange"]',
} as const;

export function findTransactionRowById(id: number): Element | null {
  return document.querySelector(GLOBAL_SELECTORS.transactionRow(id));
}

export function getScrollContainer(): HTMLElement | null {
  return document.querySelector(GLOBAL_SELECTORS.scrollContainer) as HTMLElement | null;
}

export function getOperationNameElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(TRANSACTION_SELECTORS.operationName);
}

export function getOperationDescriptionElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(TRANSACTION_SELECTORS.operationDescription);
}

export function getBalanceChangeElement(transactionNode: Element): Element | null {
  return transactionNode.querySelector(TRANSACTION_SELECTORS.operationBalanceChange);
}
