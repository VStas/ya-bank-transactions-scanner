import { onRuntimeMessage, type Action } from "./shared/actions";

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;


  // Send message to content script
  console.log("sending message");
  // const response = await chrome.tabs.sendMessage(tab.id, { action: "parsePage" });
  // const response = await sendToTab(tab.id, { action: "parsePage" });
  // console.log("response", response);
});

// In background script
onRuntimeMessage((action: Action, _sender, _sendResponse) => {
  console.log("request");
  console.log(action);
  if (action.action === "downloadCSV") {
    const {data} = action;
    const csvContent = data
      .map((row: string[]) =>
        row.map((item: string) => `"${String(item).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    // Use chrome.downloads API without createObjectURL
    chrome.downloads.download({
      url: "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent),
      filename: action.filename,
      saveAs: true,
    });

    //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //   const url = URL.createObjectURL(blob);

    //   chrome.downloads.download({
    //     url: url,
    //     filename: request.filename,
    //     saveAs: true
    //   }, () => URL.revokeObjectURL(url));
  }
});

