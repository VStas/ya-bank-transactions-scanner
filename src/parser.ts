import {
  findTransactionRowById,
  getScrollContainer,
} from "./shared/domAccessor";
import { type TransactionRecord, tryExtractTransactionInfo } from "./entities/transaction";
import { tryParseDate } from "./entities/date";

interface CategoryMapping {
  category: string;
  comment?: string;
}

function mapPersonalCatergoryAndDescription({
  operation,
  description,
}: Pick<TransactionRecord, "operation" | "description">): CategoryMapping {
  if (
    description === "Общественный транспорт" &&
    operation === "Московский транспорт"
  ) {
    return { category: "Метро" };
  }
  if (operation === "Такси") {
    return { category: "Такси" };
  }
  if (description === "Фастфуд" || description === "Рестораны и кафе") {
    return { category: "Рестораны, кофе" };
  }
  if (description === "Спорт") {
    return { category: "Тренировки" };
  }
  if (description === "Супермаркеты") {
    if (operation.startsWith("VV_")) {
      return { category: "Продукты", comment: "Вкусвилл" };
    }
    return { category: "Продукты" };
  }
  if (
    description === "Перевод между счетами" ||
    description === "Автопополнение"
  ) {
    return { category: "Переводы" };
  }
  if (description === "Перевод") {
    return { category: "Переводы" };
  }
  if (
    description === "Мобильная связь" &&
    operation === "SBP hosting nuxt cloud"
  ) {
    return {
      category: "Регулярные платежи",
      comment: "NuxtCloud. Оплата за VPN",
    };
  }

  if (description === "Телеком" && operation.includes("PAY.MTS.RU")) {
    return { category: "Регулярные платежи", comment: "МТС. Интернет" };
  }

  if (operation === "domovenokbs") {
    return { category: "Клининг", comment: "Домовенок" };
  }

  if (description === "Парковка") {
    return { category: "Автомобиль", comment: `Парковка. ${operation}` };
  }

  if (operation === "Выплата процентов") {
    return { category: "Доход", comment: "Выплата процентов на сейф" };
  }

  // if (description === 'Салоны красоты и СПА') {
  //   return {category: 'Парикмахерская'}
  // }
  return { category: "???" };
}

function mapToPersonalTableRecord(record: TransactionRecord): string[] {
  const { date, balanceChange, operation, description } = record;
  const { category, comment } = mapPersonalCatergoryAndDescription(record);
  const expense = balanceChange < 0 ? String(-balanceChange) : "";
  const income = balanceChange >= 0 ? String(balanceChange) : "";
  return [
    date,
    category,
    "Yandex Card",
    expense,
    income,
    comment ?? description + " " + operation,
  ];
}

function scroll(rowId: number) {
  const scrollContainer = getScrollContainer();

  if (rowId === -1) {
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    return;
  }

  const row = findTransactionRowById(rowId) as HTMLElement | null;

  if (!row || !scrollContainer) {
    return;
  }

  row.scrollIntoView({
    behavior: "instant",
    block: "start",
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForRow(id: number, timeout: number, maxTries = 100) {
  console.log("waiting for row " + id);
  let node = findTransactionRowById(id);
  if (node) {
    return node;
  }

  let tries = 0;

  scroll(id - 1);

  while (!node && tries < maxTries) {
    await wait(timeout);
    node = findTransactionRowById(id);
    tries += 1;
  }

  if (tries >= maxTries) {
    throw new Error(`tries >= ${maxTries}`);
  }

  return node;
}


class State {
  currentTransactionId = 0;
  date: string | null = null;

  resetState() {
    this.currentTransactionId = 0;
    this.date = null;
  }

  incrementCurrentTransactionId() {
    this.currentTransactionId += 1;
  }
}

async function scan() {
  const result = [];
  const state = new State();
  // scroll();

  let row = await waitForRow(state.currentTransactionId, 300, 500);
  while (row && state.currentTransactionId < 1000) {
    const info = tryExtractTransactionInfo(row, state.date);
    if (info !== null) {
      result.push(info);
    } else {
      const date = tryParseDate(row);
      if (date !== null) {
        state.date = date;
      }
    }

    state.incrementCurrentTransactionId();

    row = await waitForRow(state.currentTransactionId, 300, 500);
  }

  return result;
}

function downloadCSV(data: string[][], filename: string) {
  chrome.runtime.sendMessage({
    action: "downloadCSV",
    data: data,
    filename: filename,
  });
}

chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  if (request.action === "parsePage") {
    const json = await scan();
    // const titles = ['Дата', 'Категория', 'Сумма', 'Описание', 'Валюта'];
    // const table = json.map((element) => [element.date, element.description, element.balanceChange, element.operation, element.currency]);
    const table = json.map(mapToPersonalTableRecord).reverse();
    // table.unshift(titles);
    downloadCSV(table, "yabank-transactions.csv");
    sendResponse({ data: { success: true } });
  }
  return true; // Required for async response
});
