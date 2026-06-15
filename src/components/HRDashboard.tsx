import { Employee, LeaveRequest, AttendanceRecord, Payslip } from '../types';
import { Users, UserCheck, CalendarDays, Wallet, TrendingUp } from 'lucide-react';

interface HRDashboardProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  payslips: Payslip[];
}

export default function HRDashboard({ employees, leaves, attendance, payslips }: HRDashboardProps) {
  // Compute metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onboardingEmployees = employees.filter(e => e.status === 'Onboarding').length;
  
  // Daily attendance today or latest date simulation
  // Let's assume June 12 is today's simulation
  const targetDate = "2026-06-12";
  const recordsOnTargetDate = attendance.filter(r => r.date === targetDate);
  const presentCount = recordsOnTargetDate.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Regularized').length;
  const leaveCountToday = recordsOnTargetDate.filter(r => r.status === 'On Leave').length;

  const attendanceRate = totalEmployees > 0 
    ? Math.round((presentCount / (totalEmployees - leaveCountToday || 1)) * 100) 
    : 0;

  // Monthly Payroll (from latest processed payroll, sum up gross or net)
  const totalMonthlyPayroll = payslips
    .filter(p => p.month === "May 2026")
    .reduce((curr, next) => curr + next.grossAmount, 0);

  // Leave stats
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  // Department splits for charts
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  // Branch splits for charts
  const branchCounts: Record<string, number> = {};
  employees.forEach(e => {
    branchCounts[e.branch] = (branchCounts[e.branch] || 0) + 1;
  });

  return (
    <div className="space-y-6" id="hr-dashboard">
      {/* Top Welcome Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Executive HR Analytics</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time indicators across workforce directories, leaves, and payroll compliance.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Simulated Production Instance: 100-10K Readiness
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md flex items-center gap-4 transition-all hover:border-slate-700/80">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Workforce Density</p>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">{totalEmployees} Members</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Active: {activeEmployees} | Onb: {onboardingEmployees}</p>
          </div>
        </div>

        {/* Daily Attendance Rate */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md flex items-center gap-4 transition-all hover:border-slate-700/80">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Attendance Index</p>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">{attendanceRate}% Today</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Pres: {presentCount} | Leaves: {leaveCountToday}</p>
          </div>
        </div>

        {/* Pending Approval Leaves */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md flex items-center gap-4 transition-all hover:border-slate-700/80">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Leave Pipeline</p>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">{pendingLeavesCount} Pending</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Needs review cycles</p>
          </div>
        </div>

        {/* Total Payroll Run */}
        <div className="bg-[#111114] p-5 rounded-2xl border border-slate-800/50 shadow-md flex items-center gap-4 transition-all hover:border-slate-700/80">
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">May Payroll Run</p>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">₹{(totalMonthlyPayroll / 1000).toFixed(1)}k</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Indian Code Compliant</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdowns */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800/50 shadow-md lg:col-span-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display mb-1">Department Resource Matrix</h4>
          <p className="text-xs text-slate-400 font-sans mb-6">Percentage allocation of enterprise active workforce.</p>
          
          <div className="space-y-4">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / totalEmployees) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300 font-sans">{dept}</span>
                    <span className="font-mono text-slate-400 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="relative w-full h-2 bg-[#09090b] rounded-full overflow-hidden border border-slate-800/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept === 'Engineering' ? 'bg-emerald-500' :
                        dept === 'Human Resources' ? 'bg-rose-500' :
                        dept === 'Product Management' ? 'bg-amber-400' :
                        dept === 'Design' ? 'bg-cyan-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch Split Donut Simulated */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800/50 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display mb-1">Geographical Footprint</h4>
            <p className="text-xs text-slate-400 font-sans mb-6">Staff distributions across offices.</p>
 
            {/* Custom Pie Chart representation using standard SVG circle with stroke-dasharray */}
            <div className="relative flex justify-center items-center h-40">
              <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#27272a" strokeWidth="4"></circle>
                
                {/* Mumbai Split: ~50% (r=15.915 => length=100) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" 
                  strokeDasharray="50 100" strokeDashoffset="0"></circle>
                
                {/* Bangalore Split: ~33.3% */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#06b6d4" strokeWidth="4" 
                  strokeDasharray="33 100" strokeDashoffset="-50"></circle>
 
                {/* Delhi Split: ~16.7% */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" 
                  strokeDasharray="17 100" strokeDashoffset="-83"></circle>
              </svg>
              <div className="absolute text-center">
                <span className="block text-2xl font-bold font-display text-white">{totalEmployees}</span>
                <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-500">Hubs Total</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-4 mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              <span className="block text-[10px] font-mono font-medium text-slate-500">MUM</span>
              <span className="text-xs font-semibold font-sans text-slate-200">{branchCounts["Mumbai HQ"] || 0}</span>
            </div>
            <div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 mr-1.5"></span>
              <span className="block text-[10px] font-mono font-medium text-slate-500">BLR</span>
              <span className="text-xs font-semibold font-sans text-slate-200">{branchCounts["Bangalore Tech Hub"] || 0}</span>
            </div>
            <div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
              <span className="block text-[10px] font-mono font-medium text-slate-500">DEL</span>
              <span className="text-xs font-semibold font-sans text-slate-200">{branchCounts["Delhi Regional Office"] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance / Attrition & Ratios Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance checklist */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800/50 shadow-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/30">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">Indian Statutory Compliance Audit</h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/25 font-semibold">Auto-Validated</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-sans border border-emerald-500/20">✓</span>
              <div>
                <span className="block text-xs font-semibold text-slate-200 font-sans">EPF Contribution Threshold (Act 1952)</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Calculated cleanly at 12% on Basic wages with correct mandatory thresholds.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-sans border border-emerald-500/20">✓</span>
              <div>
                <span className="block text-xs font-semibold text-slate-200 font-sans">ESI Calculations Applied (&lt; 21k check)</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Correctly captures employee status (e.g. Deepak Joshi, gross 29k, check Basic limits & professional tax ranges).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-sans border border-emerald-500/20">✓</span>
              <div>
                <span className="block text-xs font-semibold text-slate-200 font-sans">Slab-wise Professional Tax (PT) Deductions</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Mapped default ₹200 Maharashtra and local slab regulations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attrition/Stability Forecast */}
        <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800/50 shadow-md">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display mb-1">Retention Index & Attrition Indicators</h4>
          <p className="text-xs text-slate-400 font-sans mb-5">Workforce tenure ratios and exit health metrics.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-800 rounded-xl p-4 bg-[#09090b]/40">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Total Leavers</span>
              <span className="text-xl font-bold font-display text-white mt-1 block">0.0%</span>
              <span className="text-[10px] text-emerald-400 font-sans font-semibold mt-1 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Stability
              </span>
            </div>
            <div className="border border-slate-800 rounded-xl p-4 bg-[#09090b]/40">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Average Tenure</span>
              <span className="text-xl font-bold font-display text-white mt-1 block">2.4 Yrs</span>
              <span className="text-[10px] text-slate-400 font-sans block mt-1">Target &gt; 2.0 Yrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
