import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { getTodayDateTimeString } from '../gettodaytime';

const Popup: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState('active');
  const [view, setView] = useState<'text' | 'list'>('text');
  const [data, setData] = useState('');
  const [folder, setFolder] = useState(getTodayDateTimeString());
  const [url, setUrl] = useState('try');
  const [exportFormat, setExportFormat] = useState('text');
  const [windowTabs, setWindowTabs] = useState<{id: number, name: string, tabs: chrome.tabs.Tab[]}[]>([]);
  const [selectedWindow, setSelectedWindow] = useState(0);
  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [useChromeBrowser, setUseChromeBrowser] = useState(false);

  const deleteTab = (index: number) => {
    const text = data.trim();
    const entries = text.split('\n\n').filter(entry => entry.trim());
    entries.splice(index, 1);
    const newData = entries.length > 0 ? entries.join('\n\n') : '';
    setData(newData);
  };

  const deleteTabFromWindow = (windowIndex: number, tabIndex: number) => {
    if (windowTabs[windowIndex]) {
      const updatedWindowTabs = [...windowTabs];
      updatedWindowTabs[windowIndex].tabs.splice(tabIndex, 1);
      setWindowTabs(updatedWindowTabs);

      // Update the data string as well
      const text = data.trim();
      const windowBlocks = text.split('\n\n').filter(block => block.trim() && block.includes('Window:'));
      if (windowBlocks[windowIndex]) {
        const lines = windowBlocks[windowIndex].split('\n');
        const header = lines[0];
        const tabLines = lines.slice(1).filter(line => line.startsWith('URL:') || line.startsWith('Title:'));
        tabLines.splice(tabIndex * 2, 2); // Remove URL and Title lines
        let newBlock = header;
        if (tabLines.length > 0) {
          newBlock += '\n' + tabLines.join('\n');
        }
        windowBlocks[windowIndex] = newBlock;
        const newData = windowBlocks.join('\n\n');
        setData(newData);
      }
    }
  };

  const deleteWindow = (windowIndex: number) => {
    const updatedWindowTabs = [...windowTabs];
    updatedWindowTabs.splice(windowIndex, 1);
    setWindowTabs(updatedWindowTabs);

    // Update data string
    const text = data.trim();
    const windowBlocks = text.split('\n\n').filter(block => block.trim() && block.includes('Window:'));
    windowBlocks.splice(windowIndex, 1);
    const newData = windowBlocks.join('\n\n');
    setData(newData);

    // Adjust selectedWindow if necessary
    if (selectedWindow >= windowIndex && selectedWindow > 0) {
      setSelectedWindow(selectedWindow - 1);
    } else if (updatedWindowTabs.length === 0) {
      setSelectedWindow(0);
    }
  };

  const selectWindow = (windowIndex: number) => {
    setSelectedWindow(windowIndex);
  };



  // Folder name logic
  useEffect(() => {
    let newFolder = '';
    if (useCurrentTime) {
      newFolder = getTodayDateTimeString();
    } else if (useChromeBrowser) {
      newFolder = 'chrome';
    }
    setFolder(newFolder);
  }, [useCurrentTime, useChromeBrowser]);

  // Fetch data on mode change
  useEffect(() => {
    const fetchData = async () => {
      let tabs: chrome.tabs.Tab[] = [];
      if (mode === 'active') {
        tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      } else if (mode === 'all') {
        tabs = await chrome.tabs.query({ currentWindow: true });
      } else if (mode === 'left') {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        const activeIndex = allTabs.findIndex(t => t.active);
        tabs = allTabs.slice(0, activeIndex);
      } else if (mode === 'right') {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        const activeIndex = allTabs.findIndex(t => t.active);
        tabs = allTabs.slice(activeIndex + 1);
      } else if (mode === 'selected') {
        tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
      } else if (mode === 'allwindows') {
        tabs = await chrome.tabs.query({});
        const grouped = tabs.reduce((acc, tab) => {
          const wid = tab.windowId!;
          if (!acc[wid]) acc[wid] = [];
          acc[wid].push(tab);
          return acc;
        }, {} as Record<number, chrome.tabs.Tab[]>);
        const windowList = Object.entries(grouped).map(([id, tabs]) => ({
          id: parseInt(id),
          name: `Window ${id}`,
          tabs
        }));
        setWindowTabs(windowList);
        setSelectedWindow(0);
        // Format data with window separators
        const formatted = Object.entries(grouped).map(([windowId, windowTabs]) => {
          const windowHeader = `Window: Window ${windowId}`;
          const tabLines = windowTabs.map(tab => `URL: ${tab.url}\nTitle: ${tab.title}`).join('\n');
          return `${windowHeader}\n${tabLines}`;
        }).join('\n\n');
        setData(formatted);
        return;
      }
      const formatted = tabs.map(t => `URL: ${t.url}\nTitle: ${t.title}`).join('\n\n');
      setData(formatted);
    };
    fetchData();
  }, [mode]);

  const updateTextarea = () => {
    // Similar logic as before, but using state
    // For simplicity, simulate
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setData(`URL: ${tabs[0].url}\nTitle: ${tabs[0].title}`);
    });
  };

  const handleExport = () => {
    let content = '';
    let mime = '';
    let filename = `tabs.${exportFormat}`;
    switch(exportFormat) {
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
        return;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      let tabs: chrome.tabs.Tab[] = [];
      if (mode === 'active') {
        tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      } else if (mode === 'all') {
        tabs = await chrome.tabs.query({ currentWindow: true });
      } else if (mode === 'left') {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        const activeIndex = allTabs.findIndex(t => t.active);
        tabs = allTabs.slice(0, activeIndex);
      } else if (mode === 'right') {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        const activeIndex = allTabs.findIndex(t => t.active);
        tabs = allTabs.slice(activeIndex + 1);
      } else if (mode === 'selected') {
        tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
      } else if (mode === 'allwindows') {
        tabs = await chrome.tabs.query({});
      }

      const tablist = tabs.map(tab => ({
        title: tab.title || '',
        url: tab.url || ''
      }));

      const dataToSend = {
        sessionname: folder,
        browsername: "chromium based",
        tablist
      };

      const encodedParams = new URLSearchParams();
      encodedParams.set('uid', url);
      encodedParams.set('datatoadd', JSON.stringify(dataToSend));

      const response = await fetch('https://listallfrompscale.vercel.app/api/update', {
        method: 'POST',
        body: encodedParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.ok) {
        alert('Tabs saved successfully!');
      } else {
        alert('Failed to save tabs.');
      }
    } catch (error) {
      console.error('Error saving tabs:', error);
      alert('Error saving tabs.');
    }
  };

  const convertToCSV = (text: string): string => {
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
        i++;
      }
    }
    return csv;
  };

  const convertToMD = (text: string): string => {
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
        i++;
      }
    }
    return md;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">🚀 LogLink2Disk</h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 transition"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

       {/* Tab Selection */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
         <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tab Selection</h3>
         <div className="grid grid-cols-2 gap-4">
           {[
             { key: 'active', label: 'Active Tab', id: 'toggle' },
             { key: 'all', label: 'All Tabs', id: 'toggle' },
             { key: 'left', label: 'Left Tabs', id: 'left' },
             { key: 'right', label: 'Right Tabs', id: 'right' },
             { key: 'selected', label: 'Selected Tabs', id: 'selected' },
             { key: 'allwindows', label: 'All Windows', id: 'allwindows' },
           ].map((opt) => (
             <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
               <input
                 type="checkbox"
                 checked={mode === opt.key}
                 onChange={() => setMode(opt.key)}
                 className="w-4 h-4"
               />
               <span>{opt.label}</span>
             </label>
           ))}
         </div>
       </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex-1 flex flex-col gap-4">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setView('text')}
            className={`bg-gray-700 dark:bg-gray-300 rounded px-4 py-2 hover:bg-green-500 transition ${
              view === 'text' ? 'bg-green-500' : ''
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setView('list')}
            className={`bg-gray-700 dark:bg-gray-300 rounded px-4 py-2 hover:bg-green-500 transition ${
              view === 'list' ? 'bg-green-500' : ''
            }`}
          >
            📋 List
          </button>
        </div>

        {view === 'text' && (
          <textarea
            value={data}
            readOnly
            className="w-full h-48 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Tab data will appear here..."
          />
        )}

        {view === 'list' && (
          <div className="flex-1 flex flex-col gap-2">
            {mode === 'allwindows' && (
              <div className="flex gap-2 overflow-x-auto">
                {windowTabs.map((win, i) => (
                  <div
                    key={win.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer whitespace-nowrap ${
                      i === selectedWindow
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    }`}
                    onClick={() => selectWindow(i)}
                  >
                    <span>{win.name}</span>
                    <span
                      className="cursor-pointer text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWindow(i);
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 p-2">
              {mode === 'allwindows' ? (
                windowTabs[selectedWindow]?.tabs.map((tab, i) => (
                  <div key={tab.id} className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-600">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{tab.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{tab.url}</div>
                    </div>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                      onClick={() => deleteTabFromWindow(selectedWindow, i)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                data.split('\n\n').filter(entry => entry.trim()).map((entry, i) => {
                  const lines = entry.split('\n');
                  const url = lines[0]?.replace('URL: ', '');
                  const title = lines[1]?.replace('Title: ', '');
                  return (
                    <div key={i} className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-600">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{url}</div>
                      </div>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                        onClick={() => deleteTab(i)}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
         <div className="flex gap-4 mb-4">
           <div className="flex-1">
             <label className="block text-sm font-medium mb-2">Session Name:</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Session Name"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
              />
             <div className="flex gap-4 mt-2">
               <label className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={useCurrentTime}
                   onChange={(e) => setUseCurrentTime(e.target.checked)}
                 />
                 <span>Use Current Time</span>
               </label>
               <label className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={useChromeBrowser}
                   onChange={(e) => setUseChromeBrowser(e.target.checked)}
                 />
                 <span>Chrome Browser</span>
               </label>
             </div>
           </div>
           <div className="flex-1">
             <label className="block text-sm font-medium mb-2">Username:</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
              />
           </div>
         </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
            >
              <option value="text">📄 Text</option>
              <option value="csv">📊 CSV</option>
              <option value="md">📝 Markdown</option>
              <option value="pdf">📕 PDF</option>
            </select>
            <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 transition">
              ⬇️ Export
            </button>
          </div>
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white rounded px-6 py-2 transition">
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;