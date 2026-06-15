export type SystemPrivilege = 
  | 'Super Administrator'
  | 'System Administrator'
  | 'HR Director'
  | 'HR Executive'
  | 'Payroll Manager'
  | 'Department Head'
  | 'Reporting Manager'
  | 'Team Lead'
  | 'Employee'
  | 'Auditor'
  | 'Recruiter'
  | 'Finance Executive'
  | 'Finance Manager'
  | 'IT Administrator'
  | 'Guest/View Only User';

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-2026-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  department: string;
  designation: string;
  reportingTo: string; // Employee ID or Name
  joiningDate: string;
  status: 'Active' | 'Onboarding' | 'Suspended' | 'Offboarded';
  salaryStructure: {
    basic: number;
    hra: number;
    allowances: number;
    pfDeduction: number;
    esiDeduction: number;
    professionalTax: number;
    tds: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }[];
  customPassword?: string;
  systemPrivilege: SystemPrivilege;
  history: {
    date: string;
    type: 'Joining' | 'Promotion' | 'Transfer' | 'StatusChange' | 'SettingsUpdate';
    description: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut?: string; // HH:MM
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Regularized';
  workFromHome: boolean;
  overtimeHours: number;
  regularizationRequested?: boolean;
  regularizationReason?: string;
  regularizationStatus?: 'Pending' | 'Approved' | 'Rejected';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Comp-Off';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  approvedBy?: string;
}

export interface LeaveBalance {
  Casual: number;
  Sick: number;
  Earned: number;
  CompOff: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g., "June 2026"
  attendanceDays: number;
  basic: number;
  hra: number;
  allowances: number;
  grossAmount: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netAmount: number;
  processedAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string; // e.g. "FY 2026 Q2"
  status: 'Pending Self-Evaluation' | 'Pending Manager Review' | 'Completed';
  kpis: {
    id: string;
    title: string;
    weight: number; // percentage
    selfRating?: number; // 1-5
    managerRating?: number; // 1-5
  }[];
  goals: {
    id: string;
    title: string;
    status: 'Not Started' | 'In Progress' | 'Achieved' | 'Deferred';
  }[];
  selfEvaluation?: string;
  managerComments?: string;
  appraisalRating?: number; // 1-5 overall
  recommendation?: 'None' | 'Promotion' | 'Increment' | 'Performance Plan';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  role: string;
  action: string;
  details: string;
}

export interface SystemSettings {
  companyName: string;
  orgStructureBranches: string[];
  orgStructureDepartments: string[];
  cutoffDate: number; // day of month for payroll processing
  minimumHoursForPresent: number;
  pfRate: number; // percent default 12%
  esiRate: number; // percent default 0.75%
}
