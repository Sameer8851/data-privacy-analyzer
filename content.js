
// Get all script tags in the current webpage
const allScripts = Array.from(document.scripts).map(script => script.src).filter(src=>src);

// Get all cookies
const cookies = document.cookie;

//Send this data to the background script
chrome.runtime.sendMessage({
    type: "SITE_DATA",
    payload: {
        cookies: cookies,
        scripts: allScripts
    }
})