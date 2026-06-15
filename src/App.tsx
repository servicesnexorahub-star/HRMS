import { useState, useEffect } from 'react';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  Payslip, 
  PerformanceReview, 
  AuditLog, 
  SystemSettings,
  LeaveBalance 
} from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_BALANCES, 
  INITIAL_LEAVES, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAYSLIPS, 
  INITIAL_REVIEWS, 
  INITIAL_AUDIT_LOGS 
} from './data';

// Component imports
import HRDashboard from './components/HRDashboard';
import EmployeeManagement from './components/EmployeeManagement';
import AttendanceManagement from './components/AttendanceManagement';
import LeaveManagement from './components/LeaveManagement';
import PayrollManagement from './components/PayrollManagement';
import PerformanceManagement from './components/PerformanceManagement';
import SelfService from './components/SelfService';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ChangePasswordModal from './components/ChangePasswordModal';

// Lucide Icons
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CalendarRange, 
  Receipt, 
  TrendingUp, 
  MonitorPlay, 
  Settings, 
  Activity, 
  UserSquare, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  FileText,
  KeyRound
} from 'lucide-react';

export default function App() {
  // Primary States (initialized with localStorage backups)
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const cached = localStorage.getItem('hrms_settings');
    return cached ? JSON.parse(cached) : INITIAL_SETTINGS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const cached = localStorage.getItem('hrms_employees');
    return cached ? JSON.parse(cached) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem('hrms_attendance');
    return cached ? JSON.parse(cached) : INITIAL_ATTENDANCE;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const cached = localStorage.getItem('hrms_leaves');
    return cached ? JSON.parse(cached) : INITIAL_LEAVES;
  });

  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(() => {
    const cached = localStorage.getItem('hrms_leave_balances');
    return cached ? JSON.parse(cached) : INITIAL_LEAVE_BALANCES;
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const cached = localStorage.getItem('hrms_payslips');
    return cached ? JSON.parse(cached) : INITIAL_PAYSLIPS;
  });

  const [reviews, setReviews] = useState<PerformanceReview[]>(() => {
    const cached = localStorage.getItem('hrms_reviews');
    return cached ? JSON.parse(cached) : INITIAL_REVIEWS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('hrms_audit_logs');
    return cached ? JSON.parse(cached) : INITIAL_AUDIT_LOGS;
  });

  // Simulation Role and tab selections
  const [currentActorEmail, setCurrentActorEmail] = useState<string | null>(() => {
    return localStorage.getItem('hrms_current_user_email');
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'performance' | 'ess' | 'admin'>('dashboard');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Synchronise state to local storage for realistic persistence
  useEffect(() => {
    localStorage.setItem('hrms_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hrms_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('hrms_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('hrms_leave_balances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('hrms_payslips', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem('hrms_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hrms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Find active simulation actor details
  const activeActorEmployee = employees.find(e => e.email.toLowerCase() === (currentActorEmail || '').toLowerCase()) || employees[0];

  // Derive Role Clearance text
  const getRoleLabel = (): string => {
    if (!currentActorEmail) return 'Guest/View Only User';
    const matched = employees.find(e => e.email.toLowerCase() === currentActorEmail.toLowerCase());
    if (matched) {
      return matched.systemPrivilege;
    }
    if (currentActorEmail.toLowerCase() === 'rajiv.mehta@acme.com') return 'Super Administrator';
    return 'Employee';
  };

  // Helper: Log actions securely
  const logSystemAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentActorEmail || 'anonymous@acme.com',
      role: getRoleLabel(),
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLoginSuccess = (email: string) => {
    setCurrentActorEmail(email);
    localStorage.setItem('hrms_current_user_email', email);
    
    const matched = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    const role = matched 
      ? matched.systemPrivilege 
      : (email.toLowerCase() === 'rajiv.mehta@acme.com' ? 'Super Administrator' : 'Employee');

    // Anyone other than simple 'Employee' or 'Guest/View Only User' gets the full management dashboard
    const isManagementRole = role !== 'Employee' && role !== 'Guest/View Only User';

    if (isManagementRole) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('ess');
    }

    const loginLog: AuditLog = {
      id: `log-login-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: email,
      role,
      action: "Session Authorized",
      details: `${matched ? `${matched.firstName} ${matched.lastName}` : "Personnel"} successfully completed secure session login via intranet portal`
    };
    setAuditLogs(prev => [loginLog, ...prev]);
  };

  const handleLogOut = () => {
    if (currentActorEmail) {
      const matched = employees.find(e => e.email.toLowerCase() === currentActorEmail.toLowerCase());
      const logoutLog: AuditLog = {
        id: `log-logout-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: currentActorEmail,
        role: getRoleLabel(),
        action: "Session Terminated",
        details: `${matched ? `${matched.firstName} ${matched.lastName}` : "Personnel"} securely logged out of session gateway`
      };
      setAuditLogs(prev => [logoutLog, ...prev]);
    }
    setCurrentActorEmail(null);
    localStorage.removeItem('hrms_current_user_email');
  };

  const handleUpdatePassword = (email: string, newPass: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.email.toLowerCase() === email.toLowerCase()) {
        const currentDateStr = new Date().toISOString().split('T')[0];
        const newHistoryItem = {
          date: currentDateStr,
          type: 'SettingsUpdate' as const,
          description: "Personnel custom password key changed via secure self-service action dashboard."
        };
        return {
          ...emp,
          customPassword: newPass,
          history: [...emp.history, newHistoryItem]
        };
      }
      return emp;
    }));
    logSystemAction("Password Change", `Credentials updated securely for ${email}`);
  };

  // State Manipulators
  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
    logSystemAction("Onboard Employee", `Successfully onboarded ${newEmployee.firstName} ${newEmployee.lastName} to ${newEmployee.branch}`);
  };

  const handleBulkAddEmployees = (newEmployees: Employee[]) => {
    setEmployees(prev => [...prev, ...newEmployees]);
    logSystemAction("Bulk Import Employees", `Successfully parsed and bulk imported ${newEmployees.length} profiles via Excel document upload`);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    logSystemAction("Update Employee profile", `Modified career paths or settings for ${updatedEmployee.firstName} ${updatedEmployee.lastName}`);
  };

  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
    logSystemAction("Punch Entry", `Clock punch recorded for Employee ID ${record.employeeId} on ${record.date}`);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => prev.map(r => r.id === record.id ? record : r));
    const emp = employees.find(e => e.employeeId === record.employeeId);
    logSystemAction("Attendance Update", `Approved stabilization corrections for ${emp ? emp.firstName : "unknown ID"} on ${record.date}`);
  };

  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaves(prev => [req, ...prev]);
    logSystemAction("Leave claim filed", `${req.employeeName} applied for ${req.leaveType} leave starting ${req.startDate}`);
  };

  // Resolve Leave Approvals
  const handleUpdateLeaveStatus = (requestId: string, status: 'Approved' | 'Rejected', actor: string) => {
    setLeaves(prev => prev.map(req => {
      if (req.id === requestId) {
        // adjust balance if approved
        if (status === 'Approved') {
          const daysOff = Math.round((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
          const currentBal = leaveBalances[req.employeeId] || { Casual: 8, Sick: 8, Earned: 12, CompOff: 1 };
          const leaveVal = req.leaveType as keyof LeaveBalance;
          
          if (currentBal[leaveVal]) {
            const updatedBal = {
              ...currentBal,
              [leaveVal]: Math.max(0, currentBal[leaveVal] - daysOff)
            };
            setLeaveBalances(prevBalances => ({
              ...prevBalances,
              [req.employeeId]: updatedBal
            }));
          }
        }

        return {
          ...req,
          status,
          approvedBy: actor
        };
      }
      return req;
    }));

    const targetRequest = leaves.find(l => l.id === requestId);
    logSystemAction("Leave Resolution", `Authority ${actor} resolved leave claim request (${requestId}) as ${status} for ${targetRequest ? targetRequest.employeeName : "Employee"}`);
  };

  // Generate compliance payroll run
  const handleGeneratePayroll = (month: string, generatedSlips: Payslip[]) => {
    setPayslips(prev => {
      // filter out same month slips if already existed
      const filtered = prev.filter(p => p.month !== month);
      return [...filtered, ...generatedSlips];
    });
    logSystemAction("Payroll Generated", `Executed payroll calculations and distributed pay statements for cycle period: ${month}`);
  };

  const handleUpdateEmployeeSalary = (employeeId: string, updatedSalary: Employee['salaryStructure']) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.employeeId === employeeId) {
        return {
          ...emp,
          salaryStructure: updatedSalary
        };
      }
      return emp;
    }));
    logSystemAction("Salary Modified", `Modified basic components rules and withholding variables for Employee: ${employeeId}`);
  };

  // Appraisals loop closure
  const handleCommitEvaluation = (reviewId: string, updatedReview: PerformanceReview) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
    logSystemAction("Evaluation Committed", `Final evaluation metrics logged under appraisal ref ID rev-${reviewId} for ${updatedReview.employeeName}`);
  };

  if (!currentActorEmail) {
    return <Login employees={employees} onLoginSuccess={handleLoginSuccess} />;
  }

  const userRole = getRoleLabel();
  const isSuperOrSystemAdmin = 
    userRole === 'Super Administrator' || 
    userRole === 'System Administrator' || 
    userRole === 'IT Administrator';

  const isManagement = 
    userRole !== 'Employee' && 
    userRole !== 'Guest/View Only User';

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 flex flex-col font-sans select-none antialiased">
      
      {/* Dynamic Simulation Top Control Bar */}
      <div className="bg-[#111114] border-b border-slate-800/50 py-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 z-10 shadow-md">
        <div className="flex items-center gap-2.5">
          {/* Company Brand Logo Grid */}
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold text-sm tracking-tighter">
            Æ
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight font-display">Acme Enterprise HRMS</h1>
            <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Intranet Portal Hub</span>
          </div>
        </div>

        {/* Secure Authenticated Agent Session Details */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#09090b] border border-slate-800/80 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[9px] border border-emerald-500/20">
              {activeActorEmployee.firstName[0]}{activeActorEmployee.lastName[0]}
            </div>
            <div className="leading-tight text-left">
              <span className="block text-[8px] text-slate-500 font-mono leading-none">Session Connected</span>
              <span className="block font-bold text-white mt-0.5 leading-none font-sans">
                {activeActorEmployee.firstName} {activeActorEmployee.lastName}
              </span>
            </div>
            <span className="text-[8px] font-mono font-extrabold px-1.5 py-0.5 ml-1 bg-slate-900/80 border border-slate-800 rounded text-slate-400 uppercase tracking-wider">
              {userRole}
            </span>
          </div>

          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-950/20 hover:bg-emerald-900/20 border border-emerald-900/30 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-350 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md"
            type="button"
            id="change_password_trigger"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </button>

          <button
            onClick={handleLogOut}
            className="inline-flex items-center gap-1.5 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 hover:border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md"
            type="button"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Corporate layout containing workspace side rails */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        
        {/* Navigation Rail for RBAC checks */}
        <aside className="w-64 bg-[#111114] border-r border-slate-800/50 p-5 flex flex-col justify-between space-y-8 flex-shrink-0">
          <div className="space-y-6">
            
            {/* Dynamic visual indicator profile context */}
            <div className="bg-[#09090b] border border-slate-800/80 rounded-xl p-3.5 text-xs leading-none">
              <span className="block text-[8px] uppercase font-mono text-slate-500 font-bold mb-1">Clearance</span>
              <span className="block font-bold text-white font-sans text-xs">{userRole}</span>
              <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block font-medium">{activeActorEmployee.firstName} {activeActorEmployee.lastName}</span>
            </div>

            {/* Menu List */}
            <nav className="space-y-1.5 text-xs font-semibold font-sans">
              
              {/* Only Executive Admin / HR Roles can see executive options */}
              {isManagement && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Analytics Dashboard
                  </button>

                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'employees' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Employee Master
                  </button>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'attendance' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Daily Attendance
                  </button>

                  <button
                    onClick={() => setActiveTab('leaves')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'leaves' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    Leaves Manager
                  </button>

                  <button
                    onClick={() => setActiveTab('payroll')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'payroll' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    Payroll & Compliance
                  </button>

                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      activeTab === 'performance' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    KPI Appraisals
                  </button>
                </>
              )}

              {/* Both Admins AND Employees can see ESS portal */}
              <button
                onClick={() => setActiveTab('ess')}
                className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'ess' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                }`}
              >
                <MonitorPlay className="w-4 h-4" />
                Employee portal (ESS)
              </button>

              {/* Only Super Administrators can see secure settings & Audit Console */}
              {isSuperOrSystemAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                    activeTab === 'admin' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border border-transparent'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Audit & Settings
                </button>
              )}

            </nav>
          </div>

          <div className="space-y-4 text-[11px] text-slate-500 font-sans">
            <div className="flex items-center gap-1.5 pt-4 border-t border-slate-800/50">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status: Online-Intranet</span>
            </div>
            <p className="leading-relaxed">Intranet cluster authenticated through enterprise secure LDAP protocols.</p>
          </div>
        </aside>

        {/* Content View Workspace Workspace Area */}
        <main className="flex-1 bg-[#09090b] p-8 overflow-y-auto max-h-[calc(100vh-63px)]">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && isManagement && (
              <HRDashboard 
                employees={employees} 
                leaves={leaves}
                attendance={attendance}
                payslips={payslips}
              />
            )}

            {activeTab === 'employees' && isManagement && (
              <EmployeeManagement 
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onBulkAddEmployees={handleBulkAddEmployees}
              />
            )}

            {activeTab === 'attendance' && isManagement && (
              <AttendanceManagement 
                attendance={attendance}
                employees={employees}
                onAddAttendance={handleAddAttendance}
                onUpdateAttendance={handleUpdateAttendance}
                currentActor={activeActorEmployee}
              />
            )}

            {activeTab === 'leaves' && isManagement && (
              <LeaveManagement 
                leaves={leaves}
                employees={employees}
                leaveBalances={leaveBalances}
                onAddLeaveRequest={handleAddLeaveRequest}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                currentActor={activeActorEmployee}
              />
            )}

            {activeTab === 'payroll' && isManagement && (
              <PayrollManagement 
                payslips={payslips}
                employees={employees}
                settings={settings}
                onGeneratePayroll={handleGeneratePayroll}
                onUpdateEmployeeSalary={handleUpdateEmployeeSalary}
              />
            )}

            {activeTab === 'performance' && isManagement && (
              <PerformanceManagement 
                reviews={reviews}
                employees={employees}
                onCommitEvaluation={handleCommitEvaluation}
                currentActor={activeActorEmployee}
              />
            )}

            {activeTab === 'ess' && (
              <SelfService 
                currentActor={activeActorEmployee}
                attendance={attendance}
                leaves={leaves}
                payslips={payslips}
                reviews={reviews}
                leaveBalances={leaveBalances}
                onAddAttendance={handleAddAttendance}
                onUpdateAttendance={handleUpdateAttendance}
                onAddLeaveRequest={handleAddLeaveRequest}
              />
            )}

            {activeTab === 'admin' && isSuperOrSystemAdmin && (
              <AdminDashboard 
                auditLogs={auditLogs}
                settings={settings}
                onUpdateSettings={setSettings}
              />
            )}
          </div>
        </main>

      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal
          currentActor={activeActorEmployee}
          onClose={() => setShowChangePasswordModal(false)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  );
}
