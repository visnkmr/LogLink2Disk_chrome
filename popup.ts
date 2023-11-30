
import {getTodayDateTimeString} from './gettodaytime';
import axios from "axios";

let input = document.getElementById("input") as HTMLInputElement;
let submit = document.getElementById("submit") as HTMLButtonElement;

let toggle = document.getElementById("toggle") as HTMLInputElement;
let left = document.getElementById("left") as HTMLInputElement;
let right = document.getElementById("right")as HTMLInputElement;
let selectedtabs = document.getElementById("selected")as HTMLInputElement;

let browser = document.getElementById("browser")as HTMLInputElement;
let time = document.getElementById("time")as HTMLInputElement;


let serverurl = document.getElementById("url") as HTMLTextAreaElement;
let saved = document.getElementById("saved") as HTMLTextAreaElement;
let folder = document.getElementById("folder") as HTMLTextAreaElement;

// Declare a variable to store the current mode
let mode = "active"; // Possible values are "active" or "all"
// let mode_location = "none"; // Possible values are "active" or "all"
// let mode_right = "none"; // Possible values are "active" or "all"

// Define a function to update the textarea value based on the mode
function updateTextarea() {
  input.value=""
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
        if(tab.highlighted)
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
  console.log("clicked")
  // Get the textarea value
  let text = input.value;

  // Parse the text to get the URL and title
  let url = text.split("\n")[0].split(": ")[1];
  let title = text.split("\n")[1].split(": ")[1];
  let surl=serverurl.value;
  let foldername=folder.value;
  let listtosave={}
  // saved.value+="saved"+text;
  if (mode === "active") {
    listtosave={
      sessionname:foldername,
      browsername:"chromium based",
      tablist:[
        {
          title:title,
          url:url
        }
      ]
    }
    submittodb(surl,listtosave);
    
    }else if (mode === "all") {
     
        saved.value=""
        
        let tabstosave:Array<object>=[];
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            // Loop over the tabs array
            
            for (let tab of tabs) {
                tabstosave.push(
                  {
                    title:tab.title,
                    url:tab.url
                  }
                )
                
              // Append the tab URL and title to the textarea value
              // input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            }
            listtosave={
              sessionname:foldername,
              browsername:"chromium based",
              tablist:tabstosave
            }
            submittodb(surl,listtosave);
            // console.log("fromhere--->\n"+JSON.stringify(listtosave))
            // fetch('https://listallfrompscale.vercel.app/api/update', {
            //         method: 'POST',
            //         body: `uid=${surl}&datatoadd=${JSON.stringify(listtosave)}`,
            //         headers: {
            //           'Content-Type': 'application/x-www-form-urlencoded'
            //         }
            //     })
            //     .then(response => {
            //         saved.value+="\nsaved tabs";
            //         // saved.value+="\nsaved:\t"+tab.title!.substring(0,30);
            //         response.json()
            //       }
            //     )
            //     .then(data => {
            //         // Do something with the response data
            //         console.log(data);
            //     })
            //     .catch(error => {
            //         // Handle any errors
            //         console.error(error);
            //     });
          });
    }else if (mode === "left") {
      let tabstosave:Array<object>=[];

      // Get all tabs in the current window
      chrome.tabs.query({currentWindow: true}, function(tabs) {
        console.log(tabs)
        // Loop over the tabs array
        for (let tab of tabs) {
          // Append the tab URL and title to the textarea value
          if(tab.active==true )
          break
          tabstosave.push(
            {
              title:tab.title,
              url:tab.url
            }
          )
          // input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
          
        }
        listtosave={
          sessionname:foldername,
          browsername:"chromium based",
          tablist:tabstosave
        }
        submittodb(surl,listtosave);
      });
    }else if (mode === "right") {
      let tabstosave:Array<object>=[];
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
            // input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
            tabstosave.push(
              {
                title:tab.title,
                url:tab.url
              }
            )
        }
        listtosave={
          sessionname:foldername,
          browsername:"chromium based",
          tablist:tabstosave
        }
        submittodb(surl,listtosave);
      });
    }else if (mode === "selected") {
      let tabstosave:Array<object>=[];
      // Get all tabs in the current window
      chrome.tabs.query({currentWindow: true}, function(tabs) {
        console.log(tabs)
        // Loop over the tabs array
        for (let tab of tabs) {
          // Append the tab URL and title to the textarea value
          if(tab.highlighted){
            tabstosave.push(
              {
                title:tab.title,
                url:tab.url
              }
            )
          }
            // input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
        }
        listtosave={
          sessionname:foldername,
          browsername:"chromium based",
          tablist:tabstosave
        }
        submittodb(surl,listtosave);
      });
    }
    // Send the request with the URL and title as the body
    

});

function submittodb(surl:string,listtosave:object){
  console.log("whenhere:\n"+JSON.stringify(listtosave))
  const encodedParams = new URLSearchParams();

encodedParams.set('uid', surl);
encodedParams.set('datatoadd', JSON.stringify(listtosave));
console.log(encodedParams)
  fetch('https://listallfrompscale.vercel.app/api/update', {
    method: 'POST',
    body: encodedParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
})
.then(response => {
  console.log(response.json())
      saved.value="\nsaved selected tab(s)\t";
      // +title.substring(0,30);
      // response.json()
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
}