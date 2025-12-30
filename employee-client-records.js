import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Table as TableIcon, 
  Download,
  AlertCircle,
  Database,
  Lock,
  LogOut,
  Info,
  HelpCircle,
  Settings,
  LayoutGrid,
  Maximize2,
  X,
  User,
  Plus,
  Edit2,
  Save,
  Trash2
} from 'lucide-react';

/**
 * GOOGLE SHEET CONFIGURATION
 */
const SHEET_ID = '1YbQ2XY99mrEOTL83RtMVw61LJBgPe_ihP6nYhEoBM9I';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
const IDENTITY_SESSION_COOKIE = 'arc_identity_session';

const hasIdentitySessionCookie = () => {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((part) => part.trim().startsWith(`${IDENTITY_SESSION_COOKIE}=`));
};

const setIdentitySessionCookie = () => {
  if (typeof document === 'undefined') return;
  const attributes = [
    `${IDENTITY_SESSION_COOKIE}=active`,
    'Path=/',
    'SameSite=Strict',
  ];
  if (window.location?.protocol === 'https:') {
    attributes.push('Secure');
  }
  document.cookie = attributes.join('; ');
};

const clearIdentitySessionCookie = () => {
  if (typeof document === 'undefined') return;
  const attributes = [
    `${IDENTITY_SESSION_COOKIE}=`,
    'Path=/',
    'SameSite=Strict',
    'Max-Age=0',
  ];
  if (window.location?.protocol === 'https:') {
    attributes.push('Secure');
  }
  document.cookie = attributes.join('; ');
};

const clearStoredSession = () => {
  try {
    localStorage.removeItem('arc_session');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('arc_customer_profile');
    localStorage.removeItem('arc_employee_profile');
  } catch {
    // Ignore storage cleanup failures.
  }
};

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [viewMode, setViewMode] = useState('gallery');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formValues, setFormValues] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchUrl = `${CSV_URL}&t=${Date.now()}`;
      const response = await fetch(fetchUrl);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to reach Google Sheets.`);
      
      const csvText = await response.text();
      if (csvText.trim().toLowerCase().startsWith('<!doctype html') || csvText.includes('google-signin')) {
        throw new Error('PRIVATE_SHEET');
      }

      const rows = parseCSV(csvText);
      if (rows.length === 0) throw new Error('The spreadsheet appears to be empty.');
      
      setData(rows);
      setLastUpdated(new Date().toLocaleTimeString());
      setShowSetup(false);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.message === 'Failed to fetch' || err.message === 'PRIVATE_SHEET') {
        setError('Connection Blocked: Your Google Sheet is currently private or restricted.');
        setShowSetup(true);
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.netlifyIdentity) return;

    const identity = window.netlifyIdentity;
    const handleInit = (user) => {
      if (user && !hasIdentitySessionCookie()) {
        identity.logout();
        return;
      }
      if (user) {
        setIdentitySessionCookie();
      } else {
        clearIdentitySessionCookie();
      }
    };

    const handleLogin = () => {
      setIdentitySessionCookie();
    };

    const handleLogoutEvent = () => {
      clearIdentitySessionCookie();
      clearStoredSession();
      window.location.href = '/index.html#home';
    };

    identity.on('init', handleInit);
    identity.on('login', handleLogin);
    identity.on('logout', handleLogoutEvent);
    identity.init();

    return () => {
      if (identity.off) {
        identity.off('init', handleInit);
        identity.off('login', handleLogin);
        identity.off('logout', handleLogoutEvent);
      }
    };
  }, []);

  const parseCSV = (csv) => {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } 
          else { inQuotes = !inQuotes; }
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else { cur += char; }
      }
      result.push(cur.trim());
      return result.map(v => v.replace(/^"|"$/g, ''));
    };

    const headers = parseLine(lines[0]);
    return lines.slice(1).map(line => {
      const values = parseLine(line);
      const row = {};
      headers.forEach((header, index) => { row[header] = values[index] || ''; });
      return row;
    });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => String(val).toLowerCase().includes(lowerSearch))
    );
  }, [data, searchTerm]);

  const tableHeaders = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setFormValues(record);
    setIsEditing(true);
  };

  const handleAddClick = () => {
    const emptyForm = {};
    tableHeaders.forEach(h => emptyForm[h] = '');
    setFormValues(emptyForm);
    setIsAdding(true);
  };

  const handleSave = () => {
    // In a real app with a backend, we would send a POST/PUT request here.
    // For now, we update local state to show the change.
    if (isAdding) {
      setData([formValues, ...data]);
    } else {
      setData(data.map(item => item === selectedRecord ? formValues : item));
    }
    
    setIsEditing(false);
    setIsAdding(false);
    setSelectedRecord(null);
    
    // Alert user that this is simulated
    console.log("Saving to Sheet simulated:", formValues);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + tableHeaders.join(",") + "\n"
      + filteredData.map(row => tableHeaders.map(h => `"${row[h]}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    if (window.netlifyIdentity) {
      window.netlifyIdentity.logout();
      return;
    }
    clearIdentitySessionCookie();
    clearStoredSession();
    window.location.href = '/index.html#home';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* Detail / Edit Modal */}
      {(selectedRecord || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setSelectedRecord(null); setIsEditing(false); setIsAdding(false); }}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 px-6 py-5 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  {isAdding ? <Plus className="w-5 h-5 text-white" /> : <Database className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-white font-bold text-lg">
                  {isAdding ? 'Add New Record' : isEditing ? 'Edit Record' : 'Record Details'}
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedRecord(null); setIsEditing(false); setIsAdding(false); }}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              {!isEditing && !isAdding ? (
                // VIEW MODE
                <div className="space-y-4">
                  {tableHeaders.map((header) => (
                    <div key={header} className="group border-b border-slate-100 pb-3 last:border-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        {header}
                      </label>
                      <p className="text-slate-700 font-medium break-words">
                        {selectedRecord[header] || <span className="text-slate-300 italic">No data</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                // EDIT / ADD MODE
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 mb-4 flex gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span><b>Note:</b> In this demo, changes are saved only in your browser. A backend script is needed to sync with Google Sheets.</span>
                  </div>
                  {tableHeaders.map((header) => (
                    <div key={header} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        {header}
                      </label>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                        value={formValues[header] || ''}
                        onChange={(e) => setFormValues({...formValues, [header]: e.target.value})}
                        placeholder={`Enter ${header}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {!isEditing && !isAdding ? (
                <>
                  <button 
                    onClick={() => { /* Simulation */ }}
                    className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button 
                    onClick={() => handleEditClick(selectedRecord)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Record
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsEditing(false); setIsAdding(false); if(isAdding) setSelectedRecord(null); }}
                    className="text-slate-500 text-sm font-bold hover:bg-slate-100 px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isAdding ? 'Add Record' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">Client Portal</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">v2.1 Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setViewMode('gallery')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowSetup(!showSetup)}
              className={`p-2 rounded-lg transition-all ${showSetup ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="ml-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Permission Guide */}
        {(showSetup || (error && error.includes('Connection Blocked'))) && (
          <div className="mb-8 bg-white border-2 border-indigo-100 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4" /> Setup Instructions
              </h3>
              <button onClick={() => setShowSetup(false)} className="text-indigo-200 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">Follow these steps to enable the database connection:</p>
                <div className="space-y-2">
                  {["Open Google Sheet", "Click 'Share' button", "Change to 'Anyone with the link'", "Set to 'Viewer'", "Refresh this page"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col justify-between">
                <p className="text-xs text-indigo-200/70 leading-relaxed mb-4">
                  Google Sheets must be public for web apps to read data without complex logins. This is secure as the link is private unless shared.
                </p>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-400 transition-colors"
                >
                  Edit Sheet Permissions
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search database..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleExport}
              disabled={data.length === 0}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-40"
            >
              Export
            </button>
            <button 
              onClick={handleAddClick}
              disabled={data.length === 0}
              className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center text-slate-400">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold tracking-widest uppercase">Fetching Records</p>
          </div>
        ) : filteredData.length > 0 ? (
          viewMode === 'gallery' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredData.map((row, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedRecord(row)}
                  className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                >
                  <div className="mb-4 flex justify-between items-start">
                    <div className="bg-indigo-50 p-2.5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white p-1.5 rounded-lg flex gap-1">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">
                    {row[tableHeaders[0]] || 'Untitled'}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mb-4 truncate uppercase tracking-tight">
                    {row[tableHeaders[1]] || 'General'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                    {tableHeaders.slice(2, 5).map(h => (
                      <div key={h} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider truncate max-w-[80px]">{h}</span>
                        <span className="text-slate-700 font-bold truncate ml-2">{row[h] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      {tableHeaders.map((header) => (
                        <th key={header} className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                      <th className="px-6 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((row, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedRecord(row)}
                      >
                        {tableHeaders.map((header) => (
                          <td key={`${i}-${header}`} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {row[header] || <span className="text-slate-200 italic">n/a</span>}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-slate-300 text-center px-10">
            <div className="bg-slate-100 p-6 rounded-full mb-6">
              <TableIcon className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-xl font-bold text-slate-500">No results found</p>
          </div>
        )}
      </main>

      {/* Footer Status */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-slate-200 py-3 z-10">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${data.length > 0 ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'}`}></div>
            <span>{filteredData.length} records • Connected</span>
          </div>
          {lastUpdated && <span className="hidden sm:block">Last Sync: {lastUpdated}</span>}
          <div className="flex items-center gap-1 text-amber-500">
            <Lock className="w-3 h-3" />
            <span>Read Only Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('employee-dashboard-app'));
root.render(<App />);
