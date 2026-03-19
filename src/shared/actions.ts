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