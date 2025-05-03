// alert('hi')
// console.log('hello hello hello')


function parseCustomDate(dateStr) {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Словарь месяцев (русские названия -> числовое значение)
  const months = {
    'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4,
    'мая': 5, 'июня': 6, 'июля': 7, 'августа': 8,
    'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
  };

  // Обработка специальных случаев
  if (dateStr === 'Сегодня') {
    return formatToMDYYYY(now);
  }
  
  if (dateStr === 'Вчера') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatToMDYYYY(yesterday);
  }

  // Разбираем строки типа "8 января" или "8 января 2024"
  const parts = dateStr.split(' ');
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    let year = currentYear;
    
    // Если указан год (например, "8 января 2024")
    if (parts.length === 3) {
      year = parseInt(parts[2], 10);
    }
    
    return `${month}/${day}/${year}`;
  }

  // Если формат не распознан, возвращаем текущую дату
  return formatToMDYYYY(now);
}

// Вспомогательная функция для форматирования Date в m/d//yyyy
function formatToMDYYYY(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}



function findTransactionRowById(id) {
  return document.querySelector(`div[data-index="${id}"]`)
}

function scroll() {
  const scrollContainer = document.querySelector('[class*="PageLayout-module__content__"]');
  // console.log({scrollContainer})
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}

async function waitForRow(id, timeout, maxTries = 100) {
  console.log('waiting for row ' + id);
  let node = findTransactionRowById(id);
  if (node) {
    return node;
  }

  let tries = 0;

  scroll();

  while (!node && tries < maxTries) {
    await wait(timeout);
    node = findTransactionRowById(id);
    tries += 1
  }

  if (tries >= maxTries) {
    throw new Error(`tries >= ${maxTries}`)
  }

  return node;
}

function parseCurrency(str) {
  return str.at(-1) === '₽' ? 'RUB' : 'BONUS'
}

  const specialSpaceSymbol = ' ';
  const specialMinus = '−';

function parseBalanceChange(str) {
  return parseFloat(
    str.replace(',','.')
      .replace(specialSpaceSymbol, '')
      .replace(specialMinus, '-'),
    10
  )
}

function extractTransactionInfo(node, state) {
  const operationDiv = node.querySelector('[class*="operationName"]');
  const operationDescriptionDiv = node.querySelector('[class*="operationDescription"]');
  const operationBalanceChangeDiv = node.querySelector('[class*="balanceChange"]');

  if (!operationDiv) {
    // if (node.textContent) {
      state.date = parseCustomDate(node.textContent);
    // }
    return null;
  }

  console.log(operationBalanceChangeDiv.textContent);
  return {
    date: state.date,
    operation: operationDiv.textContent,
    description: operationDescriptionDiv.textContent,
    balanceChange: parseBalanceChange(operationBalanceChangeDiv.textContent),
    currency: parseCurrency(operationBalanceChangeDiv.textContent)
  };
}

class State {
  currentTransactionId = 0;
  date = null;

  get currentTransactionId() {
    return this.currentTransactionId;
  }

  set date(newDate) {
    this.date = newDate;
  }

  resetState() {
    currentTransactionId = 0;
    date = null;
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
  // let row = findTransactionRowById(state.currentTransactionId);
  while (row && state.currentTransactionId < 100) {
    const info = extractTransactionInfo(row, state);
    if (info) {
      result.push(info);
    }
    // console.log(info);
    // console.log({id: state.currentTransactionId, info})

    state.incrementCurrentTransactionId();

    row = await waitForRow(state.currentTransactionId, 300, 500);
  }

  return result;
}

function downloadCSV(data, filename) {
  chrome.runtime.sendMessage({
    action: "downloadCSV",
    data: data,
    filename: filename
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // console.log('received a message');
  if (request.action === "parsePage") {
      // const data = 'hello'
      const json = await scan();
      const titles = ['Дата', 'Категория', 'Сумма', 'Описание', 'Валюта'];
      const table = json.map((element) => [element.date, element.description, element.balanceChange, element.operation, element.currency]);
      table.unshift(titles);
      downloadCSV(table, 'yabank-transactions.csv')
      sendResponse({data: {success: true}});
    }
    return true; // Необходимо для асинхронного ответа
  }
);

