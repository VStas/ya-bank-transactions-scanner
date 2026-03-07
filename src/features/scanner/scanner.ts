import {
  findTransactionRowById,
  getScrollContainer,
} from "../../shared/domAccessor";
import { type TransactionRecord, tryExtractTransactionInfo } from "../../entities/transaction";
import { tryParseDate } from "../../entities/date";
import { state } from "./state";
import { wait } from "../../shared/promise";

function scrollToMakeRowVisible(rowId: number) {
  const scrollContainer = getScrollContainer();
  if (!scrollContainer) {
    console.error("Unable to find scroll container");
    return;
  }

  if (rowId === 0) {
    scrollContainer.scrollTop = 0;
    return;
  }

  const previousRowId = rowId - 1;
  const row = findTransactionRowById(previousRowId);

  if (!row) {
    console.error(`Unable to find previous row with id = ${previousRowId}`);
    return;
  }

  row.scrollIntoView({
    behavior: "instant",
    block: "start",
  });
}

async function scanRowWithId(id: number, timeout: number, maxTries = 100) {
  console.log(`scanning row with id = ${id}`);
  let node = findTransactionRowById(id);
  if (node) {
    return node;
  }

  let tries = 0;
  scrollToMakeRowVisible(id);

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

export async function scan(): Promise<TransactionRecord[]> {
  if (state.isScanning) {
    console.log("scanning is already in progress");
    return [];
  }
  state.isScanning = true;
  state.resetState();

  try {
    while (state.currentTransactionId < 1000) {
      const row = await scanRowWithId(state.currentTransactionId, 300, 500);
      if (!row) break;

      const info = tryExtractTransactionInfo(row, state.date);
      if (info !== null) {
        state.result.push(info);
      } else {
        const date = tryParseDate(row);
        if (date !== null) {
          state.date = date;
        }
      }

      state.currentTransactionId += 1;
    }

    return state.result;
  } finally {
    state.isScanning = false;
  }
}
