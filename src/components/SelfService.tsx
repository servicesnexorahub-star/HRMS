import { useState, FormEvent } from 'react';
import { Employee, AttendanceRecord, LeaveRequest, Payslip, PerformanceReview, LeaveBalance } from '../types';
import { MapPin, LogIn, LogOut, Clock, Calendar, Download, Award, X } from 'lucide-react';

interface SelfServiceProps {
  currentActor: Employee;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payslips: Payslip[];
  reviews: PerformanceReview[];
  leaveBalances: Record<string, LeaveBalance>;
  onAddAttendance: (rec: AttendanceRecord) => void;
  onUpdateAttendance: (rec: AttendanceRecord) => void;
  onAddLeaveRequest: (req: LeaveRequest) => void;
}

export default function SelfService({ currentActor, attendance, leaves, payslips, reviews, leaveBalances, onAddAttendance, onUpdateAttendance, onAddLeaveRequest }: SelfServiceProps) {
  const [wfhChecked, setWfhChecked] = useState(false);
  const [showApplyLeave, setShowApplyLeave] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Earned' | 'Comp-Off'>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Regularization request form states
  const [regDate, setRegDate] = useState('');
  const [regReason, setRegReason] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);

  // Filter local logs for checked in person
  const myAttendance = attendance.filter(r => r.employeeId === currentActor.employeeId);
  const myLeaves = leaves.filter(l => l.employeeId === currentActor.employeeId);
  const myPayslips = payslips.filter(p => p.employeeId === currentActor.employeeId);
  const myReviews = reviews.filter(r => r.employeeId === currentActor.employeeId);
  const myBalance = leaveBalances[currentActor.employeeId] || { Casual: 8, Sick: 8, Earned: 12, CompOff: 1 };

  // Current states punch
  const todayStr = "2026-06-12"; // simulated today
  const todayRecord = myAttendance.find(r => r.date === todayStr);

  const handlePunchIn = () => {
    if (todayRecord) {
      alert("You have already checked-in today.");
      return;
    }

    const currentHour = new Date().toTimeString().slice(0, 5); // e.g. "09:12"
    const status: AttendanceRecord['status'] = currentHour > "09:30" ? "Late" : "Present";

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentActor.employeeId,
      date: todayStr,
      checkIn: currentHour,
      status,
      workFromHome: wfhChecked,
      overtimeHours: 0
    };

    onAddAttendance(newRec);
    alert(`Successfully clocked-in today at ${currentHour} via ${wfhChecked ? "WFH Remote Connection" : "HQ Office Gateway"}`);
  };

  const handlePunchOut = () => {
    if (!todayRecord) {
      alert("Please check-in first before clocking-out.");
      return;
    }
    if (todayRecord.checkOut) {
      alert("You have already clocked-out today.");
      return;
    }

    const currentHour = new Date().toTimeString().slice(0, 5); // e.g. "18:05"

    // Calculate simulated overtime hours if any (after 18:00)
    let overtimeHours = 0;
    if (currentHour > "18:00") {
      const [sh, sm] = "18:00".split(':').map(Number);
      const [eh, em] = currentHour.split(':').map(Number);
      const diffMs = (eh * 60 + em) - (sh * 60 + sm);
      overtimeHours = Math.round((diffMs / 60) * 10) / 10;
    }

    const updatedRec: AttendanceRecord = {
      ...todayRecord,
      checkOut: currentHour,
      overtimeHours
    };

    onUpdateAttendance(updatedRec);
    alert(`Clocked-out successfully today at ${currentHour}. Recorded simulated overtime: ${overtimeHours} hours.`);
  };

  const fileLocalLeave = (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert("All fields must be set to file leave request.");
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentActor.employeeId,
      employeeName: `${currentActor.firstName} ${currentActor.lastName}`,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    onAddLeaveRequest(newRequest);
    setShowApplyLeave(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    alert("Leave request submitted successfully. Awaiting HR panel response.");
  };

  const handleRequestRegularisation = (e: FormEvent) => {
    e.preventDefault();
    if (!regDate || !regReason) {
      alert("Please set correction date and reason.");
      return;
    }

    const correctionRecord: AttendanceRecord = {
      id: `att-reg-${Date.now()}`,
      employeeId: currentActor.employeeId,
      date: regDate,
      checkIn: "00:00",
      status: "Absent",
      workFromHome: false,
      overtimeHours: 0,
      regularizationRequested: true,
      regularizationReason: regReason,
      regularizationStatus: "Pending"
    };

    onAddAttendance(correctionRecord);
    setRegDate('');
    setRegReason('');
    setShowRegForm(false);
    alert("Regularization request submitted. Checked under audits block.");
  };

  return (
    <div className="space-y-6" id="self-service">
      {/* Upper header banner representing user login credentials */}
      <div className="bg-[#111114] rounded-2xl p-6 border border-slate-800/80 shadow-md flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-600/10 text-emerald-400 font-extrabold text-lg border border-emerald-500/25 flex items-center justify-center font-sans tracking-wide">
            {currentActor.firstName[0]}{currentActor.lastName[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-display leading-tight">{currentActor.firstName} {currentActor.lastName}</h2>
            <p className="text-xs text-slate-400 font-sans">{currentActor.designation} • {currentActor.department} division</p>
            <span className="inline-block text-[10px] text-emerald-400 font-mono font-semibold">{currentActor.employeeId}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-[#09090b] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-350">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">IP GATEWAY</span>
            <span>192.168.1.58</span>
          </div>
          <div className="bg-[#09090b] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-350">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">ACCESS LEVEL</span>
            <span>ACTOR_SELF_SERVICE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Punch in check console */}
        <div className="space-y-6">
          <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Check-In Console (Today: June 12)
            </h3>

            {todayRecord ? (
              <div className="bg-[#09090b]/40 border border-slate-850 rounded-xl p-4 space-y-2 text-xs text-slate-300 font-sans">
                <span className="block text-[9px] uppercase font-mono text-slate-500 font-semibold">ACTIVE REGISTRATION IN</span>
                <p className="font-semibold">In Time: <span className="font-mono text-emerald-400">{todayRecord.checkIn}</span></p>
                {todayRecord.checkOut ? (
                  <p className="font-semibold">Out Time: <span className="font-mono text-emerald-400">{todayRecord.checkOut}</span></p>
                ) : (
                  <p className="italic text-slate-500 font-sans text-[11px] mt-1">Active in session. Keep connection intact.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans">No punches recorded today. Set WFH status as needed and check-in to begin logs.</p>
            )}

            {/* Checkbox WFH */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wfh-toggle"
                checked={wfhChecked}
                onChange={(e) => setWfhChecked(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 border-slate-800 rounded-md cursor-pointer"
              />
              <label htmlFor="wfh-toggle" className="text-xs text-slate-400 cursor-pointer font-sans select-none flex items-center gap-1.5 hover:text-white transition">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Working from Home (Remote Sync)
              </label>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={handlePunchIn}
                disabled={!!todayRecord}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500 py-3 rounded-lg font-bold font-sans cursor-pointer transition-all shadow-md shadow-emerald-500/10"
              >
                <LogIn className="w-4 h-4" />
                Check-In
              </button>
              <button
                onClick={handlePunchOut}
                disabled={!todayRecord || !!todayRecord.checkOut}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 border-slate-700 hover:bg-slate-700 text-white disabled:opacity-40 py-3 rounded-lg font-bold font-sans cursor-pointer transition-all border border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Check-Out
              </button>
            </div>
          </div>

          {/* Leave quota tracker */}
          <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-5 space-y-4 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Leave Balances</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="border border-slate-850 rounded-xl p-3 bg-[#09090b]/20">
                <span className="block text-slate-500 font-sans">Casual</span>
                <span className="block font-bold text-white font-sans mt-0.5">{myBalance.Casual} Bal</span>
              </div>
              <div className="border border-slate-850 rounded-xl p-3 bg-[#09090b]/20">
                <span className="block text-slate-500 font-sans">Sick</span>
                <span className="block font-bold text-white font-sans mt-0.5">{myBalance.Sick} Bal</span>
              </div>
              <div className="border border-slate-850 rounded-xl p-3 bg-[#09090b]/20">
                <span className="block text-slate-500 font-sans">Earned</span>
                <span className="block font-bold text-white font-sans mt-0.5">{myBalance.Earned} Bal</span>
              </div>
              <div className="border border-slate-850 rounded-xl p-3 bg-[#09090b]/20">
                <span className="block text-slate-500 font-sans">Comp-Off</span>
                <span className="block font-bold text-white font-sans mt-0.5">{myBalance.CompOff} Bal</span>
              </div>
            </div>
            <button
              onClick={() => setShowApplyLeave(true)}
              className="w-full text-center bg-[#09090b] hover:bg-slate-800 text-slate-350 border border-slate-800 rounded-lg text-xs font-semibold py-2.5 transition-all cursor-pointer font-sans"
            >
              Request Leave Block
            </button>
          </div>

          {/* Regularisation Action Request */}
          <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-5 space-y-3 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Missed Punches Correction</h4>
            <p className="text-[10px] text-slate-500 font-sans mt-1">If you missed punch updates, request a regularization adjustment.</p>
            {showRegForm ? (
              <form onSubmit={handleRequestRegularisation} className="space-y-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono block">DATE TO ADJUST</span>
                  <input required type="date" value={regDate} onChange={(e) => setRegDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 p-2.5 rounded-lg text-white" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono block">JUSTIFICATION</span>
                  <input required type="text" placeholder="Reason (e.g. Card malfunctioning)" value={regReason} onChange={(e) => setRegReason(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 p-2.5 rounded-lg text-white placeholder-slate-600 focus:outline-hidden" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowRegForm(false)} className="w-1/2 p-2 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 font-semibold cursor-pointer transition">Cancel</button>
                  <button type="submit" className="w-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold cursor-pointer transition">Submit Claim</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowRegForm(true)}
                className="w-full text-center bg-[#09090b] hover:bg-slate-800 text-slate-355 border border-slate-800 rounded-lg text-xs font-semibold py-2.5 transition-all cursor-pointer font-sans"
              >
                File Regularization Claim
              </button>
            )}
          </div>
        </div>

        {/* Dashboard sheets lists */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md p-6 lg:col-span-2 space-y-6 text-xs text-slate-300">
          
          {/* Section: My payslips */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Download className="w-4 h-4 text-emerald-400" />
              My Corporate Payslips
            </h3>
            <div className="space-y-2">
              {myPayslips.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3.5 bg-[#09090b]/45 border border-slate-850 rounded-xl text-xs hover:bg-[#09090b]/60 transition">
                  <div>
                    <span className="font-semibold text-white block font-sans">{p.month} Paid Statement</span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Disbursed net payout: <strong className="text-emerald-450 font-bold">₹{p.netAmount.toLocaleString()}</strong></span>
                  </div>
                  <span className="inline-block bg-emerald-500/10 text-emerald-450 font-mono text-[10px] border border-emerald-500/20 px-2.5 py-1 rounded-md font-semibold">
                    Paid Checked
                  </span>
                </div>
              ))}
              {myPayslips.length === 0 && (
                <p className="text-slate-500 font-sans italic">No pay statements released yet for this active profile.</p>
              )}
            </div>
          </div>

          {/* Section: My Leaves status */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              My Leave Requests History
            </h3>
            <div className="space-y-2">
              {myLeaves.map(l => (
                <div key={l.id} className="flex justify-between items-center bg-[#09090b]/45 border border-slate-850 rounded-xl p-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-white font-sans block">{l.leaveType} Leave Request</span>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{l.startDate} to {l.endDate} • "{l.reason}"</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] border ${
                    l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    l.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))}
              {myLeaves.length === 0 && (
                <p className="text-slate-500 font-sans italic">No leave requests logged in archive.</p>
              )}
            </div>
          </div>

          {/* Section: Performance review evaluation */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Award className="w-4 h-4 text-amber-400" />
              My Appraisal Feedback
            </h3>
            <div className="space-y-3">
              {myReviews.map(r => (
                <div key={r.id} className="border border-slate-800 border-dashed rounded-xl p-4.5 bg-[#09090b]/20 space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-semibold text-white font-sans block">{r.reviewPeriod} Review Outcome</span>
                      {r.appraisalRating && (
                        <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5 block">Overall Score: <span className="text-amber-400 font-bold font-mono">{r.appraisalRating} / 5</span></span>
                      )}
                    </div>
                    <span className="bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-md font-sans">
                      {r.status}
                    </span>
                  </div>

                  <div className="bg-[#09090b] border border-slate-850 rounded-xl p-4 text-[11px] text-slate-300 leading-relaxed space-y-2">
                    {r.selfEvaluation && (
                      <p className="text-slate-400"><strong className="text-slate-300">Your self-eval:</strong> "{r.selfEvaluation}"</p>
                    )}
                    {r.managerComments && (
                      <p className="text-slate-300"><strong className="text-emerald-400">Supervisor Feedback comments:</strong> "{r.managerComments}"</p>
                    )}
                  </div>
                </div>
              ))}
              {myReviews.length === 0 && (
                <p className="text-slate-500 font-sans italic">Appraisals loops not released for this evaluation window yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Embedded slide apply form modal */}
      {showApplyLeave && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111114] rounded-2xl shadow-xl w-full max-w-sm border border-slate-800 overflow-hidden text-xs text-slate-300">
            <div className="px-6 py-4.5 bg-[#09090b] text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-emerald-400 font-display">Request Period Absence</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">File leave for executive approvals.</p>
              </div>
              <button onClick={() => setShowApplyLeave(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={fileLocalLeave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Policy Category</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as any)} className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-200 font-sans focus:outline-hidden">
                  <option value="Casual">Casual Leave (Paid)</option>
                  <option value="Sick">Sick Leave (Medical Paid)</option>
                  <option value="Earned">Earned Privilege Leave</option>
                  <option value="Comp-Off">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Start Date</label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 p-2 rounded-lg text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">End Date</label>
                  <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#09090b] border border-slate-800 p-2 rounded-lg text-xs text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Reason of absence</label>
                <textarea required placeholder="Brief reason guidelines..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full bg-[#09090b] border border-slate-800 p-2.5 rounded-lg text-white placeholder-slate-600 resize-none focus:outline-hidden focus:border-emerald-500/50" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowApplyLeave(false)} className="px-4 py-2 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 transition font-sans font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-sans font-semibold cursor-pointer shadow-lg shadow-emerald-500/10">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
