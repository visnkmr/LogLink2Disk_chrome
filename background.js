// This is the background script that runs in the background of the extension
// It listens for a browser action click and sends a message to the content script
console.log("hello")
chrome.action.onClicked.addListener(function(tab) {
  console.log(tab)
       
        fetch('http://127.0.0.1:8080', {
            method: 'PUT',
            body: JSON.stringify({url: tab.url, title: tab.title}),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        });
        // var request = new XMLHttpRequest();
        // request.open("PUT", 'http://localhost:8080/');
        // request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        // // request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // request.send(JSON.stringify({url: tab.url, title: tab.title}));
        // request.send("url="+tab.url+"&title="+tab.title);
    });

