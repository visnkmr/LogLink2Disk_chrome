"use strict";
chrome.action.onClicked.addListener(function (tab) {
    fetch('http://127.0.0.1:8080', {
        method: 'PUT',
        body: JSON.stringify({ url: tab.url, title: tab.title }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    });
});
