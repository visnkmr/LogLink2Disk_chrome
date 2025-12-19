// This is the background script that runs in the background of the extension
// It listens for a browser action click and opens a new tab with popup.html
// console.log("hello")

declare const browser: any;

// Handle extension icon click - open new tab with popup
chrome.action?.onClicked?.addListener((tab) => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
});

// Firefox compatibility
if (typeof browser !== 'undefined' && browser.browserAction) {
    browser.browserAction.onClicked.addListener((tab: any) => {
        browser.tabs.create({ url: browser.runtime.getURL('popup.html') });
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        fetch('http://127.0.0.1:6956/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: changeInfo.url,title:changeInfo.title })
        }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        }).then(data => {
        console.log('Success:', data);
        }).catch(error => {
        console.error('Error:', error);
        });
    }
   });