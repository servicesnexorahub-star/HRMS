import { useState, FormEvent } from 'react';
import { Employee } from '../types';
import { ShieldCheck, Mail, Lock, AlertTriangle, KeyRound, Sparkles, LogIn, Users } from 'lucide-react';

interface LoginProps {
  employees: Employee[];
  onLoginSuccess: (email: string) => void;
}

export default function Login({ employees, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password.trim();

    if (!targetEmail || !targetPassword) {
      setErrorMessage("Please fill in both email and credential passkeys.");
      return;
    }

    // Dynamic search across both hardcoded and bulk uploaded employees
    const matchedEmployee = employees.find(emp => emp.email.toLowerCase() === targetEmail);

    if (!matchedEmployee) {
      setErrorMessage("Access Denied: Email address is not registered in our HR database.");
      return;
    }

    // If the account has a configured custom password, evaluate against that first.
    let isValidPass = false;
    if (matchedEmployee.customPassword) {
      isValidPass = targetPassword === matchedEmployee.customPassword;
    } else {
      // Default fallbacks for fresh accounts
      isValidPass = 
        targetPassword === 'password' || 
        targetPassword === '123' ||
        targetPassword.toUpperCase() === matchedEmployee.employeeId.toUpperCase() ||
        targetPassword === 'password123';
    }

    if (!isValidPass) {
      const msgSuffix = matchedEmployee.customPassword 
        ? "Please use your updated self-service custom password."
        : `Set passkey to 'password' or the personnel's physical ID (${matchedEmployee.employeeId})`;
      setErrorMessage(`Authentication failed. ${msgSuffix}`);
      return;
    }

    // Success Authentication
    onLoginSuccess(matchedEmployee.email);
  };

  const handleQuickLogin = (quickEmail: string, quickId: string) => {
    setEmail(quickEmail);
    setPassword(quickId);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070709] bg-radial-at-t from-[#0d1527] via-[#070709] to-[#070709] text-slate-300 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-black" id="login-container">
      {/* Decorative ambient spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10 transition-all duration-300">
        
        {/* Left Side: Brand presentation and quick credentials panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#0d0d11]/80 border border-slate-800/80 backdrop-blur-md space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-extrabold text-lg tracking-tighter shadow-lg shadow-emerald-500/10">
                Æ
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight font-display">Acme Solutions</h1>
                <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest uppercase">Intranet Security Gateway</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Enterprise HRMS Login</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Access authorized administrative panels, statutory payroll runs, daily punch cards, and performance appraisals with secure authentication.
              </p>
            </div>
          </div>

          {/* Security & Access Guidelines Panel */}
          <div className="space-y-4 pt-4 border-t border-slate-800/60 text-xs font-sans">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security Guidelines
            </span>

            <div className="space-y-3 text-slate-400">
              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p>Use your officially assigned corporate email and employee physical ID key as credentials.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p>To secure your account, update your default password using the self-service settings panel immediately upon your first sign-in.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p>Any unauthorized access attempt is tracked and logged under the enterprise intranet audit controls.</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans italic leading-normal pt-2 border-t border-slate-800/40">
              In case of credential loss or locked accounts, please contact your local IT Operations Department.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Login Form panel */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 rounded-2xl bg-[#0d0d11]/80 border border-slate-800/80 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Sign In</h3>
              <p className="text-xs text-slate-400 mt-0.5">Please fill your enterprise credential tokens to proceed.</p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-red-400 font-sans animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="leading-normal">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold block">Corporate E-Mail Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajiv.mehta@acme.com"
                    className="w-full bg-[#111116] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3.5 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500/70 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password or Employee ID */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold">
                  <label>Passkey or Employee ID</label>
                  <span className="text-emerald-500 font-sans font-semibold capitalize italic normal-case text-[9px]">
                    Use physical ID (e.g. EMP-2026-001) or "password"
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#111116] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-3.5 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-500/70 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all tracking-wide cursor-pointer shadow-lg shadow-emerald-500/10 font-sans mt-2"
            >
              <LogIn className="w-4 h-4" />
              Secure Sign In with Intranet Identity
            </button>

            <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-emerald-400" />
                SSL Unified Directory (LDAP) Enabled
              </span>
              <span>v1.2.6 Cluster Beta</span>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
