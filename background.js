chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetch_odds" && request.url) {
    fetch(request.url)
      .then((response) => response.text())
      .then((html) => sendResponse({ data: html }))
      .catch((error) => sendResponse({ error: error.message }));

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
