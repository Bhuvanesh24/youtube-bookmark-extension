chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {

    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const videoId = urlParameters.get("v");
    console.log("UrlParams", urlParameters);

    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: videoId,
      });
    }, 7000);
  }
});
