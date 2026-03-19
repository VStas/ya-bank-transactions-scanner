const downloadButton = document.getElementById("downloadCSV");

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "downloadCSV",
    });
  });
}
