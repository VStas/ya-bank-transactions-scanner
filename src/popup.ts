import { sendToActiveTab } from "./shared/actions";

const downloadButton = document.getElementById("downloadCSV");

function disableButton() {
  if (downloadButton) {
    downloadButton.setAttribute('disabled', 'disabled');
  }
}

function enableButton() {
  if (downloadButton) {
    downloadButton.removeAttribute('disabled');
  }
}

if (downloadButton) {
  downloadButton.addEventListener("click", async () => {
    console.log("downloadButton clicked");
    // To reach the content script you must use chrome.tabs.sendMessage(tabId, …).
    // sendToActiveTab resolves the focused tab (works with the `activeTab` permission).
    disableButton();
    const response = await sendToActiveTab({ action: "parsePage" });
    enableButton();
    if (response === undefined) {
      console.warn("No active tab id — cannot message content script.");
    } else {
      console.log("response", response);
    }
  });
}
