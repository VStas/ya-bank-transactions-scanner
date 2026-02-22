import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tryExtractTransactionInfo,
  type TransactionRecord,
} from "./transaction";

const mockGetOperationNameElement = vi.fn();
const mockGetOperationDescriptionElement = vi.fn();
const mockGetBalanceChangeElement = vi.fn();

vi.mock("../shared/domAccessor", () => ({
  getOperationNameElement: (node: Element) => mockGetOperationNameElement(node),
  getOperationDescriptionElement: (node: Element) =>
    mockGetOperationDescriptionElement(node),
  getBalanceChangeElement: (node: Element) => mockGetBalanceChangeElement(node),
}));

function createMockElement(textContent: string): Element {
  return { textContent } as unknown as Element;
}

const mockNode = {} as Element;

describe("extractTransactionInfo", () => {
  beforeEach(() => {
    mockGetOperationNameElement.mockClear();
    mockGetOperationDescriptionElement.mockClear();
    mockGetBalanceChangeElement.mockClear();
  });

  it("returns null when operation div is missing", () => {
    mockGetOperationNameElement.mockReturnValue(null);
    const result = tryExtractTransactionInfo(mockNode, "1/15/2024");
    expect(result).toBe(null);
  });

  it("returns null when balance change div is missing", () => {
    mockGetOperationNameElement.mockReturnValue(createMockElement("Taxi"));
    mockGetBalanceChangeElement.mockReturnValue(null);
    const result = tryExtractTransactionInfo(mockNode, "1/15/2024");
    expect(result).toBe(null);
  });

  it("extracts transaction with RUB currency when balance ends with ₽", () => {
    const operationEl = createMockElement("Taxi");
    const descriptionEl = createMockElement("Yandex Taxi");
    const balanceEl = createMockElement("-500 ₽");

    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(descriptionEl);
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "1/15/2024");

    expect(result).toEqual<TransactionRecord>({
      date: "1/15/2024",
      operation: "Taxi",
      description: "Yandex Taxi",
      balanceChange: -500,
      currency: "RUB",
    });
  });

  it("extracts transaction with BONUS currency when balance does not end with ₽", () => {
    const operationEl = createMockElement("Reward");
    const descriptionEl = createMockElement("Cashback");
    const balanceEl = createMockElement("50");

    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(descriptionEl);
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "2/20/2024");

    expect(result).toEqual<TransactionRecord>({
      date: "2/20/2024",
      operation: "Reward",
      description: "Cashback",
      balanceChange: 50,
      currency: "BONUS",
    });
  });

  it("parses balance with comma as decimal separator", () => {
    const operationEl = createMockElement("Shop");
    const descriptionEl = createMockElement("Products");
    const balanceEl = createMockElement("-1234,56 ₽");

    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(descriptionEl);
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "3/1/2024");

    expect(result?.balanceChange).toBe(-1234.56);
    expect(result?.currency).toBe("RUB");
  });

  it("parses balance with non-breaking space as thousand separator", () => {
    const balanceEl = createMockElement("1\u00A0234,56 ₽"); // NBSP between digits
    mockGetOperationNameElement.mockReturnValue(createMockElement("Shop"));
    mockGetOperationDescriptionElement.mockReturnValue(createMockElement(""));
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "3/1/2024");

    expect(result?.balanceChange).toBe(1234.56);
  });

  it("parses balance over a million with two non-breaking space separators", () => {
    const balanceEl = createMockElement("1\u00A0234\u00A0567,89 ₽"); // 1 234 567,89
    mockGetOperationNameElement.mockReturnValue(createMockElement("Large transfer"));
    mockGetOperationDescriptionElement.mockReturnValue(createMockElement(""));
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "6/15/2024");

    expect(result?.balanceChange).toBe(1234567.89);
    expect(result?.currency).toBe("RUB");
  });

  it("parses balance with unicode minus sign", () => {
    const balanceEl = createMockElement("−100 ₽"); // Unicode minus U+2212
    mockGetOperationNameElement.mockReturnValue(createMockElement("Pay"));
    mockGetOperationDescriptionElement.mockReturnValue(createMockElement(""));
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "4/10/2024");

    expect(result?.balanceChange).toBe(-100);
  });

  it("uses empty string for date when currentDate is null", () => {
    const operationEl = createMockElement("Op");
    const balanceEl = createMockElement("0 ₽");
    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(createMockElement(""));
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, null);

    expect(result?.date).toBe("");
  });

  it("uses empty string for description when description element is null", () => {
    const operationEl = createMockElement("Op");
    const balanceEl = createMockElement("100 ₽");
    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(null);
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "5/5/2024");

    expect(result?.description).toBe("");
  });

  it("uses empty string for description when description has empty textContent", () => {
    const operationEl = createMockElement("Op");
    const descriptionEl = createMockElement("");
    const balanceEl = createMockElement("100 ₽");
    mockGetOperationNameElement.mockReturnValue(operationEl);
    mockGetOperationDescriptionElement.mockReturnValue(descriptionEl);
    mockGetBalanceChangeElement.mockReturnValue(balanceEl);

    const result = tryExtractTransactionInfo(mockNode, "5/5/2024");

    expect(result?.description).toBe("");
  });
});
