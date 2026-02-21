chrome.action.onClicked.addListener(async (tab) => {
  // alert('click')
  // throw new Error();
  if (tab.id === undefined) return;

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: "azaza",
  });

  // Получаем активную вкладку
  // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Отправляем сообщение в content script
  console.log("sending message");
  chrome.tabs.sendMessage(tab.id, { action: "parsePage" }, (response: unknown) => {
    if (response && typeof response === "object" && "data" in response) {
      console.log("Получены данные:", (response as { data: unknown }).data);
      // renderTable(response.data);
    } else {
      console.error(
        "Не удалось получить данные. Возможно, content script не загружен."
      );
    }
  });

  // if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
  //   // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
  //   const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  //   // Next state will always be the opposite
  //   const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  //   // Set the action badge to the next state
  //   await chrome.action.setBadgeText({
  //     tabId: tab.id,
  //     text: nextState,
  //   });
  // }
});

// В background.js
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  console.log("request");
  console.log(request);
  if (request.action === "downloadCSV") {
    const data = request.data as string[][];
    const csvContent = data
      .map((row: string[]) =>
        row.map((item: string) => `"${String(item).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    // 2. Используем chrome.downloads API без createObjectURL
    chrome.downloads.download({
      url: "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent),
      filename: request.filename,
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
