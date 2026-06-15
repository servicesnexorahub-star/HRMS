import { useState, FormEvent } from 'react';
import { Employee } from '../types';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  currentActor: Employee;
  onClose: () => void;
  onUpdatePassword: (email: string, newPass: string) => void;
}

export default function ChangePasswordModal({ currentActor, onClose, onUpdatePassword }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      setErrorMsg("All credential field lines represent mandatory properties.");
      return;
    }

    // Verify current password match
    let isCurrentValid = false;
    if (currentActor.customPassword) {
      isCurrentValid = trimmedCurrent === currentActor.customPassword;
    } else {
      isCurrentValid = 
        trimmedCurrent === 'password' || 
        trimmedCurrent === '123' ||
        trimmedCurrent.toUpperCase() === currentActor.employeeId.toUpperCase() ||
        trimmedCurrent === 'password123';
    }

    if (!isCurrentValid) {
      setErrorMsg("Identified credential mismatches: The current password entered is incorrect.");
      return;
    }

    if (trimmedNew.length < 4) {
      setErrorMsg("Security criteria violation: New password must be at least 4 characters long.");
      return;
    }

    if (trimmedNew === trimmedCurrent) {
      setErrorMsg("Security redundancy: New password cannot be identical to the current active password.");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setErrorMsg("Match mismatch: The new password fields do not perfectly match.");
      return;
    }

    // Success - update parent state
    onUpdatePassword(currentActor.email, trimmedNew);
    setSuccessMsg("System Authorization Renewed: Your login passkey has been successfully changed.");
    
    // Clear fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Wait and close
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="password_change_overlay">
      
      {/* Container Card */}
      <div className="bg-[#111114] rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden relative" id="change_password_card">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#09090b] border-b border-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <KeyRound className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-display">Credential Settings</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Renew your internal system access passkey.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2.5 items-start text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2.5 items-start text-emerald-450 text-emerald-400 text-[11px] font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <p className="leading-normal">{successMsg}</p>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold block">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </span>
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password or physical ID"
                  className="w-full bg-[#09090b] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 pl-9 pr-9 text-xs focus:outline-none focus:border-emerald-500/70 transition-all"
                  id="current_pass_input"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold block">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </span>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new passkey (min 4 characters)"
                  className="w-full bg-[#09090b] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 pl-9 pr-9 text-xs focus:outline-none focus:border-emerald-500/70 transition-all"
                  id="new_pass_input"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold block">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new passkey"
                  className="w-full bg-[#09090b] border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500/70 transition-all"
                  id="confirm_pass_input"
                />
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-[#09090b]/40 rounded-xl p-3 border border-slate-850 text-[10.5px] leading-relaxed text-slate-400 space-y-1 font-sans">
            <span className="font-semibold text-slate-300 block">Security Best Practices:</span>
            <ul className="list-disc pl-3.5 space-y-0.5">
              <li>Minimize reuse of old credential configurations.</li>
              <li>Always memorize newly established passkeys before concluding session logout sequences.</li>
            </ul>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-slate-800 text-slate-400 hover:text-slate-250 hover:bg-slate-800/40 rounded-xl py-2.5 font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/5"
            >
              Update Password
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
