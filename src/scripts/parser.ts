interface TransactionRecord {
  date: string;
  operation: string;
  description: string;
  balanceChange: number;
  currency: string;
}

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

function parseCustomDate(dateStr: string) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Словарь месяцев (русские названия -> числовое значение)
  const months = {
    января: 1,
    февраля: 2,
    марта: 3,
    апреля: 4,
    мая: 5,
    июня: 6,
    июля: 7,
    августа: 8,
    сентября: 9,
    октября: 10,
    ноября: 11,
    декабря: 12,
  };

  // Обработка специальных случаев
  if (dateStr === "Сегодня") {
    return formatToMDYYYY(now);
  }

  if (dateStr === "Вчера") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatToMDYYYY(yesterday);
  }

  // Разбираем строки типа "8 января" или "8 января 2024"
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1];
    const month = monthKey ? months[monthKey as keyof typeof months] : undefined;
    let year = currentYear;

    // Если указан год (например, "8 января 2024")
    if (parts.length === 3) {
      year = parseInt(parts[2], 10);
    }

    if (month === undefined) {
      return formatToMDYYYY(now);
    }
    return `${month}/${day}/${year}`;
  }

  // Если формат не распознан, возвращаем текущую дату
  return formatToMDYYYY(now);
}

// Вспомогательная функция для форматирования Date в m/d/yyyy
function formatToMDYYYY(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function findTransactionRowById(id: number) {
  return document.querySelector(`div[data-index="${id}"]`);
}

function scroll(rowId: number) {
  const scrollContainer = document.querySelector(
    '[class*="PageLayout-module__content__"]'
  ) as HTMLElement | null;

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

  const topPos = row.offsetTop - scrollContainer.offsetTop;

  console.log("scrolling to " + topPos);
  // // scrollContainer.scrollTop = scrollContainer.scrollHeight;
  // scrollContainer.scrollTo({
  //   top: topPos,
  //   behavior: 'smooth'
  // })
  row.scrollIntoView({
    behavior: "instant", // неплавная прокрутка
    block: "start", // Выравниваем по верхнему краю
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

function parseCurrency(str: string) {
  return str.at(-1) === "₽" ? "RUB" : "BONUS";
}

const specialSpaceSymbol = " ";
const specialMinus = "−";

function parseBalanceChange(str: string) {
  return parseFloat(
    str
      .replace(",", ".")
      .replace(specialSpaceSymbol, "")
      .replace(specialMinus, "-")
  );
}

function extractTransactionInfo(node: Element, state: State): TransactionRecord | null {
  const operationDiv = node.querySelector('[class*="operationName"]');
  const operationDescriptionDiv = node.querySelector(
    '[class*="operationDescription"]'
  );
  const operationBalanceChangeDiv = node.querySelector(
    '[class*="balanceChange"]'
  );

  if (!operationDiv) {
    state.date = parseCustomDate(node.textContent ?? "");
    return null;
  }

  if (!operationBalanceChangeDiv) {
    return null;
  }

  console.log(operationBalanceChangeDiv.textContent);
  return {
    date: state.date ?? "",
    operation: operationDiv.textContent ?? "",
    description: operationDescriptionDiv?.textContent || "",
    balanceChange: parseBalanceChange(operationBalanceChangeDiv.textContent ?? ""),
    currency: parseCurrency(operationBalanceChangeDiv.textContent ?? ""),
  };
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
    const info = extractTransactionInfo(row, state);
    if (info) {
      result.push(info);
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
  return true; // Необходимо для асинхронного ответа
});
