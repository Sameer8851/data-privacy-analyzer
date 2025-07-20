// this variable will store the site data temporarily
let siteData = null;

// listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SITE_DATA") {
    siteData = message.payload;
  }
  // if message is from popup.js asking for data
  if (message.type === "GET_SITE_DATA") {
    sendResponse(siteData || { cookies: "", scripts: [] });
  }
  return true;
});


