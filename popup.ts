
import {getTodayDateTimeString} from './gettodaytime';
import axios from "axios";

let input = document.getElementById("input") as HTMLTextAreaElement;
let submit = document.getElementById("submit") as HTMLButtonElement;
let toggleView = document.getElementById("toggleView") as HTMLButtonElement;
let textView = document.getElementById("textView") as HTMLDivElement;
let listView = document.getElementById("listView") as HTMLDivElement;
let tabList = document.getElementById("tabList") as HTMLDivElement;

let toggle = document.getElementById("toggle") as HTMLInputElement;
let left = document.getElementById("left") as HTMLInputElement;
let right = document.getElementById("right")as HTMLInputElement;
let selectedtabs = document.getElementById("selected")as HTMLInputElement;
let allwindows = document.getElementById("allwindows") as HTMLInputElement;

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
   }else if (mode === "allwindows") {
     // Get all tabs across all windows
     chrome.tabs.query({}, function(tabs) {
       console.log(tabs)
       // Group tabs by windowId
       const tabsByWindow: { [key: number]: any[] } = {};
       tabs.forEach(tab => {
         if (!tabsByWindow[tab.windowId]) {
           tabsByWindow[tab.windowId] = [];
         }
         tabsByWindow[tab.windowId].push(tab);
       });
       // For each window, add to textarea
       for (const windowId in tabsByWindow) {
         input.value += `Window: Window ${windowId}\n`;
         tabsByWindow[windowId].forEach(tab => {
           input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n";
         });
         input.value += "\n";
       }
     });
   }
}

// Function to update the tab list view
function updateTabList() {
  tabList.innerHTML = "";
  const text = input.value.trim();
  if (!text) return;

  if (mode === "allwindows") {
    // Parse windows
    const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
    windowBlocks.forEach((block, windowIndex) => {
      const lines = block.split("\n");
      const windowLine = lines[0];
      const windowNameMatch = windowLine.match(/Window: (.+)/);
      const windowName = windowNameMatch ? windowNameMatch[1] : `Window ${windowIndex + 1}`;
      const tabLines = lines.slice(1).filter(line => line.startsWith("URL:") || line.startsWith("Title:"));

      const windowGroup = document.createElement("div");
      windowGroup.className = "window-group";

      const windowHeader = document.createElement("div");
      windowHeader.className = "window-header";
      windowHeader.innerHTML = `
        <span class="window-label">Window:</span>
        <input type="text" class="window-name-input" value="${windowName}" data-window-index="${windowIndex}">
      `;
      windowGroup.appendChild(windowHeader);

      for (let i = 0; i < tabLines.length; i += 2) {
        const urlLine = tabLines[i];
        const titleLine = tabLines[i + 1];
        if (urlLine && titleLine) {
          const url = urlLine.replace("URL: ", "");
          const title = titleLine.replace("Title: ", "");
          const tabItem = document.createElement("div");
          tabItem.className = "tab-item";
          tabItem.innerHTML = `
            <div class="tab-info">
              <div class="tab-title">${title}</div>
              <div class="tab-url">${url}</div>
            </div>
            <button class="delete-btn" data-window-index="${windowIndex}" data-tab-index="${i / 2}">Delete</button>
          `;
          windowGroup.appendChild(tabItem);
        }
      }

      tabList.appendChild(windowGroup);
    });
  } else {
    // Original parsing for single window
    const entries = text.split("\n\n").filter(entry => entry.trim());
    entries.forEach((entry, index) => {
      const lines = entry.split("\n");
      const urlLine = lines.find(line => line.startsWith("URL: "));
      const titleLine = lines.find(line => line.startsWith("Title: "));
      const url = urlLine ? urlLine.replace("URL: ", "") : "";
      const title = titleLine ? titleLine.replace("Title: ", "") : "";

      const tabItem = document.createElement("div");
      tabItem.className = "tab-item";
      tabItem.innerHTML = `
        <div class="tab-info">
          <div class="tab-title">${title}</div>
          <div class="tab-url">${url}</div>
        </div>
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      tabList.appendChild(tabItem);
    });
  }

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function(this: HTMLElement) {
      if (mode === "allwindows") {
        const windowIndex = parseInt(this.dataset.windowIndex!);
        const tabIndex = parseInt(this.dataset.tabIndex!);
        deleteTabFromWindow(windowIndex, tabIndex);
      } else {
        const index = parseInt(this.dataset.index!);
        deleteTab(index);
      }
    });
  });

  // Add event listeners to window name inputs
  document.querySelectorAll(".window-name-input").forEach(input => {
    input.addEventListener("input", function(this: HTMLInputElement) {
      const windowIndex = parseInt(this.dataset.windowIndex!);
      updateWindowName(windowIndex, this.value);
    });
  });
}

// Function to delete a tab from the list
function deleteTab(index: number) {
  const text = input.value.trim();
  const entries = text.split("\n\n").filter(entry => entry.trim());
  entries.splice(index, 1);
  input.value = entries.join("\n\n");
  if (entries.length === 0) {
    input.value = "";
  }
  updateTabList();
}

// Function to delete a tab from a specific window
function deleteTabFromWindow(windowIndex: number, tabIndex: number) {
  const text = input.value.trim();
  const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
  if (windowBlocks[windowIndex]) {
    const lines = windowBlocks[windowIndex].split("\n");
    const header = lines[0];
    const tabLines = lines.slice(1).filter(line => line.startsWith("URL:") || line.startsWith("Title:"));
    // Remove the tab (2 lines: URL and Title)
    tabLines.splice(tabIndex * 2, 2);
    // Rebuild the block
    let newBlock = header + "\n";
    for (let i = 0; i < tabLines.length; i += 2) {
      if (tabLines[i] && tabLines[i + 1]) {
        newBlock += tabLines[i] + "\n" + tabLines[i + 1] + "\n";
      }
    }
    newBlock = newBlock.trim();
    if (tabLines.length === 0) {
      // Remove the window block if no tabs left
      windowBlocks.splice(windowIndex, 1);
    } else {
      windowBlocks[windowIndex] = newBlock;
    }
    input.value = windowBlocks.join("\n\n");
    if (input.value && windowBlocks.length > 0) input.value += "\n\n";
    updateTabList();
  }
}

// Function to update window name
function updateWindowName(windowIndex: number, newName: string) {
  const text = input.value.trim();
  const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
  if (windowBlocks[windowIndex]) {
    const lines = windowBlocks[windowIndex].split("\n");
    lines[0] = `Window: ${newName}`;
    windowBlocks[windowIndex] = lines.join("\n");
    input.value = windowBlocks.join("\n\n");
    if (input.value) input.value += "\n\n";
  }
}

// Toggle view functionality
let isListView = false;
toggleView.addEventListener("click", function() {
  isListView = !isListView;
  if (isListView) {
    textView.style.display = "none";
    listView.style.display = "block";
    toggleView.textContent = "View as Text";
    updateTabList();
  } else {
    listView.style.display = "none";
    textView.style.display = "block";
    toggleView.textContent = "View as List";
  }
});

// Call the function to initialize the textarea value
updateTextarea();
if (isListView) {
  updateTabList();
}

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
  if (isListView) {
    updateTabList();
  }
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
  if (isListView) {
    updateTabList();
  }
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
  if (isListView) {
    updateTabList();
  }
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
  if (isListView) {
    updateTabList();
  }
});

// Add a change event listener to the checkbox
allwindows.addEventListener("change", function() {
  // Check the checkbox state
  if (allwindows.checked) {
    // Change the mode to "allwindows"
    mode = "allwindows";
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea();
  if (isListView) {
    updateTabList();
  }
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