
import {getTodayDateTimeString} from './gettodaytime';
import axios from "axios";
import jsPDF from 'jspdf';

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
let themeToggle = document.getElementById("themeToggle") as HTMLButtonElement;
let exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
let exportFormat = document.getElementById("exportFormat") as HTMLSelectElement;

// Declare a variable to store the current mode
let mode = "active"; // Possible values are "active" or "all"
let activeWindowIndex = 0;

// Theme toggle
let isDark = false;
themeToggle.addEventListener("click", function() {
  isDark = !isDark;
  if (isDark) {
    document.documentElement.classList.add("dark");
    themeToggle.textContent = "Toggle Light";
  } else {
    document.documentElement.classList.remove("dark");
    themeToggle.textContent = "Toggle Dark";
  }
});

// Export functionality
exportBtn.addEventListener("click", () => {
  const format = exportFormat.value;
  const data = input.value;
  let content = '';
  let mime = '';
  let filename = `tabs.${format}`;
  switch(format) {
    case 'text':
      content = data;
      mime = 'text/plain';
      break;
    case 'csv':
      content = convertToCSV(data);
      mime = 'text/csv';
      break;
    case 'md':
      content = convertToMD(data);
      mime = 'text/markdown';
      break;
    case 'pdf':
      const doc = new jsPDF();
      const lines = data.split('\n');
      let y = 10;
      lines.forEach(line => {
        doc.text(line, 10, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });
      doc.save('tabs.pdf');
      return; // don't download blob
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// let mode_location = "none"; // Possible values are "active" or "all"
// let mode_right = "none"; // Possible values are "active" or "all"

// Define a function to update the textarea value based on the mode
function updateTextarea(callback?: () => void) {
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
      if (callback) callback();
    });
  } else if (mode === "all") {
    // Get all tabs in the current window
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      console.log(tabs)
      // Loop over the tabs array
      for (let tab of tabs) {
        // Append the tab URL and title to the textarea value
        input.value += "URL: " + tab.url + "\nTitle: " + tab.title + "\n\n";
        if (callback) callback();
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
      if (callback) callback();
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
        if (callback) callback();
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
          if (callback) callback();
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
        if (callback) callback();
     });
   }
}

// Function to update the tab list view
function updateTabList() {
  tabList.innerHTML = "";
  const text = input.value.trim();
  if (!text) return;

  const windowTabsDiv = document.getElementById("windowTabs") as HTMLDivElement;
  windowTabsDiv.innerHTML = "";

  // Event delegation for edit name
  windowTabsDiv.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('edit-icon')) {
      e.stopPropagation();
      const windowIndex = parseInt(target.dataset.windowIndex!);
      const span = target.previousElementSibling as HTMLElement;
      span.contentEditable = 'true';
      span.focus();
      const range = document.createRange();
      range.selectNodeContents(span);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      const blurHandler = () => {
        span.contentEditable = 'false';
        updateWindowName(windowIndex, span.textContent!);
        span.removeEventListener('blur', blurHandler);
      };
      span.addEventListener('blur', blurHandler);
    }
  });

  if (mode === "allwindows") {
    // Parse windows
    const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
    windowBlocks.forEach((block, windowIndex) => {
      const lines = block.split("\n");
      const windowLine = lines[0];
      const windowNameMatch = windowLine.match(/Window: (.+)/);
      const windowName = windowNameMatch ? windowNameMatch[1] : `Window ${windowIndex + 1}`;

      // Create window tab
      const windowTab = document.createElement("div");
      windowTab.className = "window-tab";
      if (windowIndex === activeWindowIndex) windowTab.classList.add("active");
      windowTab.innerHTML = `
        <span class="window-name">${windowName}</span>
        <span class="edit-icon" data-window-index="${windowIndex}">✎</span>
        <span class="close-x" data-window-index="${windowIndex}">×</span>
      `;
      windowTab.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).classList.contains("close-x") || (e.target as HTMLElement).classList.contains("edit-icon")) return;
        activeWindowIndex = windowIndex;
        updateTabList();
      });
      windowTabsDiv.appendChild(windowTab);
    });

    // Show content for active window
    if (windowBlocks[activeWindowIndex]) {
      const block = windowBlocks[activeWindowIndex];
      const lines = block.split("\n");
      const tabLines = lines.slice(1).filter(line => line.startsWith("URL:") || line.startsWith("Title:"));

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
              <div class="tab-title" contenteditable>${title}</div>
              <div class="tab-url">${url}</div>
            </div>
            <button class="delete-btn" data-window-index="${activeWindowIndex}" data-tab-index="${i / 2}">Delete</button>
          `;
          tabItem.querySelector('.tab-title')!.addEventListener('blur', function() {
            const tabIndex = parseInt((this.parentElement!.parentElement!.querySelector('.delete-btn') as HTMLElement).dataset.tabIndex!);
            updateTabTitle(activeWindowIndex, tabIndex, this.textContent!);
          });
          tabList.appendChild(tabItem);
        }
      }
    }
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
          <div class="tab-title" contenteditable>${title}</div>
          <div class="tab-url">${url}</div>
        </div>
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      tabItem.querySelector('.tab-title')!.addEventListener('blur', function() {
        updateSingleTabTitle(index, this.textContent!);
      });
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

  // Add event listeners to close x
  document.querySelectorAll(".close-x").forEach(x => {
    x.addEventListener("click", function(this: HTMLElement) {
      const windowIndex = parseInt(this.dataset.windowIndex!);
      deleteWindow(windowIndex);
      if (activeWindowIndex >= windowIndex && activeWindowIndex > 0) activeWindowIndex--;
      updateTabList();
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
    if (isListView) updateTabList(); // Refresh display
  }
}

// Function to update tab title
function updateTabTitle(windowIndex: number, tabIndex: number, newTitle: string) {
  const text = input.value.trim();
  const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
  if (windowBlocks[windowIndex]) {
    const lines = windowBlocks[windowIndex].split("\n");
    const tabLines = lines.slice(1).filter(line => line.startsWith("URL:") || line.startsWith("Title:"));
    if (tabLines[tabIndex * 2 + 1]) {
      tabLines[tabIndex * 2 + 1] = `Title: ${newTitle}`;
      // Rebuild
      let newBlock = lines[0] + "\n";
      for (let i = 0; i < tabLines.length; i++) {
        newBlock += tabLines[i] + "\n";
      }
      newBlock = newBlock.trim();
      windowBlocks[windowIndex] = newBlock;
      input.value = windowBlocks.join("\n\n");
      if (input.value) input.value += "\n\n";
      if (isListView) updateTabList(); // Refresh display
    }
  }
}

// Function to update single tab title
function updateSingleTabTitle(index: number, newTitle: string) {
  const text = input.value.trim();
  const entries = text.split("\n\n").filter(entry => entry.trim());
  if (entries[index]) {
    const lines = entries[index].split("\n");
    const titleLineIndex = lines.findIndex(line => line.startsWith("Title: "));
    if (titleLineIndex !== -1) {
      lines[titleLineIndex] = `Title: ${newTitle}`;
      entries[index] = lines.join("\n");
      input.value = entries.join("\n\n");
      if (isListView) updateTabList(); // Refresh display
    }
  }
}

// Function to delete a window
function deleteWindow(windowIndex: number) {
  const text = input.value.trim();
  const windowBlocks = text.split("\n\n").filter(block => block.trim() && block.includes("Window"));
  if (windowBlocks[windowIndex]) {
    windowBlocks.splice(windowIndex, 1);
    input.value = windowBlocks.join("\n\n");
    if (windowBlocks.length === 0) {
      input.value = "";
      activeWindowIndex = 0;
    } else if (activeWindowIndex >= windowIndex) {
      activeWindowIndex = Math.max(0, activeWindowIndex - 1);
    }
    updateTabList();
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
  updateTextarea(() => {
    if (isListView) {
      updateTabList();
    }
  });
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
  updateTextarea(() => {
    if (isListView) {
      updateTabList();
    }
  });
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
  updateTextarea(() => {
    if (isListView) {
      updateTabList();
    }
  });
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
  updateTextarea(() => {
    if (isListView) {
      updateTabList();
    }
  });
});

// Add a change event listener to the checkbox
allwindows.addEventListener("change", function() {
  // Check the checkbox state
  if (allwindows.checked) {
    // Change the mode to "allwindows"
    mode = "allwindows";
    activeWindowIndex = 0; // Reset to first window
  } else {
    // Change the mode to "active"
    mode = "active";
  }

  // Update the textarea value
  updateTextarea(() => {
    if (isListView) {
      updateTabList();
    }
  });
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

function convertToCSV(text: string): string {
  const lines = text.split('\n');
  let csv = 'Window,Title,URL\n';
  let currentWindow = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('Window: ')) {
      currentWindow = line.replace('Window: ', '').replace(/"/g, '""');
    } else if (line.startsWith('URL: ')) {
      const url = line.replace('URL: ', '').replace(/"/g, '""');
      const titleLine = lines[i + 1];
      const title = titleLine && titleLine.startsWith('Title: ') ? titleLine.replace('Title: ', '').replace(/"/g, '""') : '';
      csv += `"${currentWindow}","${title}","${url}"\n`;
      i++; // skip title line
    }
  }
  return csv;
}

function convertToMD(text: string): string {
  let md = '';
  const lines = text.split('\n');
  let currentWindow = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('Window: ')) {
      currentWindow = line.replace('Window: ', '');
      md += `## ${currentWindow}\n\n`;
    } else if (line.startsWith('URL: ')) {
      const url = line.replace('URL: ', '');
      const titleLine = lines[i + 1];
      const title = titleLine && titleLine.startsWith('Title: ') ? titleLine.replace('Title: ', '') : url;
      md += `- [${title}](${url})\n`;
      i++; // skip title line
    }
  }
  return md;
}