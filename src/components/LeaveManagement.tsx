import { useState, FormEvent } from 'react';
import { LeaveRequest, Employee, LeaveBalance } from '../types';
import { Calendar, Filter, Check, X } from 'lucide-react';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  leaveBalances: Record<string, LeaveBalance>;
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onUpdateLeaveStatus: (requestId: string, status: 'Approved' | 'Rejected', actor: string) => void;
  currentActor: Employee;
}

export default function LeaveManagement({ leaves, employees, leaveBalances, onAddLeaveRequest, onUpdateLeaveStatus, currentActor }: LeaveManagementProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Form fields
  const [selectedEmpId, setSelectedEmpId] = useState(currentActor.employeeId);
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Comp-Off'>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Balance lookup for active actor
  const activeBalance = leaveBalances[selectedEmpId] || { Casual: 8, Sick: 8, Earned: 12, CompOff: 1 };

  const handleApplyLeave = (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert("All fields are mandatory to file a leave application.");
      return;
    }

    const emp = employees.find(e => e.employeeId === selectedEmpId);
    const orderName = emp ? `${emp.firstName} ${emp.lastName}` : "Employee";

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: selectedEmpId,
      employeeName: orderName,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    onAddLeaveRequest(newRequest);
    setShowApplyModal(false);

    // reset fields
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const filteredLeaves = leaves.filter(l => {
    return filterStatus === 'All' || l.status === filterStatus;
  });

  return (
    <div className="space-y-6" id="leave-management">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Leave Trackers & Workflows</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Accrue leaves, manage approvals, publish holidays calendars and calculate policy metrics.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all font-sans cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <Calendar className="w-4 h-4" />
          File Leave Request
        </button>
      </div>

      {/* Leave balance quotas overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold block">Casual Leave Quota</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-white">{activeBalance.Casual}</span>
            <span className="text-xs text-slate-400 font-sans">Days Left</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1.5 font-sans">Accrues 1.25 days/mo</p>
        </div>

        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold block">Sick leave quota</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-white">{activeBalance.Sick}</span>
            <span className="text-xs text-slate-400 font-sans">Days Left</span>
          </div>
          <p className="text-[10px] text-cyan-400 font-semibold mt-1.5 font-sans">Fully paid medical check</p>
        </div>

        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold block">Earned / Privilege</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-white">{activeBalance.Earned}</span>
            <span className="text-xs text-slate-400 font-sans">Days Left</span>
          </div>
          <p className="text-[10px] text-indigo-400 font-semibold mt-1.5 font-sans">Encashable annually</p>
        </div>

        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold block">Compensatory Offs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-display text-white">{activeBalance.CompOff}</span>
            <span className="text-xs text-slate-400 font-sans">Balanced</span>
          </div>
          <p className="text-[10px] text-amber-400 font-semibold mt-1.5 font-sans">Accrued from sprints</p>
        </div>
      </div>

      {/* Requests table listing */}
      <div className="bg-[#111114] border border-slate-800/50 shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#09090b]/45 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Leave Petitions & Approval Pools</h3>
            <p className="text-[10px] text-slate-400 font-sans">Review active leave letters and tracking outcomes.</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold font-sans">Filter:</span>
            <div className="inline-flex rounded-lg bg-[#09090b] border border-slate-850 p-1">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-md text-[10px] font-sans font-medium transition-all cursor-pointer ${
                    filterStatus === st 
                      ? 'bg-slate-800 text-white font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#09090b]/45 text-[10px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-850">
                <th className="p-4 font-semibold">Requester Detail</th>
                <th className="p-4 font-semibold">Leave Type</th>
                <th className="p-4 font-semibold">Duration Schedule</th>
                <th className="p-4 font-semibold">Declaration Reason</th>
                <th className="p-4 font-semibold">Decision</th>
                <th className="p-4 font-semibold text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {filteredLeaves.map((req) => (
                <tr key={req.id} className="hover:bg-[#09090b]/40 transition-all">
                  <td className="p-4">
                    <span className="block font-semibold text-white font-sans">{req.employeeName}</span>
                    <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{req.employeeId}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block bg-[#09090b] text-slate-300 font-mono text-[10px] font-medium px-2.5 py-1 rounded-md border border-slate-800">
                      {req.leaveType}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-300 font-medium">
                    {req.startDate} <span className="text-slate-500">to</span> {req.endDate}
                  </td>
                  <td className="p-4 max-w-xs text-slate-400 italic">
                    "{req.reason}"
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onUpdateLeaveStatus(req.id, 'Rejected', currentActor.firstName)}
                          className="p-1.5 hover:bg-red-500/15 text-red-400 rounded-md border border-slate-800 hover:border-red-500/25 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateLeaveStatus(req.id, 'Approved', currentActor.firstName)}
                          className="p-1.5 hover:bg-emerald-500/15 text-emerald-400 rounded-md border border-slate-800 hover:border-emerald-500/25 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        Resolved by {req.approvedBy || "HR Admin"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No active leave records found matching selection guidelines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Holiday calendar summary */}
      <div className="bg-[#111114] border border-slate-800/50 rounded-2xl p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Upcoming Holiday Calendar (2026 Q3)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-xl">
            <span className="block font-mono text-emerald-400 font-bold mb-1">AUG 15</span>
            <span className="block font-semibold text-slate-200 font-sans">Independence Day</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-1">National holiday</span>
          </div>

          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-xl">
            <span className="block font-mono text-cyan-400 font-bold mb-1">AUG 27</span>
            <span className="block font-semibold text-slate-200 font-sans">Raksha Bandhan</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-1">Regional Alternate</span>
          </div>

          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-xl">
            <span className="block font-mono text-indigo-400 font-bold mb-1">SEP 04</span>
            <span className="block font-semibold text-slate-200 font-sans">Ganesh Chaturthi</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-1">Maharashtra Festivity</span>
          </div>

          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-xl">
            <span className="block font-mono text-fuchsia-400 font-bold mb-1">OCT 02</span>
            <span className="block font-semibold text-slate-200 font-sans">Gandhi Jayanti</span>
            <span className="block text-[10px] text-slate-500 font-sans mt-1">National Holiday</span>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal Form */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111114] rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden text-xs">
            <div className="px-6 py-4.5 bg-[#09090b] text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-400 font-display">New Leave Petition</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">File a direct leave claim for executive approval.</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              {/* User switcher inside simulation */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Filing on behalf of</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-200"
                >
                  {employees.map(e => (
                    <option key={e.employeeId} value={e.employeeId}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Leave Policy Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-200"
                >
                  <option value="Casual">Casual Leave (Paid)</option>
                  <option value="Sick">Sick Leave (Paid Medical)</option>
                  <option value="Earned">Earned / Privilege (Paid)</option>
                  <option value="Comp-Off">Compensatory Off</option>
                  <option value="Maternity">Maternity Leave (6 Months Paid)</option>
                  <option value="Paternity">Paternity Leave (15 Days Paid)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Start Date</label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">End Date</label>
                  <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Reason of Absence</label>
                <textarea
                  required
                  placeholder="Justify leave request reason clearly for legal/management approval..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 placeholder-slate-600 text-white resize-none focus:outline-hidden focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 border border-slate-800 text-slate-400 font-sans rounded-lg hover:bg-slate-800 transition font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-sans font-semibold cursor-pointer shadow-lg shadow-emerald-500/10">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
