// Get the textarea, button, and checkbox elements
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

// Declare a variable to store the current mode
let mode = "active"; // Possible values are "active" or "all"
// let mode_location = "none"; // Possible values are "active" or "all"
// let mode_right = "none"; // Possible values are "active" or "all"

// Define a function that returns today's date and time as a string
function getTodayDateTimeString() {
// Create a new Date object with the current date and time
let today = new Date();
// Get the year, month, day, hour, minute and second from the Date object
let year = today.getFullYear();
let month = today.getMonth() + 1; // Months are zero-based
let day = today.getDate();
let hour = today.getHours();
let minute = today.getMinutes();
let second = today.getSeconds();
// Pad the month, day, hour, minute and second with leading zeros if needed
month = month < 10 ? "0" + month : month;
day = day < 10 ? "0" + day : day;
hour = hour < 10 ? "0" + hour : hour;
minute = minute < 10 ? "0" + minute : minute;
second = second < 10 ? "0" + second : second;
// Return the date and time as a string in the format yyyy-mm-dd_hh-mm-ss
return year + "-" + month + "-" + day + "_" + hour + "-" + minute + "-" + second;
}
// Define a function to update the textarea value based on the mode
function updateTextarea() {

// Call the function and print the result
// console.log(getTodayDateTimeString());



  // Check the mode
  if (mode === "active") {
    // Get the active tab in the current window
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Get the first tab object in the array
      let tab = tabs[0];

      // Set the textarea value to the tab URL and title
      input.value = "URL: " + tab.url + "\nTitle: " + tab.title;
    });
  } else if (mode === "all") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log(tabs)
      // Loop over the tabs array
      for (let tab of tabs) {
        // Append the tab URL and title to the textarea value
        input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
      }
    });
  }else if (mode === "left") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log(tabs)
      // Loop over the tabs array
      for (let tab of tabs) {
        // Append the tab URL and title to the textarea value
        if(tab.active==true )
        break
        input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
        
      }
    });
  }else if (mode === "right") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log(tabs)
      let dshow=false
      // Loop over the tabs array
      for (let tab of tabs) {
        if(tab.active==true)
          dshow=true
        // Append the tab URL and title to the textarea value
        if(dshow && !tab.active)
          input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
      }
    });
  }else if (mode === "selected") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log(tabs)
      // Loop over the tabs array
      for (let tab of tabs) {
        // Append the tab URL and title to the textarea value
        if(tab.selected)
          input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
      }
    });
  }
}

// Call the function to initialize the textarea value
updateTextarea();

// Add a change event listener to the checkbox
toggle.addEventListener("change", function() {
  // Check the checkbox state
  if (toggle.checked) {
    // Change the mode to "all"
    mode = "all";
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea();
});

// Add a change event listener to the checkbox
left.addEventListener("change", function() {
  // Check the checkbox state
  if (left.checked) {
    // Change the mode to "all"
    mode = "left";
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea();
});

// Add a change event listener to the checkbox
time.addEventListener("change", function() {
  // Check the checkbox state
  if (time.checked) {
    // Change the mode to "all"
    folder.innerHTML=getTodayDateTimeString();
  } else {
    // Change the mode to "active"
    folder.innerHTML="";
  }

  // Update the textarea value
  // updateTextarea();
});
folder.innerHTML=getTodayDateTimeString();
// Add a change event listener to the checkbox
browser.addEventListener("change", function() {
  // Check the checkbox state
  if (browser.checked) {
    // Change the mode to "all"
    folder.innerHTML="chrome";
  } else {
    // Change the mode to "active"
    folder.innerHTML="";
  }

  // Update the textarea value
  // updateTextarea();
});

// Add a change event listener to the checkbox
right.addEventListener("change", function() {
  // Check the checkbox state
  if (right.checked) {
    // Change the mode to "all"
    mode = "right";
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea();
});

// Add a change event listener to the checkbox
selectedtabs.addEventListener("change", function() {
  // Check the checkbox state
  if (selectedtabs.checked) {
    // Change the mode to "all"
    mode = "selected";
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea();
});

// Add a click event listener to the button
submit.addEventListener("click", function() {
  
  // Get the textarea value
  let text = input.value;

  // Parse the text to get the URL and title
  let url = text.split("\n")[0].split(": ")[1];
  let title = text.split("\n")[1].split(": ")[1];
  let surl=serverurl.value;
  let foldername=folder.value;
  // saved.value+="saved"+text;
  if (mode === "active") {
    // Send the request with the URL and title as the body
    fetch(surl, {
        method: 'PUT',
        body: JSON.stringify({url: url, title: title, folder:foldername}),
        headers: {
        'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
          saved.value="\nsaved:\t"+title.substring(0,30);
          response.json()
        }
      )
    .then(data => {
        // Do something with the response data
        console.log(data);
    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });
    }else if (mode === "all") {
     
        saved.value=""
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            // Loop over the tabs array
            
            for (let tab of tabs) {
              
                fetch(surl, {
                    method: 'PUT',
                    body: JSON.stringify({url: tab.url, title: tab.title, folder:foldername}),
                    headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                    }
                })
                .then(response => {
                    saved.value+="\nsaved:\t"+tab.title.substring(0,30);
                    response.json()
                  }
                )
                .then(data => {
                    // Do something with the response data
                    console.log(data);
                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                });
              // Append the tab URL and title to the textarea value
              input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
          });
    }

});