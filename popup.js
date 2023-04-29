import { getTodayDateTimeString } from './gettodaytime';
let input = document.getElementById("input");
let submit = document.getElementById("submit");
let toggle = document.getElementById("toggle");
let left = document.getElementById("left");
let right = document.getElementById("right");
let selectedtabs = document.getElementById("selected");
let browser = document.getElementById("browser");
let time = document.getElementById("time");
let serverurl = document.getElementById("url");
let saved = document.getElementById("saved");
let folder = document.getElementById("folder");
let mode = "active";
function updateTextarea() {
    if (mode === "active") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let tab = tabs[0];
            input.value = "URL: " + tab.url + "\nTitle: " + tab.title;
        });
    }
    else if (mode === "all") {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            console.log(tabs);
            for (let tab of tabs) {
                input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
        });
    }
    else if (mode === "left") {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            console.log(tabs);
            for (let tab of tabs) {
                if (tab.active == true)
                    break;
                input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
        });
    }
    else if (mode === "right") {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            console.log(tabs);
            let dshow = false;
            for (let tab of tabs) {
                if (tab.active == true)
                    dshow = true;
                if (dshow && !tab.active)
                    input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
        });
    }
    else if (mode === "selected") {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            console.log(tabs);
            for (let tab of tabs) {
                if (tab.selected)
                    input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
        });
    }
}
updateTextarea();
toggle.addEventListener("change", function () {
    if (toggle.checked) {
        mode = "all";
    }
    else {
        mode = "active";
    }
    updateTextarea();
});
left.addEventListener("change", function () {
    if (left.checked) {
        mode = "left";
    }
    else {
        mode = "active";
    }
    updateTextarea();
});
time.addEventListener("change", function () {
    if (time.checked) {
        folder.innerHTML = getTodayDateTimeString();
    }
    else {
        folder.innerHTML = "";
    }
});
folder.innerHTML = getTodayDateTimeString();
browser.addEventListener("change", function () {
    if (browser.checked) {
        folder.innerHTML = "chrome";
    }
    else {
        folder.innerHTML = "";
    }
});
right.addEventListener("change", function () {
    if (right.checked) {
        mode = "right";
    }
    else {
        mode = "active";
    }
    updateTextarea();
});
selectedtabs.addEventListener("change", function () {
    if (selectedtabs.checked) {
        mode = "selected";
    }
    else {
        mode = "active";
    }
    updateTextarea();
});
submit.addEventListener("click", function () {
    let text = input.value;
    let url = text.split("\n")[0].split(": ")[1];
    let title = text.split("\n")[1].split(": ")[1];
    let surl = serverurl.value;
    let foldername = folder.value;
    if (mode === "active") {
        fetch(surl, {
            method: 'PUT',
            body: JSON.stringify({ url: url, title: title, folder: foldername }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        })
            .then(response => {
            saved.value = "\nsaved:\t" + title.substring(0, 30);
            response.json();
        })
            .then(data => {
            console.log(data);
        })
            .catch(error => {
            console.error(error);
        });
    }
    else if (mode === "all") {
        saved.value = "";
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            for (let tab of tabs) {
                fetch(surl, {
                    method: 'PUT',
                    body: JSON.stringify({ url: tab.url, title: tab.title, folder: foldername }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    }
                })
                    .then(response => {
                    saved.value += "\nsaved:\t" + tab.title.substring(0, 30);
                    response.json();
                })
                    .then(data => {
                    console.log(data);
                })
                    .catch(error => {
                    console.error(error);
                });
                input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
        });
    }
});
