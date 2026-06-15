import { useState } from 'react';
import { AttendanceRecord, Employee } from '../types';
import { Calendar, UserCheck, ShieldAlert, BadgeCheck, Clock, MapPin, Check, X } from 'lucide-react';

interface AttendanceManagementProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  currentActor: Employee;
}

export default function AttendanceManagement({ attendance, employees, onUpdateAttendance }: AttendanceManagementProps) {
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [showShiftConfig, setShowShiftConfig] = useState(false);

  // Filter attendance record
  const currentDaysAttendance = attendance.filter(r => {
    const matchesDate = selectedDateFilter === '' || r.date === selectedDateFilter;
    return matchesDate;
  });

  // Regularization requests to approve/reject
  const pendingRegularizations = attendance.filter(r => r.regularizationRequested && r.regularizationStatus === 'Pending');

  const handleRegularizeAction = (record: AttendanceRecord, status: 'Approved' | 'Rejected') => {
    const updatedRecord: AttendanceRecord = {
      ...record,
      regularizationStatus: status,
      status: status === 'Approved' ? 'Regularized' : record.status,
      checkIn: status === 'Approved' ? '09:00' : record.checkIn, // set to default present time
      checkOut: status === 'Approved' ? '18:00' : record.checkOut,
    };
    onUpdateAttendance(updatedRecord);
  };

  // Quick Stats
  const targetDate = "2026-06-12";
  const todayRecords = attendance.filter(r => r.date === targetDate);
  const presentToday = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Regularized').length;
  const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
  const leaveToday = todayRecords.filter(r => r.status === 'On Leave').length;

  return (
    <div className="space-y-6" id="attendance-management">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Attendance Tracker & Shifts</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Track daily biometric punches, shift configurations, regularization requests and work-status.</p>
        </div>
        <button
          onClick={() => setShowShiftConfig(!showShiftConfig)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-[#111114] hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-lg transition-all font-sans cursor-pointer"
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          Shift Configurations
        </button>
      </div>

      {showShiftConfig && (
        <div className="bg-[#111114] border border-slate-800/60 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-lg">
            <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md mb-2">General Shift (GEN)</span>
            <span className="block font-semibold text-white font-sans">09:00 AM - 06:00 PM</span>
            <span className="block text-slate-400 mt-1">Saturdays/Sundays Off. 45 min grace period for late penalty threshold.</span>
          </div>
          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-lg">
            <span className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md mb-2">Tech Night Rotation (NIGHT)</span>
            <span className="block font-semibold text-white font-sans">09:00 PM - 06:00 AM</span>
            <span className="block text-slate-400 mt-1">Allowance of ₹500/night applied for support engineers.</span>
          </div>
          <div className="bg-[#09090b]/40 p-4 border border-slate-800 rounded-lg">
            <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md mb-2">Sales Field (FIELD)</span>
            <span className="block font-semibold text-white font-sans">Flexible 8 Hours</span>
            <span className="block text-slate-400 mt-1">Requires GPS geofence tagging enabled on mobile devices.</span>
          </div>
        </div>
      )}

      {/* Overview stats table for today */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-semibold tracking-wider">Today's Present (June 12)</span>
            <h3 className="text-xl font-bold font-sans text-white mt-1">{presentToday} Staff</h3>
          </div>
          <UserCheck className="w-8 h-8 text-emerald-400/50" />
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-mono uppercase font-semibold tracking-wider">Sick/Paid Leave</span>
            <h3 className="text-xl font-bold font-sans text-white mt-1">{leaveToday} Staff</h3>
          </div>
          <Calendar className="w-8 h-8 text-amber-400/50" />
        </div>
        <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-400 font-mono uppercase font-semibold tracking-wider">Unexcused Absentees</span>
            <h3 className="text-xl font-bold font-sans text-white mt-1">{absentToday} Staff</h3>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-400/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Punch Activity Table */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 bg-[#09090b]/45 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Active Punches log</h4>
              <p className="text-[10px] text-slate-400 font-sans">Realtime listing filtered by work date.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-sans font-semibold">Filter Date:</span>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="text-xs bg-[#09090b] border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-emerald-500/55"
              />
              {selectedDateFilter && (
                <button onClick={() => setSelectedDateFilter('')} className="text-[10px] hover:text-red-400 text-slate-400 font-mono cursor-pointer transition">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#09090b]/45 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                  <th className="p-4 font-semibold">Employee Name</th>
                  <th className="p-4 font-semibold">Work Date</th>
                  <th className="p-4 font-semibold">In punch</th>
                  <th className="p-4 font-semibold">Out punch</th>
                  <th className="p-4 font-semibold">Status Check</th>
                  <th className="p-4 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {currentDaysAttendance.map((rec) => {
                  const emp = employees.find(e => e.employeeId === rec.employeeId);
                  return (
                    <tr key={rec.id} className="hover:bg-[#09090b]/40 transition-all">
                      <td className="p-4">
                        <span className="block font-semibold text-white font-sans">
                          {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown staff"}
                        </span>
                        <span className="block text-[9px] text-slate-500 font-mono">{rec.employeeId}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400 font-medium">{rec.date}</td>
                      <td className="p-4 font-mono text-slate-200 font-semibold">{rec.checkIn}</td>
                      <td className="p-4 font-mono text-slate-200 font-semibold">{rec.checkOut || "--:--"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border ${
                          rec.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          rec.status === 'Regularized' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          rec.status === 'Late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          rec.status === 'On Leave' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-4 truncate">
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 bg-[#09090b]/30 px-2 py-1 rounded-md border border-slate-850">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {rec.workFromHome ? "WFH (VPN)" : "HQ Biometric"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {currentDaysAttendance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      No attendance log found matching chosen schedule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regularization Approvals Side Panel */}
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 shadow-md p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">Regularization requests</h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Staff requests to correct missed/late punches due to official reasons.</p>
          </div>

          <div className="space-y-3">
            {pendingRegularizations.map((req) => {
              const emp = employees.find(e => e.employeeId === req.employeeId);
              return (
                <div key={req.id} className="border border-slate-850 rounded-xl p-4 space-y-3 bg-[#09090b]/40">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="block font-semibold text-white font-sans">{emp ? `${emp.firstName} ${emp.lastName}` : "Employee"}</span>
                      <span className="block text-[9px] font-mono text-slate-500">{req.employeeId}</span>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold uppercase">Pending</span>
                  </div>

                  <div className="text-[11px] text-slate-350 bg-[#09090b]/80 p-3 border border-slate-850 rounded-lg space-y-1">
                    <span className="block text-slate-500 font-mono text-[9px] uppercase font-bold">Date & Missed Time</span>
                    <span className="font-semibold block text-slate-200">{req.date} (Intended 09:00 - 18:00)</span>
                    
                    <span className="block text-slate-500 font-mono text-[9px] mt-2.5 uppercase font-bold">Reason & Justification</span>
                    <p className="italic text-slate-300 font-sans">"{req.regularizationReason}"</p>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegularizeAction(req, 'Rejected')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/15 py-2 rounded-lg cursor-pointer transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleRegularizeAction(req, 'Approved')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg cursor-pointer transition-all shadow-md shadow-emerald-500/15"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingRegularizations.length === 0 && (
              <div className="text-center py-6 text-slate-500 font-sans text-xs">
                <BadgeCheck className="w-8 h-8 text-slate-800 mx-auto mb-1.5" />
                No pending regularizations to resolve in audit pool.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
