alert('hi')
console.log('hello hello hello')

function findTransactionRowById(id) {
  return document.querySelector(`div[data-index="${id}"]`)
}

function scroll() {
  const scrollContainer = document.querySelector('[class*="PageLayout-module__content__"]');
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}

async function waitForRow(id, timeout, maxTries = 100) {
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

function extractTransactionInfo(node) {
  const operationDiv = node.querySelector('[class*="operationName"]');
  const operationDescriptionDiv = node.querySelector('[class*="operationDescription"]');
  const operationBalanceChangeDiv = node.querySelector('[class*="balanceChange"]');

  if (!operationDiv) {
    return null;
  }

  return {
    operation: operationDiv.textContent,
    description: operationDescriptionDiv.textContent,
    balanceChange: operationBalanceChangeDiv.textContent
  };
}

class State {
  currentTransactionId = 0;

  get currentTransactionId() {
    return this.currentTransactionId;
  }

  incrementCurrentTransactionId() {
    this.currentTransactionId += 1;
  }
}

async function startScan() {
  const state = new State();
  // scroll();

  let row = await waitForRow(state.currentTransactionId, 300, 500);
  // let row = findTransactionRowById(state.currentTransactionId);
  while (row) {
    const info = extractTransactionInfo(row);
    console.log(info);
    // console.log({id: state.currentTransactionId, info})

    state.incrementCurrentTransactionId();

    row = await waitForRow(state.currentTransactionId, 300, 500);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received a message');
  if (request.action === "parsePage") {
      const data = 'hello'
      startScan();
      sendResponse({ data: data });
    }
    return true; // Необходимо для асинхронного ответа
  }
);

