import { type TransactionRecord } from "./entities/transaction";
import { scan } from "./features/scanner/scanner";
import { onRuntimeMessage, type Action } from "./shared/actions";

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

const PERSONAL_TABLE_HEADERS_RU: string[] = [
  "Дата",
  "Категория",
  "Счёт",
  "Расход",
  "Доход",
  "Комментарий",
];

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

function downloadCSV(data: string[][], filename: string) {
  chrome.runtime.sendMessage({
    action: "downloadCSV",
    data: data,
    filename: filename,
  });
}

onRuntimeMessage(async (request: Action, _sender, sendResponse) => {
  if (request.action === "parsePage") {
    const json = await scan();
    const rows: string[][] = [PERSONAL_TABLE_HEADERS_RU.slice()];
    for (let i = json.length - 1; i >= 0; i--) {
      rows.push(mapToPersonalTableRecord(json[i]));
    }
    downloadCSV(rows, "yabank-transactions.csv");
    sendResponse({ data: { success: true } });
  }
  return true; // Required for async response
});
