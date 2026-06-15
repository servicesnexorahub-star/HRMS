import { useState } from 'react';
import { Payslip, Employee, SystemSettings } from '../types';
import { Wallet, ShieldCheck, Printer, X, RefreshCw } from 'lucide-react';

interface PayrollManagementProps {
  payslips: Payslip[];
  employees: Employee[];
  settings: SystemSettings;
  onGeneratePayroll: (month: string, generatedSlips: Payslip[]) => void;
  onUpdateEmployeeSalary: (employeeId: string, updatedSalary: Employee['salaryStructure']) => void;
}

export default function PayrollManagement({ payslips, employees, settings, onGeneratePayroll, onUpdateEmployeeSalary }: PayrollManagementProps) {
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [activeTab, setActiveTab] = useState<'run' | 'history'>('run');
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);

  // States for live component editor
  const [selectedEmpIdSalary, setSelectedEmpIdSalary] = useState('');
  const [editBasic, setEditBasic] = useState('45000');
  const [editHra, setEditHra] = useState('18000');
  const [editAllowances, setEditAllowances] = useState('12000');
  const [editTds, setEditTds] = useState('2000');

  const handleEmployeeSalarySelect = (empId: string) => {
    setSelectedEmpIdSalary(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setEditBasic(emp.salaryStructure.basic.toString());
      setEditHra(emp.salaryStructure.hra.toString());
      setEditAllowances(emp.salaryStructure.allowances.toString());
      setEditTds(emp.salaryStructure.tds.toString());
    }
  };

  const handleSaveSalaryStructure = () => {
    const emp = employees.find(e => e.id === selectedEmpIdSalary);
    if (!emp) return;

    const basicVal = parseFloat(editBasic) || 0;
    const hraVal = parseFloat(editHra) || 0;
    const allowancesVal = parseFloat(editAllowances) || 0;
    const tdsVal = parseFloat(editTds) || 0;

    // EPF: 12% of Basic
    const pfDeduction = Math.round(basicVal * 0.12);
    // ESI (ESI threshold check: Gross <= 21,000 INR matches ESI support @ 0.75%)
    const grossVal = basicVal + hraVal + allowancesVal;
    const esiDeduction = grossVal <= 21000 ? Math.round(grossVal * 0.0075 * 100) / 100 : 0;
    const professionalTax = grossVal > 10000 ? 200 : 0;

    const updatedStructure = {
      basic: basicVal,
      hra: hraVal,
      allowances: allowancesVal,
      pfDeduction,
      esiDeduction,
      professionalTax,
      tds: tdsVal,
    };

    onUpdateEmployeeSalary(emp.employeeId, updatedStructure);
    alert(`Salary Structure updated successfully for ${emp.firstName} ${emp.lastName}. Statutory compliance values calculated automatically.`);
  };

  // Perform Payroll calculations for checking
  const handleTriggerPayrollRun = () => {
    const monthExists = payslips.some(p => p.month === selectedMonth);
    if (monthExists) {
      if (!confirm(`Payroll for ${selectedMonth} was already processed. Re-processing will overwrite existing payslips. Continue?`)) {
        return;
      }
    }

    const generatedSlips: Payslip[] = employees.map(emp => {
      const basic = emp.salaryStructure.basic;
      const hra = emp.salaryStructure.hra;
      const allowances = emp.salaryStructure.allowances;
      const grossAmount = basic + hra + allowances;

      // Indian compliance validations
      const pfDeduction = Math.round(basic * (settings.pfRate / 100));
      const esiDeduction = grossAmount <= 21000 ? Math.round(grossAmount * (settings.esiRate / 100) * 100) / 100 : 0;
      const professionalTax = grossAmount > 10000 ? 200 : 0;
      const tds = emp.salaryStructure.tds;

      const totalDeductions = pfDeduction + esiDeduction + professionalTax + tds;
      const netAmount = grossAmount - totalDeductions;

      return {
        id: `slip-${emp.employeeId}-${Date.now()}`,
        employeeId: emp.employeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        month: selectedMonth,
        attendanceDays: 22, // default simulation month days check
        basic,
        hra,
        allowances,
        grossAmount,
        pfDeduction,
        esiDeduction,
        professionalTax,
        tds,
        totalDeductions,
        netAmount,
        processedAt: new Date().toISOString().split('T')[0]
      };
    });

    onGeneratePayroll(selectedMonth, generatedSlips);
    alert(`Successfully generated statutory compliant payroll payslips for ${selectedMonth} across all active workforce profiles.`);
  };

  return (
    <div className="space-y-6" id="payroll-management">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display">Payroll Engine</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5 font-sans">Automated payroll calculation and payslip distribution with Indian EPF, ESIC, PT, and TDS statutory compliant logic.</p>
        </div>
        <div className="flex items-center gap-1.5 self-start">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg px-3 py-1.5 font-semibold font-sans flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Compliance Status: Active (FY 2026-27)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/60 text-xs">
        <button
          onClick={() => setActiveTab('run')}
          className={`px-4 py-2.5 font-bold font-sans border-b-2 transition-all -mb-px cursor-pointer ${
            activeTab === 'run' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Payroll Run Workshop
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 font-bold font-sans border-b-2 transition-all -mb-px cursor-pointer ${
            activeTab === 'history' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Historical Payslips Database ({payslips.length})
        </button>
      </div>

      {activeTab === 'run' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Run Payroll Card Form */}
          <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-6 space-y-6 lg:col-span-2 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Active Cycle Run
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Determine current periods wages, legal withholdings, and generate printable salary statements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Target Payroll Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full text-xs bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-hidden"
                >
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Processing parameters</label>
                <div className="text-[11px] text-slate-300 space-y-1.5 bg-[#09090b]/40 p-3 border border-slate-800 rounded-lg">
                  <p>✔ Active headcount processed: <span className="font-semibold text-emerald-400 font-mono">{employees.length}</span></p>
                  <p>✔ Standard working quota cutoff date: <span className="font-semibold text-white">25th of month</span></p>
                </div>
              </div>
            </div>

            {/* Statutory preview cards */}
            <div className="border border-emerald-500/10 bg-emerald-500/5 p-4 rounded-xl space-y-3">
              <span className="block text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-widest">Indian Statutory Slab Settings Preview</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-400">
                <div className="bg-[#09090b] p-3 border border-slate-800/60 rounded-lg">
                  <span className="block text-slate-500 uppercase text-[9px]">EPF CONTRIB</span>
                  <span className="block font-bold text-slate-200 mt-0.5">{settings.pfRate}% (Basic)</span>
                </div>
                <div className="bg-[#09090b] p-3 border border-slate-800/60 rounded-lg">
                  <span className="block text-slate-500 uppercase text-[9px]">ESIC SHIELD</span>
                  <span className="block font-bold text-slate-200 mt-0.5">{settings.esiRate}% (&lt;₹21k Gross)</span>
                </div>
                <div className="bg-[#09090b] p-3 border border-slate-800/60 rounded-lg">
                  <span className="block text-slate-500 uppercase text-[9px]">PT REGION SLAB</span>
                  <span className="block font-bold text-slate-200 mt-0.5">₹200/mo (&gt;₹10k)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerPayrollRun}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold py-3 rounded-lg transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15"
            >
              <RefreshCw className="w-4 h-4" />
              Perform Compliance Calculations and Release {selectedMonth} Payroll
            </button>
          </div>

          {/* Core Remuneration Configuration Structure Editor */}
          <div className="bg-[#111114] rounded-2xl border border-slate-800/50 p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Legal Wage structures</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Customize individual base compensation models for automated calculations.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono text-slate-400">Pick Employee</label>
                <select
                  value={selectedEmpIdSalary}
                  onChange={(e) => handleEmployeeSalarySelect(e.target.value)}
                  className="w-full text-xs bg-[#09090b] border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-hidden"
                >
                  <option value="">-- Choose employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              {selectedEmpIdSalary && (
                <div className="space-y-3.5 text-xs border-t border-slate-800/60 pt-3.5 text-slate-350 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Basic Monthly (₹)</label>
                    <input
                      type="number"
                      value={editBasic}
                      onChange={(e) => setEditBasic(e.target.value)}
                      className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">HRA Allowance (₹)</label>
                    <input
                      type="number"
                      value={editHra}
                      onChange={(e) => setEditHra(e.target.value)}
                      className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Other Allowances (₹)</label>
                    <input
                      type="number"
                      value={editAllowances}
                      onChange={(e) => setEditAllowances(e.target.value)}
                      className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Est. TDS Deduction/mo (₹)</label>
                    <input
                      type="number"
                      value={editTds}
                      onChange={(e) => setEditTds(e.target.value)}
                      className="w-full bg-[#09090b] border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-hidden"
                    />
                  </div>

                  <button
                    onClick={handleSaveSalaryStructure}
                    className="w-full bg-slate-800 text-white hover:bg-slate-750 border border-slate-700/60 text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer font-sans"
                  >
                    Commit Wage adjustments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Historical Generated Database view */
        <div className="bg-[#111114] rounded-2xl border border-slate-800/50 overflow-hidden shadow-md">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#09090b]/45 text-[10px] text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                  <th className="p-4 font-semibold">Employee Target</th>
                  <th className="p-4 font-semibold">Target Month</th>
                  <th className="p-4 font-semibold">Gross Salary (₹)</th>
                  <th className="p-4 font-semibold">Total Deductions (₹)</th>
                  <th className="p-4 font-semibold">Net Payout (₹)</th>
                  <th className="p-4 font-semibold text-right">Statements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-[#09090b]/40 transition-all">
                    <td className="p-4">
                      <span className="block font-semibold text-white font-sans">{slip.employeeName}</span>
                      <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{slip.employeeId}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-400">{slip.month}</td>
                    <td className="p-4 font-mono font-semibold text-slate-200">₹{slip.grossAmount.toLocaleString()}</td>
                    <td className="p-4 font-mono font-semibold text-red-400">₹{slip.totalDeductions.toLocaleString()}</td>
                    <td className="p-4 font-mono font-extrabold text-emerald-400">₹{slip.netAmount.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setViewingPayslip(slip)}
                        className="inline-flex items-center gap-1.5 border border-slate-850 bg-[#09090b] hover:bg-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-[10px] font-semibold hover:text-white cursor-pointer transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        Print Payslip
                      </button>
                    </td>
                  </tr>
                ))}
                {payslips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                      No statutory payslips archived in this historical window. Click the Payroll Run tab to generate compliance metrics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Corporate Payslip Mock Overlay viewer */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#111114] rounded-2xl shadow-xl w-full max-w-2xl border border-slate-800 overflow-hidden flex flex-col p-8 text-xs font-sans text-slate-300 max-h-[90vh] overflow-y-auto relative border border-slate-800">
            
            <button
              onClick={() => setViewingPayslip(null)}
              className="absolute right-6 top-6 p-2 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Corporate Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-850">
              <div>
                <h2 className="text-base font-bold text-white tracking-widest uppercase font-display">{settings.companyName}</h2>
                <span className="block text-[9px] text-slate-500 uppercase font-mono mt-1">Statutory Pay Record • Mumbai Corporate Office</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold text-emerald-400 font-mono text-sm">{viewingPayslip.month} Payslip</span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">ID: {viewingPayslip.id}</span>
              </div>
            </div>

            {/* Employee details matrix */}
            <div className="grid grid-cols-2 gap-y-3 py-4 text-xs border-b border-slate-850 bg-[#09090b]/40 p-4 rounded-xl my-4">
              <div>
                <span className="block text-[9px] text-slate-500 uppercase font-mono">Employee Name</span>
                <span className="font-semibold text-white">{viewingPayslip.employeeName}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 uppercase font-mono">Employee ID Reference</span>
                <span className="font-mono font-semibold text-emerald-400">{viewingPayslip.employeeId}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 uppercase font-mono">Designation Category</span>
                <span className="font-semibold text-white">Senior Staff Member</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-500 uppercase font-mono">Assumed Attendance days</span>
                <span className="font-semibold text-white">22 / 22 Working Days</span>
              </div>
            </div>

            {/* Earnings vs Deductions table grid */}
            <div className="grid grid-cols-2 gap-x-8 text-xs">
              {/* Earnings column */}
              <div className="space-y-3">
                <span className="block font-bold text-slate-200 border-b border-slate-800/80 pb-1.5 uppercase text-[9px] tracking-widest font-mono">Gross Earnings Credit</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Basic Wage Structure</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Combined Special Allowances</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-slate-800 font-bold text-white font-mono">
                  <span>Gross Wage Sum</span>
                  <span className="font-mono font-bold text-emerald-400">₹{viewingPayslip.grossAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-3">
                <span className="block font-bold text-red-400 border-b border-slate-800/80 pb-1.5 uppercase text-[9px] tracking-widest font-mono">Statutory Withholdings</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Provident Fund (EPF 12%)</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">State Insurance (ESIC 0.75%)</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.esiDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.professionalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Income Tax / TDS Bracket</span>
                  <span className="font-mono font-semibold text-white">₹{viewingPayslip.tds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-slate-800 font-bold text-red-400 font-mono">
                  <span>Total Deductions</span>
                  <span className="font-mono font-bold">₹{viewingPayslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Net pay bar */}
            <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center bg-[#09090b]/40 p-4 border border-slate-850 rounded-xl leading-none">
              <div>
                <span className="block text-[10px] text-emerald-400 uppercase font-mono font-semibold mb-1">Total Net Disbursed Payout</span>
                <span className="text-slate-500 text-[9px]">Transferred through direct corporate banking channels</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black font-display text-emerald-400">₹{viewingPayslip.netAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Signature footer */}
            <div className="flex justify-between items-end mt-8 text-[10px] text-slate-500 text-center pt-8 border-t border-slate-850 font-mono">
              <div>
                <p className="border-b border-slate-800 w-36 pb-1.5 mx-auto font-sans font-semibold text-slate-300">Pooja Patel</p>
                <p className="mt-1">Manager signature</p>
              </div>
              <div>
                <p className="border-b border-slate-800 w-36 pb-1.5 mx-auto font-sans font-semibold text-slate-300">Digital Lock Stamp</p>
                <p className="mt-1">Audit verification code</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-850">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer transition"
              >
                Download Statement PDF
              </button>
              <button
                onClick={() => setViewingPayslip(null)}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg cursor-pointer transition shadow-lg shadow-emerald-500/15"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
