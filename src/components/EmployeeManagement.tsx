import { useState, FormEvent, useRef, DragEvent, ChangeEvent } from 'react';
import { Employee, SystemPrivilege } from '../types';
import { Search, UserPlus, FileText, Upload, Briefcase, X, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  department: string;
  designation: string;
  reportingTo: string;
  joiningDate: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  tds: number;
  status: 'Ready' | 'Error' | 'Warning';
  messages: string[];
}

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (newEmployee: Employee) => void;
  onUpdateEmployee: (updatedEmployee: Employee) => void;
  onBulkAddEmployees?: (newEmployees: Employee[]) => void;
}

export default function EmployeeManagement({ employees, onAddEmployee, onUpdateEmployee, onBulkAddEmployees }: EmployeeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Bulk Upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'ready' | 'error'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download excel sample template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "First Name": "Aarav",
        "Last Name": "Sharma",
        "Email": "aarav.sharma@acme.com",
        "Phone": "+91 91234 56789",
        "Branch Location": "Mumbai HQ",
        "Department": "Engineering",
        "Designation Role": "Software Engineer II",
        "Reporting Director": "Pooja Patel",
        "Joining Date": "2026-06-15",
        "Basic Salary": 50000,
        "HRA Contribution": 20000,
        "Allowances": 15000,
        "TDS Bracket": 2500
      },
      {
        "First Name": "Neha",
        "Last Name": "Gupta",
        "Email": "neha.gupta@acme.com",
        "Phone": "+91 98765 00112",
        "Branch Location": "Bangalore Tech Hub",
        "Department": "Human Resources",
        "Designation Role": "HR Specialist",
        "Reporting Director": "Pooja Patel",
        "Joining Date": "2026-07-01",
        "Basic Salary": 35000,
        "HRA Contribution": 14000,
        "Allowances": 10000,
        "TDS Bracket": 1000
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Template");
    XLSX.writeFile(workbook, "employee_bulk_upload_template.xlsx");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseAndValidateFile(file);
    }
  };

  const parseAndValidateFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          alert("The Excel file seems to have no data rows in the first sheet.");
          return;
        }

        const rows: ParsedRow[] = jsonData.map((row, index) => {
          const rowNum = index + 2; // spreadsheet row identifier

          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined) return String(row[k]).trim();
              const lowerKey = k.toLowerCase().replace(/\s+/g, '');
              for (const rowKey of Object.keys(row)) {
                if (rowKey.toLowerCase().replace(/\s+/g, '') === lowerKey) {
                  return String(row[rowKey]).trim();
                }
              }
            }
            return '';
          };

          const parseNum = (val: string, fallback: number) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? fallback : parsed;
          };

          const fName = getVal('First Name', 'FirstName', 'First_Name', 'Name');
          const lName = getVal('Last Name', 'LastName', 'Last_Name', 'Surname');
          const mail = getVal('Email', 'E-mail', 'EmailAddress', 'Email Address');
          const ph = getVal('Phone', 'PhoneNumber', 'Phone Number', 'Mobile', 'Contact');
          const br = getVal('Branch Location', 'BranchLocation', 'Branch_Location', 'Branch', 'Location') || 'Mumbai HQ';
          const dept = getVal('Department', 'Dept', 'Division') || 'Engineering';
          const desig = getVal('Designation Role', 'DesignationRole', 'Designation_Role', 'Designation', 'Role');
          const repTo = getVal('Reporting Director', 'ReportingDirector', 'Reporting_Director', 'ReportingTo', 'Reporting To', 'Manager') || 'Pooja Patel';
          const jDate = getVal('Joining Date', 'JoiningDate', 'Joining_Date', 'DOJ', 'Date Of Joining') || new Date().toISOString().split('T')[0];

          const basic = parseNum(getVal('Basic Salary', 'BasicSalary', 'Basic_Salary', 'Basic'), 45000);
          const hraVal = parseNum(getVal('HRA Contribution', 'HRAContribution', 'HRA_Contribution', 'HRA'), 18000);
          const allow = parseNum(getVal('Allowances', 'Allowance', 'Other Allowances'), 12000);
          const tdsVal = parseNum(getVal('TDS Bracket', 'TDSBracket', 'TDS_Bracket', 'TDS', 'Tax'), 2000);

          const messages: string[] = [];
          let rowStatus: 'Ready' | 'Error' | 'Warning' = 'Ready';

          if (!fName) {
            messages.push("Missing First Name");
            rowStatus = 'Error';
          }
          if (!lName) {
            messages.push("Missing Last Name");
            rowStatus = 'Error';
          }
          if (!desig) {
            messages.push("Missing Designation Role");
            rowStatus = 'Error';
          }

          if (!mail) {
            messages.push("Missing Email Address");
            rowStatus = 'Error';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(mail)) {
              messages.push("Invalid Email structure");
              rowStatus = 'Error';
            } else {
              const originalExits = employees.some(e => e.email.toLowerCase() === mail.toLowerCase());
              if (originalExits) {
                messages.push(`Duplicate: Email already active in system`);
                rowStatus = 'Error';
              }
            }
          }

          const dupInExcel = jsonData.some((r, idx) => {
            if (idx === index) return false;
            const otherMail = String(r['Email'] || r['E-mail'] || r['Email Address'] || r['EmailAddress'] || '').trim().toLowerCase();
            return otherMail && otherMail === mail.toLowerCase();
          });
          if (dupInExcel && mail) {
            messages.push("Duplicate E-mail listed inside spreadsheet");
            rowStatus = 'Error';
          }

          return {
            rowNumber: rowNum,
            firstName: fName,
            lastName: lName,
            email: mail,
            phone: ph,
            branch: br,
            department: dept,
            designation: desig,
            reportingTo: repTo,
            joiningDate: jDate,
            basicSalary: basic,
            hra: hraVal,
            allowances: allow,
            tds: tdsVal,
            status: rowStatus,
            messages
          };
        });

        setParsedRows(rows);
      } catch (err) {
        console.error(err);
        alert("Unable to parse sheet data. Please ensure the Excel file contains structural formatting.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        parseAndValidateFile(file);
      } else {
        alert("Only Excel spreadsheets (.xlsx, .xls) and standard CSV sheets are supported.");
      }
    }
  };

  const handleCommitBulkImport = () => {
    const readyToImport = parsedRows.filter(r => r.status === 'Ready');
    if (readyToImport.length === 0) {
      alert("No valid records found waiting to onboarding. Clear existing errors.");
      return;
    }

    if (!onBulkAddEmployees) {
      readyToImport.forEach((row, idx) => {
        const basic = row.basicSalary;
        const hraVal = row.hra;
        const allow = row.allowances;
        const tdsVal = row.tds;

        const pfDeduction = Math.round(basic * 0.12);
        const gross = basic + hraVal + allow;
        const esiDeduction = gross <= 21000 ? Math.round(gross * 0.0075 * 100) / 100 : 0;
        const professionalTax = gross > 10000 ? 200 : 0;

        const newEmp: Employee = {
          id: `EMP-bulk-${Date.now()}-${idx}`,
          employeeId: `EMP-2026-0${employees.length + idx + 1}`,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          branch: row.branch,
          department: row.department,
          designation: row.designation,
          reportingTo: row.reportingTo,
          joiningDate: row.joiningDate,
          status: 'Onboarding',
          systemPrivilege: 'Employee',
          salaryStructure: {
            basic,
            hra: hraVal,
            allowances: allow,
            pfDeduction,
            esiDeduction,
            professionalTax,
            tds: tdsVal,
          },
          documents: [],
          history: [
            { date: row.joiningDate, type: 'Joining', description: `Joint bulk onboarding sequence via Excel sheet import` }
          ]
        };
        onAddEmployee(newEmp);
      });
    } else {
      const bulkEmployees: Employee[] = readyToImport.map((row, idx) => {
        const basic = row.basicSalary;
        const hraVal = row.hra;
        const allow = row.allowances;
        const tdsVal = row.tds;

        const pfDeduction = Math.round(basic * 0.12);
        const gross = basic + hraVal + allow;
        const esiDeduction = gross <= 21000 ? Math.round(gross * 0.0075 * 100) / 100 : 0;
        const professionalTax = gross > 10000 ? 200 : 0;

        return {
          id: `EMP-bulk-${Date.now()}-${idx}`,
          employeeId: `EMP-2026-0${employees.length + idx + 1}`,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          branch: row.branch,
          department: row.department,
          designation: row.designation,
          reportingTo: row.reportingTo,
          joiningDate: row.joiningDate,
          status: 'Onboarding',
          systemPrivilege: 'Employee',
          salaryStructure: {
            basic,
            hra: hraVal,
            allowances: allow,
            pfDeduction,
            esiDeduction,
            professionalTax,
            tds: tdsVal,
          },
          documents: [],
          history: [
            { date: row.joiningDate, type: 'Joining', description: `Joint onboarding sequence via Excel sheet import` }
          ]
        };
      });

      onBulkAddEmployees(bulkEmployees);
    }

    alert(`Successfully bulk onboarded ${readyToImport.length} verified profiles.`);
    setShowBulkModal(false);
    setParsedRows([]);
  };

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('Mumbai HQ');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-06-15');
  const [basicSalary, setBasicSalary] = useState('45000');
  const [hra, setHra] = useState('18000');
  const [allowances, setAllowances] = useState('12000');
  const [tds, setTds] = useState('2000');
  const [systemPrivilege, setSystemPrivilege] = useState<SystemPrivilege>('Employee');

  // Simulated Document upload state inside Details
  const [simDocName, setSimDocName] = useState('');
  const [simDocType, setSimDocType] = useState('Contract');

  // Filter lists
  const branches = ['All', 'Mumbai HQ', 'Bangalore Tech Hub', 'Delhi Regional Office'];
  const departments = ['All', 'Engineering', 'Human Resources', 'Product Management', 'Design', 'Sales & Marketing', 'Finance'];

  const filtered = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.employeeId} ${emp.designation}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || emp.branch === selectedBranch;
    const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
    return matchesSearch && matchesBranch && matchesDept;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !designation) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const nBasic = parseFloat(basicSalary) || 0;
    const nHra = parseFloat(hra) || 0;
    const nAllowances = parseFloat(allowances) || 0;
    const nTds = parseFloat(tds) || 0;

    // Provident Fund default 12% contribution limit calculation
    const pfDeduction = Math.round(nBasic * 0.12);
    // ESI limit calculation: if gross Salary <= 21,000, than 0.75% of Gross
    const gross = nBasic + nHra + nAllowances;
    const esiDeduction = gross <= 21000 ? Math.round(gross * 0.0075 * 100) / 100 : 0;
    const professionalTax = gross > 10000 ? 200 : 0;

    const newEmp: Employee = {
      id: `EMP-${Date.now()}`,
      employeeId: `EMP-2026-0${employees.length + 1}`,
      firstName,
      lastName,
      email,
      phone,
      branch,
      department,
      designation,
      reportingTo: reportingTo || "Pooja Patel",
      joiningDate,
      status: 'Onboarding', // default to Onboarding
      systemPrivilege,
      salaryStructure: {
        basic: nBasic,
        hra: nHra,
        allowances: nAllowances,
        pfDeduction,
        esiDeduction,
        professionalTax,
        tds: nTds,
      },
      documents: [],
      history: [
        { date: joiningDate, type: 'Joining', description: `Initiated onboarding sequence at ${branch} - ${department} division with role ${systemPrivilege}` }
      ]
    };

    onAddEmployee(newEmp);
    setShowAddForm(false);
    
    // Reset form states
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setReportingTo('');
    setBasicSalary('45000');
    setHra('18000');
    setAllowances('12000');
    setTds('2000');
    setSystemPrivilege('ESS_ONLY');
  };

  const handleSimulatedDocUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !simDocName) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: simDocName.endsWith('.pdf') ? simDocName : `${simDocName}.pdf`,
      type: simDocType,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updatedEmp: Employee = {
      ...selectedEmployee,
      documents: [...selectedEmployee.documents, newDoc],
      history: [
        ...selectedEmployee.history,
        {
          date: new Date().toISOString().split('T')[0],
          type: 'SettingsUpdate',
          description: `Document uploaded: ${newDoc.name} (${newDoc.type})`
        }
      ]
    };

    onUpdateEmployee(updatedEmp);
    setSelectedEmployee(updatedEmp);
    setSimDocName('');
  };

  const handleStatusChange = (status: 'Active' | 'Onboarding' | 'Suspended' | 'Offboarded') => {
    if (!selectedEmployee) return;

    const updatedEmp: Employee = {
      ...selectedEmployee,
      status,
      history: [
        ...selectedEmployee.history,
        {
          date: new Date().toISOString().split('T')[0],
          type: 'StatusChange',
          description: `Lifecycle status modified from ${selectedEmployee.status} to ${status}`
        }
      ]
    };

    onUpdateEmployee(updatedEmp);
    setSelectedEmployee(updatedEmp);
  };

  const handlePrivilegeChange = (systemPrivilege: SystemPrivilege) => {
    if (!selectedEmployee) return;

    const updatedEmp: Employee = {
      ...selectedEmployee,
      systemPrivilege,
      history: [
        ...selectedEmployee.history,
        {
          date: new Date().toISOString().split('T')[0],
          type: 'SettingsUpdate',
          description: `System clearance role adjusted from ${selectedEmployee.systemPrivilege || 'Employee'} to ${systemPrivilege}`
        }
      ]
    };

    onUpdateEmployee(updatedEmp);
    setSelectedEmployee(updatedEmp);
  };

  const handlePromote = (newDesignation: string, newBasic: number) => {
    if (!selectedEmployee) return;

    const nBasic = newBasic || selectedEmployee.salaryStructure.basic;
    const nHra = Math.round(nBasic * 0.4); // typical 40% metro allowance structure
    const allowances = selectedEmployee.salaryStructure.allowances;
    
    // Recalculate deductions
    const pfDeduction = Math.round(nBasic * 0.12);
    const gross = nBasic + nHra + allowances;
    const esiDeduction = gross <= 21000 ? Math.round(gross * 0.0075 * 100) / 100 : 0;

    const updatedEmp: Employee = {
      ...selectedEmployee,
      designation: newDesignation,
      salaryStructure: {
        ...selectedEmployee.salaryStructure,
        basic: nBasic,
        hra: nHra,
        pfDeduction,
        esiDeduction,
      },
      history: [
        ...selectedEmployee.history,
        {
          date: new Date().toISOString().split('T')[0],
          type: 'Promotion',
          description: `Promoted to ${newDesignation}. Core structure adjusted to ₹${nBasic.toLocaleString()} basic`
        }
      ]
    };

    onUpdateEmployee(updatedEmp);
    setSelectedEmployee(updatedEmp);
    alert(`Successfully promoted ${selectedEmployee.firstName} to ${newDesignation}`);
  };

  return (
    <div className="space-y-6" id="employee-management">
      {/* Search and Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Employee Master</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Maintain core records, structural hierarchy, promotion records, contract uploads.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 bg-[#17171a] text-slate-200 hover:bg-[#202024] border border-slate-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all font-sans cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Bulk Import (Excel)
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all font-sans cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <UserPlus className="w-4 h-4" />
            Onboard Employee
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111114] p-4 rounded-xl border border-slate-800/50 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search employees by name, designation, id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-[#09090b] border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 placeholder-slate-500 text-slate-200 focus:outline-hidden focus:border-emerald-500/50"
          />
        </div>

        {/* Branch filter */}
        <div className="flex items-center gap-2 min-w-44">
          <span className="text-xs font-semibold text-slate-400 font-sans">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-[#09090b] border border-slate-800 rounded-lg p-2 flex-1 text-slate-300 font-sans focus:outline-hidden"
          >
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2 min-w-48">
          <span className="text-xs font-semibold text-slate-400 font-sans">Dept:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs bg-[#09090b] border border-slate-800 rounded-lg p-2 flex-1 text-slate-300 font-sans focus:outline-hidden"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Card lists vs Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Employee Table */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#09090b]/45 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                  <th className="p-4 font-semibold">Employee Name</th>
                  <th className="p-4 font-semibold">Designation / Division</th>
                  <th className="p-4 font-semibold">Branch Location</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {filtered.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className={`hover:bg-[#09090b]/40 transition-all cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700 uppercase flex items-center justify-center font-sans">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <span className="block font-semibold text-white font-sans">{emp.firstName} {emp.lastName}</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{emp.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block font-semibold text-slate-200 font-sans">{emp.designation}</span>
                      <span className="block text-[10px] text-slate-400 font-sans mt-0.5">{emp.department}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 font-sans">{emp.branch}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        emp.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(emp);
                        }}
                        className="text-[10px] font-semibold text-slate-200 hover:bg-slate-800/60 border border-slate-700 rounded px-2.5 py-1.5 transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                      No staff records found matching constraints.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Inspector Panel */}
        <div>
          {selectedEmployee ? (
            <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md p-6 space-y-6 sticky top-4">
              {/* Header card with Close button */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-800/40">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg border border-slate-800">
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <span className="block text-xs text-slate-400 font-sans">{selectedEmployee.designation}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{selectedEmployee.employeeId}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)} 
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status and Privilege controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">Operational Lifecycle</label>
                  <div className="flex flex-wrap gap-1">
                    {(['Active', 'Onboarding', 'Suspended', 'Offboarded'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                          selectedEmployee.status === st 
                            ? 'bg-slate-800 border-slate-700 text-white shadow-xs' 
                            : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">System Level Privilege</label>
                  <select 
                    value={selectedEmployee.systemPrivilege || 'Employee'} 
                    onChange={(e) => handlePrivilegeChange(e.target.value as any)} 
                    className="w-full max-w-xs bg-[#09090b] border border-slate-800 rounded-lg p-2 text-xs text-slate-100 cursor-pointer focus:outline-hidden"
                  >
                    {[
                      "Super Administrator",
                      "System Administrator",
                      "HR Director",
                      "HR Executive",
                      "Payroll Manager",
                      "Department Head",
                      "Reporting Manager",
                      "Team Lead",
                      "Employee",
                      "Auditor",
                      "Recruiter",
                      "Finance Executive",
                      "Finance Manager",
                      "IT Administrator",
                      "Guest/View Only User"
                    ].map((priv) => (
                      <option key={priv} value={priv}>{priv}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs border-b border-slate-800/40 pb-4 text-slate-300">
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500 mt-1">Reporting Structure</span>
                  <span className="font-semibold text-slate-200 font-sans">{selectedEmployee.reportingTo}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500 mt-1">Date of Joining</span>
                  <span className="font-semibold text-slate-200 font-sans">{selectedEmployee.joiningDate}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500 mt-1">Contact Email</span>
                  <span className="font-semibold text-slate-200 truncate block font-sans">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500 mt-1">Contact Phone</span>
                  <span className="font-semibold text-slate-200 block font-sans">{selectedEmployee.phone || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[9px] uppercase font-mono text-slate-500 mt-1">Compensation Tier</span>
                  <span className="font-mono text-emerald-400 block font-semibold text-sm">₹{selectedEmployee.salaryStructure.basic.toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Promo Action */}
              <div className="bg-[#09090b]/40 p-4 rounded-xl border border-slate-800">
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider font-semibold mb-2">Structure & Designation Upgrade</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="promo-title"
                    placeholder="New Title"
                    className="flex-1 bg-[#09090b] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-sans text-white focus:outline-hidden"
                  />
                  <input 
                    type="number" 
                    id="promo-salary"
                    placeholder="New Basic (₹)"
                    className="w-24 bg-[#09090b] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-hidden"
                  />
                  <button 
                    onClick={() => {
                      const titleEl = document.getElementById('promo-title') as HTMLInputElement;
                      const salEl = document.getElementById('promo-salary') as HTMLInputElement;
                      if (!titleEl.value || !salEl.value) {
                        alert("Both new designation title and adjusted basic compensation must be set to upgrade.");
                        return;
                      }
                      handlePromote(titleEl.value, parseFloat(salEl.value));
                      titleEl.value = '';
                      salEl.value = '';
                    }}
                    className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-semibold hover:bg-emerald-500 cursor-pointer transition-colors"
                  >
                    Promote
                  </button>
                </div>
              </div>

              {/* Career History Timeline */}
              <div className="space-y-2">
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">Enterprise History Timeline</span>
                <div className="relative pl-4 space-y-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-850">
                  {selectedEmployee.history.map((hist, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border border-[#111114] bg-emerald-500 animate-pulse"></span>
                      <div className="flex items-center gap-2">
                        <span className="inline-block text-[9px] font-mono font-semibold text-slate-400">{hist.date}</span>
                        <span className="inline-block bg-[#09090b] text-[8px] font-semibold text-emerald-400 border border-emerald-500/20 font-mono px-1 rounded uppercase">
                          {hist.type}
                        </span>
                      </div>
                      <span className="block text-xs text-slate-300 font-sans leading-relaxed">{hist.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Repository & Sim Upload */}
              <div className="space-y-3 pt-4 border-t border-slate-800/40">
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">Document Vault ({selectedEmployee.documents.length})</span>
                
                {/* Upload Form */}
                <form onSubmit={handleSimulatedDocUpload} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Doc Name (e.g. Identity Proof)" 
                    value={simDocName}
                    onChange={(e) => setSimDocName(e.target.value)}
                    className="flex-1 bg-[#09090b] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-hidden"
                  />
                  <select
                    value={simDocType}
                    onChange={(e) => setSimDocType(e.target.value)}
                    className="text-[10px] bg-[#09090b] border border-slate-800 text-slate-300 rounded p-1"
                  >
                    <option value="Contract">Contract</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Academic">Academic</option>
                    <option value="Portfolio">Portfolio</option>
                  </select>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 rounded cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Docs list */}
                <div className="space-y-1">
                  {selectedEmployee.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-[#09090b]/40 border border-slate-850 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <div>
                          <span className="block font-medium font-sans text-slate-300">{doc.name}</span>
                          <span className="block text-[9px] text-slate-500 font-sans">{doc.type} • {doc.uploadedAt}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono bg-[#09090b] px-2 py-0.5 border border-emerald-500/25 rounded">
                        Secure
                      </span>
                    </div>
                  ))}
                  {selectedEmployee.documents.length === 0 && (
                    <p className="text-[10px] text-slate-500 font-sans text-center py-2">No documents stored in profile.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111114]/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 font-sans h-80 flex flex-col items-center justify-center">
              <Briefcase className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">No profile selected</p>
              <p className="text-[10px] text-slate-500 mt-1.5 max-w-44 mx-auto leading-normal">Select an employee from the table list to manage life-cycle promotion logs, upload records, and update details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Overlay Modal for Onboarding */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111114] rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-800/85 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4.5 bg-[#09090b] text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-400 font-display">Enterprise Onboarding Form</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Initialize a master profile including salary structures for legal compliance.</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">First Name *</label>
                  <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Last Name *</label>
                  <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Official Email *</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Phone Number</label>
                  <input type="text" placeholder="+91 XXXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-hidden focus:border-emerald-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Location Hub</label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-300">
                    <option value="Mumbai HQ">Mumbai HQ</option>
                    <option value="Bangalore Tech Hub">Bangalore Tech Hub</option>
                    <option value="Delhi Regional Office">Delhi Regional Office</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-300">
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Design">Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Joining Date</label>
                  <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2 text-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/40">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Designation Role *</label>
                  <input required placeholder="eg. Technical Associate" type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-hidden" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Reporting Director</label>
                  <input type="text" placeholder="Manager full name" value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-600 focus:outline-hidden" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">System Privilege</label>
                  <select 
                    value={systemPrivilege} 
                    onChange={(e) => setSystemPrivilege(e.target.value as any)} 
                    className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-hidden cursor-pointer"
                  >
                    {[
                      "Super Administrator",
                      "System Administrator",
                      "HR Director",
                      "HR Executive",
                      "Payroll Manager",
                      "Department Head",
                      "Reporting Manager",
                      "Team Lead",
                      "Employee",
                      "Auditor",
                      "Recruiter",
                      "Finance Executive",
                      "Finance Manager",
                      "IT Administrator",
                      "Guest/View Only User"
                    ].map((priv) => (
                      <option key={priv} value={priv}>{priv}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary settings */}
              <div className="space-y-3 pt-3.5 border-t border-slate-800/40 bg-[#09090b]/40 p-4 rounded-xl">
                <span className="block text-[10px] uppercase font-mono text-emerald-400 tracking-wider font-bold">Salary Breakdown Configuration (₹ Monthly)</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Indian statutory calculations for PF (12%) and ESI (0.75% &lt; ₹21,000 gross) will apply automatically to these settings.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">Basic Salary</label>
                    <input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded p-2 text-xs font-mono text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">HRA Contribution</label>
                    <input type="number" value={hra} onChange={(e) => setHra(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded p-2 text-xs font-mono text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">All Allowances</label>
                    <input type="number" value={allowances} onChange={(e) => setAllowances(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded p-2 text-xs font-mono text-white" />
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">TDS Bracket Deduction</label>
                    <input type="number" value={tds} onChange={(e) => setTds(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded p-2 text-xs font-mono text-white" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 transition font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-semibold cursor-pointer shadow-lg shadow-emerald-500/10">
                  Confirm Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal via Excel */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="bulk-excel-modal">
          <div className="bg-[#111114] rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-800/90 overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4.5 bg-[#09090b] text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-400 font-display">Bulk Onboarding Scanner</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Parse, validate, and bulk-load multiple corporate employee records via Excel</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowBulkModal(false);
                  setParsedRows([]);
                }} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/50 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Top Help and Drag Drop Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Guidelines & Download template */}
                <div className="md:col-span-1 bg-[#09090b]/40 rounded-xl p-4.5 border border-slate-850 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider font-bold block">Onboarding Guidelines</span>
                    <ul className="space-y-2 text-[11px] text-slate-400 font-sans list-disc pl-4 leading-relaxed">
                      <li>Excel spreadsheet must contain headers in the first row.</li>
                      <li>Mandatory fields: <strong className="text-slate-200">First Name, Last Name, Email, Designation Role</strong>.</li>
                      <li>Emails must not already exist inside the system records.</li>
                      <li>Statutory calculations like PF, ESI, PT will be automatically computed upon import.</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#17171a] hover:bg-[#202024] border border-slate-800 text-slate-300 hover:text-white px-3 py-2.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs"
                    type="button"
                  >
                    <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
                    Download Excel Template
                  </button>
                </div>

                {/* Drag-and-drop filezone */}
                <div className="md:col-span-2">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      dragOver 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : parsedRows.length > 0
                        ? 'border-slate-800 bg-emerald-950/5 hover:border-slate-700'
                        : 'border-slate-800 bg-[#09090b]/20 hover:border-slate-700/80 hover:bg-[#09090b]/35'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                    <Upload className={`w-10 h-10 mb-3 transition-transform duration-200 ${dragOver ? 'scale-110 text-emerald-400' : 'text-slate-500'}`} />
                    <span className="block text-xs font-semibold text-slate-200">
                      {dragOver ? "Drop Excel file now!" : "Drag & Drop spreadsheet here, or click to browse"}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-sans mt-1">
                      Supports direct upload of custom parsed .XLSX, .XLS or .CSV formats
                    </span>
                  </div>
                </div>

              </div>

              {/* Parsed Previews list container */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-800/40 pt-5">
                  <div className="flex gap-2.5 items-center">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold">Import Staging Area</span>
                    {parsedRows.length > 0 && (
                      <div className="flex gap-1.5 text-[10px] items-center">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-medium">
                          {parsedRows.filter(r => r.status === 'Ready').length} Verified
                        </span>
                        {parsedRows.filter(r => r.status === 'Error').length > 0 && (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-medium">
                            {parsedRows.filter(r => r.status === 'Error').length} Blocked
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {parsedRows.length > 0 && (
                    <div className="flex bg-[#09090b] rounded-lg border border-slate-800 p-0.5">
                      {(['all', 'ready', 'error'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setPreviewFilter(filter)}
                          className={`px-3 py-1 font-sans rounded-md capitalize transition-all text-[11px] font-semibold cursor-pointer ${
                            previewFilter === filter 
                              ? 'bg-[#17171a] border border-slate-800 text-emerald-400' 
                              : 'bg-transparent text-slate-400 hover:text-slate-200'
                          }`}
                          type="button"
                        >
                          {filter === 'all' ? 'All records' : filter === 'ready' ? 'Ready only' : 'Incomplete / Invalid'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {parsedRows.length > 0 ? (
                  <div className="bg-[#09090b]/45 rounded-xl border border-slate-850 overflow-hidden">
                    <div className="overflow-x-auto max-h-[30vh]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#09090b]/70 text-[9px] uppercase font-mono tracking-wider font-semibold border-b border-slate-800 text-slate-405">
                            <th className="p-3"># Row</th>
                            <th className="p-3">Audit Details</th>
                            <th className="p-3">Staff Details</th>
                            <th className="p-3">Assign Position</th>
                            <th className="p-3">Staged Basic Salary</th>
                            <th className="p-3">Verification Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-[11px] leading-relaxed text-slate-350">
                          {parsedRows
                            .filter(r => {
                              if (previewFilter === 'ready') return r.status === 'Ready';
                              if (previewFilter === 'error') return r.status === 'Error';
                              return true;
                            })
                            .map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#09090b]/20 transition-all">
                                <td className="p-3 text-slate-500 font-mono">Row {row.rowNumber}</td>
                                <td className="p-3">
                                  {row.status === 'Ready' ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                                      <AlertCircle className="w-3 h-3 text-red-400 animate-pulse" />
                                      Blocked
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="space-y-0.5">
                                    <span className="block font-semibold text-white">{row.firstName} {row.lastName}</span>
                                    <span className="block text-[10px] font-mono text-slate-400">{row.email || "(no email)"}</span>
                                    {row.phone && <span className="block text-[9px] text-slate-550">{row.phone}</span>}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-0.5">
                                    <span className="block text-slate-300 font-medium">{row.designation || "No Designation Assigned"}</span>
                                    <span className="block text-[10px] text-slate-400">{row.department} • {row.branch}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-slate-300 font-medium">
                                  {row.basicSalary ? `₹${row.basicSalary.toLocaleString()}` : "N/A"}
                                </td>
                                <td className="p-3">
                                  {row.messages.length > 0 ? (
                                    <ul className="space-y-0.5 max-w-xs">
                                      {row.messages.map((m, i) => (
                                        <li key={i} className={`text-[10px] list-none leading-normal font-medium ${row.status === 'Error' ? 'text-red-400' : 'text-amber-400'}`}>
                                          • {m}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400/80 italic font-sans flex items-center gap-1">All conditions met</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#09090b]/10 border border-dashed border-slate-800 rounded-xl p-10 text-center text-slate-500 font-sans h-44 flex flex-col items-center justify-center">
                    <FileSpreadsheet className="w-9 h-9 text-slate-700 mb-2.5" />
                    <p className="text-xs font-semibold text-slate-400">Import Staging Area Empty</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
                      Drag-and-drop a valid Microsoft Excel sheet or download our recommended template above to staging-load records.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#09090b] border-t border-slate-800/80 flex justify-between items-center text-xs">
              <p className="text-slate-400 text-[11px] font-sans">
                {parsedRows.length > 0 ? (
                  <>
                    Staged <strong className="text-emerald-400 font-bold">{parsedRows.filter(r => r.status === 'Ready').length}</strong> valid additions. 
                    Blocked <strong className="text-red-400 font-bold">{parsedRows.filter(r => r.status === 'Error').length}</strong> entries.
                  </>
                ) : (
                  "Ready to receive payroll and master structural files"
                )}
              </p>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBulkModal(false);
                    setParsedRows([]);
                  }} 
                  className="px-4 py-2 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCommitBulkImport}
                  disabled={parsedRows.length === 0 || parsedRows.filter(r => r.status === 'Ready').length === 0}
                  className="px-5 py-2 bg-emerald-600 disabled:opacity-45 hover:bg-emerald-500 text-white rounded-lg transition font-semibold cursor-pointer shadow-lg shadow-emerald-500/10"
                  type="button"
                >
                  Verify & Bulk Import ({parsedRows.filter(r => r.status === 'Ready').length})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
