import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const Popup: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState('active');
  const [view, setView] = useState<'text' | 'list'>('text');
  const [data, setData] = useState('');
  const [folder, setFolder] = useState('');
  const [url, setUrl] = useState('try');
  const [exportFormat, setExportFormat] = useState('text');
  const [windowTabs, setWindowTabs] = useState<{id: number, name: string, tabs: chrome.tabs.Tab[]}[]>([]);
  const [selectedWindow, setSelectedWindow] = useState(0);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

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

  const handleSave = () => {
    // Save logic - similar to original
    console.log('Save:', data, folder, url);
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 flex flex-col gap-4 dark:from-gray-100 dark:to-gray-200 dark:text-gray-900 ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-200 rounded-lg shadow-lg p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">🚀 LogLink2Disk</h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="bg-gray-700 dark:bg-gray-300 rounded-full p-2 hover:scale-105 transition"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Tab Selection */}
      <div className="bg-gray-800 dark:bg-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'active', label: '📌 Active Tab' },
            { key: 'all', label: '📋 All Tabs' },
            { key: 'left', label: '⬅️ Left Tabs' },
            { key: 'right', label: '➡️ Right Tabs' },
            { key: 'selected', label: '✅ Selected Tabs' },
            { key: 'allwindows', label: '🖼️ All Windows' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`bg-gray-700 dark:bg-gray-300 border border-gray-600 dark:border-gray-400 rounded px-3 py-2 hover:bg-green-500 transition ${
                mode === opt.key ? 'bg-green-500' : ''
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-gray-800 dark:bg-gray-200 rounded-lg shadow-lg p-4 flex-1 flex flex-col gap-4">
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
            className="w-full h-48 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 rounded p-2 text-gray-300 dark:text-gray-800 font-mono"
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
                    className={`flex items-center gap-2 px-3 py-2 rounded bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 cursor-pointer whitespace-nowrap ${i === selectedWindow ? 'bg-green-500' : ''}`}
                  >
                    <span>{win.name}</span>
                    <span className="cursor-pointer text-red-500">×</span>
                  </div>
                ))}
              </div>
            )}
            <div className="max-h-64 overflow-y-auto border border-gray-600 dark:border-gray-400 rounded bg-gray-900 dark:bg-gray-100 p-2">
              {mode === 'allwindows' ? (
                windowTabs[selectedWindow]?.tabs.map((tab, i) => (
                  <div key={tab.id} className="flex justify-between items-center p-2 border-b border-gray-700 dark:border-gray-300">
                    <div>
                      <div className="font-semibold">{tab.title}</div>
                      <div className="text-sm text-gray-400 dark:text-gray-600">{tab.url}</div>
                    </div>
                    <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </div>
                ))
              ) : (
                data.split('\n\n').filter(entry => entry.trim()).map((entry, i) => {
                  const lines = entry.split('\n');
                  const url = lines[0]?.replace('URL: ', '');
                  const title = lines[1]?.replace('Title: ', '');
                  return (
                    <div key={i} className="flex justify-between items-center p-2 border-b border-gray-700 dark:border-gray-300">
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-sm text-gray-400 dark:text-gray-600">{url}</div>
                      </div>
                      <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 dark:bg-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Session Name"
            className="flex-1 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 rounded px-3 py-2 text-white dark:text-gray-900"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Username"
            className="flex-1 bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 rounded px-3 py-2 text-white dark:text-gray-900"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-400 rounded px-3 py-2 text-white dark:text-gray-900"
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