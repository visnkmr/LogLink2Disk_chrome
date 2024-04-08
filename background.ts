// This is the background script that runs in the background of the extension
// It listens for a browser action click and sends a message to the content script
// console.log("hello")

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