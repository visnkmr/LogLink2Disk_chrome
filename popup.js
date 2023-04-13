// Get the textarea, button, and checkbox elements
let input = document.getElementById("input");
let submit = document.getElementById("submit");
let toggle = document.getElementById("toggle");

// Declare a variable to store the current mode
let mode = "active"; // Possible values are "active" or "all"

// Define a function to update the textarea value based on the mode
function updateTextarea() {
  // Clear the textarea value
  input.value = "";

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
      // Loop over the tabs array
      for (let tab of tabs) {
        // Append the tab URL and title to the textarea value
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

// Add a click event listener to the button
submit.addEventListener("click", function() {
  // Get the textarea value
  let text = input.value;

  // Parse the text to get the URL and title
  let url = text.split("\n")[0].split(": ")[1];
  let title = text.split("\n")[1].split(": ")[1];
  if (mode === "active") {
    // Send the request with the URL and title as the body
    fetch('http://127.0.0.1:8080', {
        method: 'PUT',
        body: JSON.stringify({url: url, title: title}),
        headers: {
        'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Do something with the response data
        console.log(data);
    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });
    }else if (mode === "all") {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            // Loop over the tabs array
            for (let tab of tabs) {
                fetch('http://127.0.0.1:8080', {
                    method: 'PUT',
                    body: JSON.stringify({url: tab.url, title: tab.title}),
                    headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                    }
                })
                .then(response => response.json())
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