import { useState, FormEvent } from 'react';
import { AuditLog, SystemSettings } from '../types';
import { Settings, Shield, ClipboardList } from 'lucide-react';

interface AdminDashboardProps {
  auditLogs: AuditLog[];
  settings: SystemSettings;
  onUpdateSettings: (updatedSettings: SystemSettings) => void;
  onClearLogs?: () => void;
}

export default function AdminDashboard({ auditLogs, settings, onUpdateSettings }: AdminDashboardProps) {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [cutoffDate, setCutoffDate] = useState(settings.cutoffDate.toString());
  const [pfRate, setPfRate] = useState(settings.pfRate.toString());
  const [esiRate, setEsiRate] = useState(settings.esiRate.toString());

  // Org structures input states
  const [branches, setBranches] = useState<string[]>(settings.orgStructureBranches);
  const [departments, setDepartments] = useState<string[]>(settings.orgStructureDepartments);
  const [newBranch, setNewBranch] = useState('');
  const [newDept, setNewDept] = useState('');

  const handleUpdateConfig = (e: FormEvent) => {
    e.preventDefault();
    const updated: SystemSettings = {
      companyName,
      orgStructureBranches: branches,
      orgStructureDepartments: departments,
      cutoffDate: parseInt(cutoffDate) || 25,
      minimumHoursForPresent: settings.minimumHoursForPresent,
      pfRate: parseFloat(pfRate) || 12,
      esiRate: parseFloat(esiRate) || 0.75,
    };
    onUpdateSettings(updated);
    alert("System settings and compliance variables committed successfully under audit code SYS-CONF-UP.");
  };

  const handleAddBranch = () => {
    if (!newBranch) return;
    if (branches.includes(newBranch)) {
      alert("Branch already exists.");
      return;
    }
    setBranches([...branches, newBranch]);
    setNewBranch('');
  };

  const handleAddDept = () => {
    if (!newDept) return;
    if (departments.includes(newDept)) {
      alert("Department already exists.");
      return;
    }
    setDepartments([...departments, newDept]);
    setNewDept('');
  };

  const handleRemoveBranch = (b: string) => {
    setBranches(branches.filter(item => item !== b));
  };

  const handleRemoveDept = (d: string) => {
    setDepartments(departments.filter(item => item !== d));
  };

  return (
    <div className="space-y-6" id="admin-dashboard">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">System Settings & Auditing</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5 font-sans">Define master variables, manage branch/department structures, adjust compliance rates and audit operational logs.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-3 py-1.5 text-[11px] font-semibold font-sans">
          <Shield className="w-4 h-4 text-red-500" />
          SECURE AUDIT CONSOLE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Settings Panel */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-6 space-y-6 lg:col-span-1 text-xs shadow-md">
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Organizational Parameters
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Control enterprise variables and structure boundaries.</p>
          </div>

          <form onSubmit={handleUpdateConfig} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Organization Label</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400">Provident rate (PF %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pfRate}
                  onChange={(e) => setPfRate(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400">Insurance rate (ESI %)</label>
                <input
                  type="number"
                  step="0.01"
                  value={esiRate}
                  onChange={(e) => setEsiRate(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Monthly wage cycle cutoff date</label>
              <input
                type="number"
                min="1"
                max="31"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
              />
              <span className="text-[9px] text-slate-500 font-sans block mt-1">Day on which attendance logs freeze for payroll generation.</span>
            </div>

            {/* Manage Branches */}
            <div className="space-y-2 border-t border-slate-800/40 pt-3.5">
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Office Branches ({branches.length})</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {branches.map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 bg-[#09090b] text-slate-200 font-sans text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-800">
                    {b}
                    <button type="button" onClick={() => handleRemoveBranch(b)} className="text-slate-500 hover:text-red-400 focus:outline-hidden font-bold leading-none">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Location Hub..."
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="flex-1 bg-[#09090b] border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="bg-slate-800 text-white rounded-lg px-3 py-2 font-bold hover:bg-slate-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Manage Departments */}
            <div className="space-y-2 border-t border-slate-800/40 pt-3.5">
              <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Corporate Departments ({departments.length})</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {departments.map(d => (
                  <span key={d} className="inline-flex items-center gap-1.5 bg-[#09090b] text-slate-200 font-sans text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-800">
                    {d}
                    <button type="button" onClick={() => handleRemoveDept(d)} className="text-slate-500 hover:text-red-400 focus:outline-hidden font-bold leading-none">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Department..."
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="flex-1 bg-[#09090b] border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-hidden focus:border-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddDept}
                  className="bg-slate-800 text-white rounded-lg px-3 py-2 font-bold hover:bg-slate-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer font-sans shadow-lg shadow-emerald-500/10"
            >
              Verify & Commit Settings
            </button>
          </form>
        </div>

        {/* Right: Security Audit Logs */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-6 space-y-4 lg:col-span-2 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-800/30 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                Operational History & Security Audits
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time immutable tracking of corporate edits, payroll runs, status changes, and administrative overrides.</p>
            </div>
          </div>

          {/* Audit logs timeline */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="border border-slate-850 rounded-xl p-4 bg-[#09090b]/40 space-y-2 text-xs transition-all hover:bg-[#09090b] hover:border-slate-800">
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                      {log.role}
                    </span>
                    <span className="font-semibold text-slate-300 font-sans">{log.userEmail}</span>
                  </div>
                  <span className="font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString() || log.timestamp}</span>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-100 font-sans block">{log.action}</span>
                  <p className="text-slate-400 font-sans leading-normal leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center py-10 text-slate-500 font-sans font-sans">No security overrides recorded in active cache.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
