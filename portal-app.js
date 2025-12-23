import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  FileText, 
  Briefcase, 
  Upload, 
  LogOut, 
  Search, 
  Plus, 
  FileCheck, 
  AlertCircle,
  Download,
  Building2,
  Menu,
  X,
  Trash2,
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  CheckCircle2
} from 'lucide-react';

// --- HELPER FUNCTIONS ---

const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.trim().replace(/\//g, '-');
};

const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr); 
};

// Robust ID generator that works in all environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// --- MOCK DATA INITIALIZATION ---

const INITIAL_CLIENTS = [
  { _id: generateId(), id: '599', title: 'Satpanth Associates', category: 'Mechanical', street: 'Ground Floor, Office no. 07, Neo Carporate Plaza', location: 'Malad (West)', city: 'Mumbai', pincode: '400064', state: 'Maharashtra', salesPerson: 'Indraj Yadav', salesEmail: 'indraj.y@arcinfinitylab.com', gst: '27ACBFS8724J1ZR', tds: '2', email: 'satpanth01@gmail.com' },
  { _id: generateId(), id: '623', title: 'Stone Tech Infra', category: 'Mechanical', street: '23, Rajpuria Baug, Gujerati Mandal Road', location: 'Vile Parle (East)', city: 'Mumbai', pincode: '400057', state: 'Maharashtra', salesPerson: 'Satish singh', salesEmail: 'satish.s@arcinfinitylab.com', gst: '27CZNPS2523J1ZW', tds: '0', email: 'syghori97@gmail.com' },
  { _id: generateId(), id: '637', title: 'Strut Infra', category: 'Mechanical', street: 'F58 Xth, Central Mall, Mahaveer Nagar', location: 'Kandivali (West)', city: 'Mumbai', pincode: '400067', state: 'Maharashtra', salesPerson: 'Indraj Yadav', salesEmail: 'indraj.y@arcinfinitylab.com', gst: '27BMPPM4569L1Z5', tds: '10', email: 'shahnawaz@strutinfra.com' },
];

const INITIAL_SITES = [
  { _id: generateId(), clientName: 'Stone Tech Infra', address: 'Seven Fold, Junction of Sharddhanand Road', location: 'Vile Parle (East)', email: '' },
  { _id: generateId(), clientName: 'Satpanth Associates', address: 'CTS No. 88(PT), Chawl No. B1,B2 & B3', location: 'Borivali (East)', email: 'satpanth24@gmail.com' },
  { _id: generateId(), clientName: 'Strut Infra', address: 'Sheth Edmont, MG Cross Road', location: 'Kandivali (West)', email: '' },
  { _id: generateId(), clientName: 'Satpanth Associates', address: 'Royal Bliss, Shivaji Chowk, Jakaria Road', location: 'Malad (West)', email: 'rpokar79@gmail.com' },
  { _id: generateId(), clientName: 'Satpanth Associates', address: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', email: 'narkarmahesh00@gmail.com' },
  { _id: generateId(), clientName: 'Stone Tech Infra', address: 'Bhavans College, Near Azad Nagar', location: 'Andheri (West)', email: '' },
  { _id: generateId(), clientName: 'Strut Infra', address: 'Chandak Realtors, Kripa Nagar', location: 'Vile Parle (West)', email: 'sarita@strutinfra.com' },
];

const INITIAL_TESTS = [
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/16', uniqueRef: '16--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P56, P59, Staircase', grade: 'M-50', castingDate: '25-03-2025', age: '7', startDate: '01-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/17', uniqueRef: '17--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P56, P59, Staircase', grade: 'M-50', castingDate: '25-03-2025', age: '28', startDate: '22-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/18', uniqueRef: '18--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1, 2, 9, 10', grade: 'M-50', castingDate: '27-03-2025', age: '7', startDate: '03-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/19', uniqueRef: '19--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1, 2, 9, 10', grade: 'M-50', castingDate: '27-03-2025', age: '28', startDate: '24-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/20', uniqueRef: '20--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1A, 3, 4', grade: 'M-50', castingDate: '28-03-2025', age: '7', startDate: '04-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/21', uniqueRef: '21--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P1A, 3, 4', grade: 'M-50', castingDate: '28-03-2025', age: '28', startDate: '25-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/22', uniqueRef: '22--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P13, 155', grade: 'M-50', castingDate: '31-03-2025', age: '7', startDate: '07-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '01-04-2025', inwardNo: 'ARC/25-26/23', uniqueRef: '23--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P13, 155', grade: 'M-50', castingDate: '31-03-2025', age: '28', startDate: '28-04-2025', witness: 'No', link: '4', client: 'Satpanth Associates' },
  { _id: generateId(), date: '04-04-2025', inwardNo: 'ARC/25-26/141', uniqueRef: '141--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: 'P57, 93, 210A', grade: 'M-30', castingDate: '27-03-2025', age: '8', startDate: '04-04-2025', witness: 'No', link: '29', client: 'Strut Infra' },
  { _id: generateId(), date: '07-04-2025', inwardNo: 'ARC/25-26/278', uniqueRef: '278--01', material: 'Concrete Cube', desc: 'Comp. Strength', samples: '3', idMark: '7th Floor Slab', grade: 'M-45', castingDate: '04-04-2025', age: '7', startDate: '11-04-2025', witness: 'No', link: '47', client: 'Stone Tech Infra' },
];

const INITIAL_JOBS = [
  { _id: generateId(), srNo: '16', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/16', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '17', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/17', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '18', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/18', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '19', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/19', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '20', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/20', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '21', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/21', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '22', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/22', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '23', month: 'Apr-25', letterDate: '01-04-2025', inwardDate: '01-04-2025', site: 'Shreeji Eternity, Near Mithchauki', location: 'Malad (West)', client: 'Satpanth Associates', testRef: 'ARC/25-26/23', jobNo: 'SP:03/01-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '231', month: 'Apr-25', letterDate: '04-04-2025', inwardDate: '04-04-2025', site: 'Chandak Realtors, Kripa Nagar', location: 'Vile Parle (West)', client: 'Strut Infra', testRef: 'ARC/25-26/141', jobNo: 'SP:02/04-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
  { _id: generateId(), srNo: '509', month: 'Apr-25', letterDate: '07-04-2025', inwardDate: '08-04-2025', site: 'Seven Fold, Junction of Sharddhanand Road', location: 'Vile Parle (East)', client: 'Stone Tech Infra', testRef: 'ARC/25-26/278', jobNo: 'SP:06/07-04', material: 'Concrete Cube', desc: 'Comp. Strength', count: '1' },
];

const INITIAL_FILES = {
  '16--01': '16--01.pdf', 
  '278--01': '278--01.pdf' 
};

// --- APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null); 
  const [notification, setNotification] = useState(null); // { message, type }
  
  // Data State
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [sites, setSites] = useState(INITIAL_SITES);
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [uploadedFiles, setUploadedFiles] = useState(INITIAL_FILES);

  // --- ACTIONS ---

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDataUpdate = (type, updatedData) => {
    switch (type) {
      case 'clients': setClients(updatedData); break;
      case 'sites': setSites(updatedData); break;
      case 'tests': setTests(updatedData); break;
      case 'jobs': setJobs(updatedData); break;
      case 'files': setUploadedFiles(updatedData); break;
      default: break;
    }
  };

  const handleLogin = (type, credentials) => {
    if (type === 'employee') {
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        setUser({ type: 'employee', name: 'Administrator' });
        setView('employee');
      } else {
        showNotification('Invalid Employee Credentials (Try: admin/admin)', 'error');
      }
    } else {
      const client = clients.find(c => c.email === credentials.email);
      if (client && credentials.password === '123') { 
        setUser({ type: 'client', data: client });
        setView('client');
      } else {
        showNotification('Invalid Client Credentials (Try emails with pass: 123)', 'error');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleBulkImport = (dataType, textData) => {
    try {
      const rows = textData.trim().split('\n').map(row => row.split('\t'));
      
      if (dataType === 'clients') {
        const newRecs = rows.map(r => ({
          _id: generateId(),
          id: r[0], title: r[1], category: r[2], street: r[3], location: r[4], 
          city: r[5], pincode: r[6], state: r[7], salesPerson: r[8], 
          salesEmail: r[9], gst: r[10], tds: r[11], email: r[12]
        }));
        setClients([...clients, ...newRecs]);
      } 
      else if (dataType === 'sites') {
        const newRecs = rows.map(r => ({
          _id: generateId(),
          clientName: r[0], address: r[1], location: r[2], email: r[3]
        }));
        setSites([...sites, ...newRecs]);
      }
      else if (dataType === 'tests') {
        const newRecs = rows.map(r => ({
          _id: generateId(),
          date: normalizeDate(r[0]), 
          inwardNo: r[1], uniqueRef: r[2], material: r[3], 
          desc: r[4], samples: r[5], idMark: r[6], grade: r[7], 
          castingDate: normalizeDate(r[8]), 
          age: r[9], 
          startDate: normalizeDate(r[10]), 
          witness: r[11], 
          link: r[12], client: r[13]
        }));
        setTests([...tests, ...newRecs]);
      }
      else if (dataType === 'jobs') {
        const newRecs = rows.map(r => ({
          _id: generateId(),
          srNo: r[0], month: r[1], 
          letterDate: normalizeDate(r[2]), 
          inwardDate: normalizeDate(r[3]), 
          site: r[4], location: r[5], client: r[6], testRef: r[7], 
          jobNo: r[8], material: r[9], desc: r[10], count: r[11]
        }));
        setJobs([...jobs, ...newRecs]);
      }
      showNotification(`Successfully imported ${rows.length} rows into ${dataType}.`);
    } catch (e) {
      showNotification('Error importing data. Please check format.', 'error');
    }
  };

  const handleFileUpload = (fileName) => {
    const refId = fileName.split('.')[0];
    const isValidRef = tests.some(t => t.uniqueRef === refId);
    
    if (isValidRef) {
      setUploadedFiles(prev => ({ ...prev, [refId]: fileName }));
      showNotification(`File matched to Record ${refId} and uploaded.`);
    } else {
      setUploadedFiles(prev => ({ ...prev, [refId]: fileName }));
      showNotification(`File stored but Unique Ref "${refId}" not found.`, 'error');
    }
  };

  // --- RENDERERS ---

  return (
    <div className="font-sans text-slate-900">
      {/* Global Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 w-[90%] md:w-auto ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {notification.type === 'error' ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
          <span className="font-medium text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto hover:opacity-75"><X size={16}/></button>
        </div>
      )}

      {view === 'home' && <HomePage setView={setView} />}
      {view === 'login' && <LoginPage onLogin={handleLogin} onBack={() => setView('home')} />}
      {view === 'employee' && user && (
        <EmployeeDashboard 
          user={user} 
          onLogout={handleLogout}
          data={{ clients, sites, tests, jobs, uploadedFiles }}
          onDataUpdate={handleDataUpdate}
          onImport={handleBulkImport}
          onFileUpload={handleFileUpload}
          showNotification={showNotification}
        />
      )}
      {view === 'client' && user && (
        <ClientDashboard 
          user={user} 
          onLogout={handleLogout}
          data={{ clients, sites, tests, jobs, uploadedFiles }}
        />
      )}
    </div>
  );
}

// --- SMART TABLE COMPONENT (New Feature) ---

function SmartTable({ data, columns, onUpdate, onDelete, showNotification }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Modal state

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [data, searchTerm]);

  // Paginate
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedData.map(d => d._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Actions
  const handleBulkDeleteClick = () => {
    setShowDeleteConfirm(true); // Open Modal
  };

  const confirmDelete = () => {
    const remainingData = data.filter(d => !selectedIds.has(d._id));
    onUpdate(remainingData);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    if (showNotification) showNotification('Records deleted successfully.');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedData = data.map(d => d._id === editingItem._id ? editingItem : d);
    onUpdate(updatedData);
    setEditingItem(null);
    if (showNotification) showNotification('Record updated successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
             <Filter size={16} className="text-slate-500" />
             <select 
               value={rowsPerPage} 
               onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
               className="border border-slate-300 rounded-md text-sm py-2 px-2 bg-transparent outline-none"
             >
               <option value={10}>10 rows</option>
               <option value={25}>25 rows</option>
               <option value={50}>50 rows</option>
               <option value={100}>100 rows</option>
             </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-md border border-red-100 w-full md:w-auto justify-between md:justify-start">
            <span className="text-sm text-red-700 font-medium">{selectedIds.size} selected</span>
            <button 
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">Delete Selected</span><span className="sm:hidden">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b">
              <tr>
                <th className="p-4 w-4">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && paginatedData.every(d => selectedIds.has(d._id))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                </th>
                {columns.map(col => <th key={col.key} className="px-4 py-3 whitespace-nowrap">{col.label}</th>)}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map(row => (
                  <tr key={row._id} className={`border-b hover:bg-slate-50 ${selectedIds.has(row._id) ? 'bg-blue-50' : 'bg-white'}`}>
                    <td className="p-4 w-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(row._id)}
                        onChange={() => handleSelectRow(row._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                    </td>
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 truncate max-w-xs" title={row[col.key]}>
                        {row[col.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setEditingItem(row)}
                        className="p-1 hover:bg-slate-200 rounded text-blue-600 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-slate-400">
                    No records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-200 gap-3">
          <span className="text-sm text-slate-500 text-center sm:text-left">
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center transform transition-all scale-100">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
                <p className="text-slate-500 mb-6">Are you sure you want to delete {selectedIds.size} selected records? This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Delete Records
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Record</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {columns.map(col => (
                <div key={col.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{col.label}</label>
                  <input 
                    type="text" 
                    value={editingItem[col.key] || ''}
                    onChange={e => setEditingItem({...editingItem, [col.key]: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </form>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS (Modified) ---

function HomePage({ setView }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-4 rounded-full">
            <Building2 size={48} />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Arc Infinity Lab</h1>
        <p className="text-lg md:text-xl text-slate-300">Material Testing & Quality Assurance Portal</p>
        <div className="flex gap-4 justify-center mt-8">
          <button 
            onClick={() => setView('login')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
          >
            Access Portal
          </button>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl px-4">
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <FileText className="mx-auto mb-3 text-blue-400" size={32} />
          <h3 className="font-semibold mb-2">Digital Reports</h3>
          <p className="text-sm text-slate-400">Instant access to material test reports and certifications.</p>
        </div>
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <Users className="mx-auto mb-3 text-blue-400" size={32} />
          <h3 className="font-semibold mb-2">Client Portal</h3>
          <p className="text-sm text-slate-400">Secure login for clients to track job progress.</p>
        </div>
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <Briefcase className="mx-auto mb-3 text-blue-400" size={32} />
          <h3 className="font-semibold mb-2">Job Tracking</h3>
          <p className="text-sm text-slate-400">Real-time status updates from casting to testing.</p>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onBack }) {
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(role, { 
      email: email, 
      username: email, // reusing field for admin username
      password 
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Login</h2>
          <button onClick={onBack} className="text-slate-500 hover:text-slate-700"><X size={20}/></button>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'client' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            onClick={() => { setRole('client'); setEmail(''); setPassword(''); }}
          >
            Client
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'employee' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            onClick={() => { setRole('employee'); setEmail('admin'); setPassword(''); }}
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {role === 'client' ? 'Email Address' : 'Username'}
            </label>
            <input 
              type={role === 'client' ? "email" : "text"} 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={role === 'client' ? "client@company.com" : "admin"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Sign In
          </button>
        </form>
        {role === 'client' && (
           <p className="mt-4 text-xs text-center text-slate-400">
             Try: satpanth01@gmail.com / 123
           </p>
        )}
      </div>
    </div>
  );
}

function EmployeeDashboard({ user, onLogout, data, onDataUpdate, onImport, onFileUpload, showNotification }) {
  const [activeTab, setActiveTab] = useState('clients');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [fileInput, setFileInput] = useState('');

  // Define Columns for SmartTable
  const clientCols = [
    { key: 'id', label: 'ID' }, { key: 'title', label: 'Title' }, 
    { key: 'city', label: 'City' }, { key: 'salesPerson', label: 'Sales Person' },
    { key: 'email', label: 'Email' }, { key: 'gst', label: 'GST' }
  ];
  const siteCols = [
    { key: 'clientName', label: 'Client' }, { key: 'address', label: 'Address' },
    { key: 'location', label: 'Location' }, { key: 'email', label: 'Site Email' }
  ];
  const testCols = [
    { key: 'date', label: 'Date' }, { key: 'uniqueRef', label: 'Unique Ref' },
    { key: 'material', label: 'Material' }, { key: 'desc', label: 'Desc' },
    { key: 'idMark', label: 'ID Mark' }, { key: 'client', label: 'Client' }
  ];
  const jobCols = [
    { key: 'jobNo', label: 'Job No' }, { key: 'site', label: 'Site' },
    { key: 'client', label: 'Client' }, { key: 'testRef', label: 'Test Ref' },
    { key: 'material', label: 'Material' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'clients': 
        return <SmartTable data={data.clients} columns={clientCols} onUpdate={(d) => onDataUpdate('clients', d)} showNotification={showNotification} />;
      case 'sites': 
        return <SmartTable data={data.sites} columns={siteCols} onUpdate={(d) => onDataUpdate('sites', d)} showNotification={showNotification} />;
      case 'tests': 
        return <SmartTable data={data.tests} columns={testCols} onUpdate={(d) => onDataUpdate('tests', d)} showNotification={showNotification} />;
      case 'jobs': 
        return <SmartTable data={data.jobs} columns={jobCols} onUpdate={(d) => onDataUpdate('jobs', d)} showNotification={showNotification} />;
      case 'files': 
        return <FileTable files={data.uploadedFiles} />;
      default: return null;
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (!fileInput) return;
    onFileUpload(fileInput);
    setFileInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-blue-400" />
          <h1 className="text-lg md:text-xl font-bold">Employee Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs md:text-sm text-slate-300 hidden sm:inline">Welcome, {user.name}</span>
          <button onClick={onLogout} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200 overflow-x-auto w-full md:w-auto">
            {['clients', 'sites', 'tests', 'jobs', 'files'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {tab === 'clients' ? 'Client Details' : tab === 'sites' ? 'Site Records' : tab === 'tests' ? 'Test Records' : tab === 'jobs' ? 'Job Records' : 'File Uploads'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {activeTab === 'files' ? (
              <form onSubmit={handleFileSubmit} className="flex gap-2 w-full">
                 <input 
                  type="text" 
                  placeholder="Enter filename (e.g., 16--01.pdf)"
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm w-full md:w-64 shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={fileInput}
                  onChange={e => setFileInput(e.target.value)}
                />
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors whitespace-nowrap">
                  <Upload size={16} /> Upload
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowImport(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors w-full md:w-auto"
              >
                <Plus size={16} /> Bulk Import Data
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {renderContent()}
        </div>

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Import Data: <span className="capitalize text-blue-600">{activeTab}</span></h3>
                <button onClick={() => setShowImport(false)}><X size={20} /></button>
              </div>
              <textarea 
                className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-xs mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`Paste ${activeTab} data here...`}
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowImport(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                  onClick={() => {
                    onImport(activeTab, importText);
                    setImportText('');
                    setShowImport(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Process Import
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ClientDashboard({ user, onLogout, data }) {
  const [selectedSite, setSelectedSite] = useState('All');

  const clientData = useMemo(() => {
    const clientName = user.data.title;
    
    let myJobs = data.jobs.filter(j => j.client === clientName);

    if (selectedSite !== 'All') {
      myJobs = myJobs.filter(j => j.site === selectedSite);
    }

    return myJobs.map(job => {
      const testRec = data.tests.find(t => t.inwardNo === job.testRef);
      
      let fileStatus = 'Pending';
      let fileLink = null;
      let expectedDate = 'N/A';
      let testingDate = 'N/A';
      let grade = 'N/A';
      let idMark = 'N/A';
      let castingDate = 'N/A';
      let age = 'N/A';
      let testParam = 'N/A';

      if (testRec) {
        if (data.uploadedFiles[testRec.uniqueRef]) {
          fileStatus = 'Ready';
          fileLink = data.uploadedFiles[testRec.uniqueRef];
        }
        
        const startDateObj = parseDateString(testRec.startDate);
        
        expectedDate = new Date(startDateObj);
        expectedDate.setDate(startDateObj.getDate() + 2); 
        expectedDate = expectedDate.toLocaleDateString();

        testingDate = testRec.startDate;
        grade = testRec.grade;
        idMark = testRec.idMark;
        castingDate = testRec.castingDate;
        age = testRec.age;
        testParam = testRec.desc;
      }

      return {
        jobNo: job.jobNo,
        testRef: job.testRef, 
        dateRec: job.inwardDate,
        material: job.material,
        testParam: testParam,
        id: idMark,
        grade: grade,
        castingDate: castingDate,
        age: age,
        testingDate: testingDate,
        resultDate: expectedDate,
        status: fileStatus,
        file: fileLink
      };
    });
  }, [user, data, selectedSite]);

  const mySites = useMemo(() => {
    return data.sites
      .filter(s => s.clientName === user.data.title)
      .map(s => s.address);
  }, [data, user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded text-white">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{user.data.title}</h1>
            <p className="text-xs text-slate-500">Client Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium">
            <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Project / Site</label>
            <div className="relative">
              <select 
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="All">All Projects</option>
                {mySites.map((site, i) => (
                  <option key={i} value={site}>{site}</option>
                ))}
              </select>
              <MapPin size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none"/>
            </div>
          </div>
          <div className="flex w-full md:w-auto justify-between md:justify-end gap-4 mt-4 md:mt-0">
             <div className="text-right">
                <span className="block text-2xl font-bold text-slate-800">{clientData.length}</span>
                <span className="text-xs text-slate-500">Total Records</span>
             </div>
             <div className="text-right border-l pl-4">
                <span className="block text-2xl font-bold text-green-600">{clientData.filter(d => d.status === 'Ready').length}</span>
                <span className="text-xs text-slate-500">Reports Ready</span>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3">Job No</th>
                  <th className="px-4 py-3">Test Ref</th> 
                  <th className="px-4 py-3">Rec. Date</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Result Date</th>
                  <th className="px-4 py-3 text-center">Report</th>
                </tr>
              </thead>
              <tbody>
                {clientData.length > 0 ? (
                  clientData.map((row, idx) => (
                    <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.jobNo}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{row.testRef}</td>
                      <td className="px-4 py-3">{row.dateRec}</td>
                      <td className="px-4 py-3">{row.material}</td>
                      <td className="px-4 py-3">{row.testParam}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate" title={row.id}>{row.id}</td>
                      <td className="px-4 py-3">{row.grade}</td>
                      <td className="px-4 py-3">{row.age}</td>
                      <td className="px-4 py-3">{row.resultDate}</td>
                      <td className="px-4 py-3 text-center">
                        {row.status === 'Ready' ? (
                          <button 
                            onClick={() => alert(`Downloading ${row.file}...`)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
                          >
                            <Download size={12} /> PDF
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-4 py-8 text-center text-slate-400 italic">No records found for this project.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function FileTable({ files }) {
  const entries = Object.entries(files);
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b">
            <tr>
              <th className="px-4 py-3">Unique Ref No.</th>
              <th className="px-4 py-3">File Name</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([ref, name], i) => (
              <tr key={i} className="bg-white border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-slate-900">{ref}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <FileCheck size={16} className="text-blue-500" />
                  {name}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200">Uploaded</span>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan="3" className="p-4 text-center text-slate-400">No files uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MOUNTING LOGIC ---
const container = document.getElementById('employee-dashboard-app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}