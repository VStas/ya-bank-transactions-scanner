import type { TransactionRecord } from "../../entities/transaction";

export class State {
  currentTransactionId = 0;
  date: string | null = null;
  isScanning = false;
  result: TransactionRecord[] = [];

  resetState() {
    this.currentTransactionId = 0;
    this.date = null;
    this.result = [];
  }
}

export const state = new State();
