type ParseAction = {
    action: "parsePage"
};  

type DownloadCSVAction = {
    action: "downloadCSV"
    data: string[][];
    filename: string;
};

type ActionResponse =
  | { success: true }
  | { success: false; error: string };

export type Action = ParseAction | DownloadCSVAction;

export function sendToTab(
  tabId: number,
  message: Action
) {
  return chrome.tabs.sendMessage<Action, ActionResponse>(tabId, message);
}

/**
 * Send a message to the content script in the **current** browser tab (popup / user gesture).
 * Content scripts are per-tab, so the API requires a tab id — this resolves the active tab for you.
 */
export async function sendToActiveTab(
  message: Action
): Promise<ActionResponse | undefined> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tab.id === undefined) return undefined;
  return sendToTab(tab.id, message);
}

/**
 * Typed wrapper for `chrome.runtime.onMessage.addListener`.
 * Use the same rules as the raw API: return `true` to respond asynchronously.
 */
export function onRuntimeMessage(
  handler: (
    request: Action,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => void | boolean | Promise<void | boolean>
): void {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    return handler(request as Action, sender, sendResponse);
  });
}