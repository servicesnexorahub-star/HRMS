import { Employee, AttendanceRecord, LeaveRequest, Payslip, PerformanceReview, AuditLog, SystemSettings } from './types';

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: "Acme Enterprise Solutions",
  orgStructureBranches: ["Mumbai HQ", "Bangalore Tech Hub", "Delhi Regional Office"],
  orgStructureDepartments: ["Engineering", "Human Resources", "Product Management", "Design", "Sales & Marketing", "Finance"],
  cutoffDate: 25,
  minimumHoursForPresent: 8,
  pfRate: 12, // 12% of Basic
  esiRate: 0.75, // 0.75% of Gross
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    employeeId: "EMP-2026-001",
    firstName: "Rajiv",
    lastName: "Mehta",
    email: "rajiv.mehta@acme.com",
    phone: "+91 98765 43210",
    branch: "Mumbai HQ",
    department: "Finance",
    designation: "Managing Director & CEO",
    reportingTo: "Board of Directors",
    joiningDate: "2020-01-15",
    status: "Active",
    salaryStructure: {
      basic: 150000,
      hra: 60000,
      allowances: 40000,
      pfDeduction: 18000,
      esiDeduction: 0, // Above limit (> 21k)
      professionalTax: 200,
      tds: 35000,
    },
    documents: [
      { id: "doc-1", name: "Executive_Employment_Agreement.pdf", type: "Contract", uploadedAt: "2020-01-15" }
    ],
    systemPrivilege: "Super Administrator",
    history: [
      { date: "2020-01-15", type: "Joining", description: "Joined Acme Enterprise Solutions as Managing Director" }
    ]
  },
  {
    id: "EMP-002",
    employeeId: "EMP-2026-002",
    firstName: "Pooja",
    lastName: "Patel",
    email: "pooja.patel@acme.com",
    phone: "+91 98765 43211",
    branch: "Mumbai HQ",
    department: "Human Resources",
    designation: "HR Manager",
    reportingTo: "Rajiv Mehta",
    joiningDate: "2022-03-01",
    status: "Active",
    salaryStructure: {
      basic: 60000,
      hra: 24000,
      allowances: 16000,
      pfDeduction: 7200,
      esiDeduction: 0,
      professionalTax: 200,
      tds: 6000,
    },
    documents: [
      { id: "doc-2", name: "Pooja_Aadhar_Card.pdf", type: "ID Proof", uploadedAt: "2022-03-01" },
      { id: "doc-3", name: "Pooja_Offer_Letter.pdf", type: "Contract", uploadedAt: "2022-02-15" }
    ],
    systemPrivilege: "HR Director",
    history: [
      { date: "2022-03-01", type: "Joining", description: "Joined Acme as Assistant HR Manager" },
      { date: "2024-04-01", type: "Promotion", description: "Promoted to HR Manager with salary increment" }
    ]
  },
  {
    id: "EMP-003",
    employeeId: "EMP-2026-003",
    firstName: "Vikram",
    lastName: "Sharma",
    email: "vikram.sharma@acme.com",
    phone: "+91 98765 43212",
    branch: "Mumbai HQ",
    department: "Engineering",
    designation: "Senior Software Engineer",
    reportingTo: "Pooja Patel", // Tech reports to HR temporarily in this branch structure or direct managed
    joiningDate: "2023-06-10",
    status: "Active",
    salaryStructure: {
      basic: 70000,
      hra: 28000,
      allowances: 22000,
      pfDeduction: 8400,
      esiDeduction: 0,
      professionalTax: 200,
      tds: 11000,
    },
    documents: [
      { id: "doc-4", name: "Vikram_Graduation_Degree.pdf", type: "Academic", uploadedAt: "2023-06-08" },
      { id: "doc-5", name: "Vikram_Experience_Cert.pdf", type: "Experience Letter", uploadedAt: "2023-06-08" }
    ],
    systemPrivilege: "Employee",
    history: [
      { date: "2023-06-10", type: "Joining", description: "Joined as Software Engineer II" },
      { date: "2025-07-01", type: "Promotion", description: "Promoted to Senior Software Engineer" }
    ]
  },
  {
    id: "EMP-004",
    employeeId: "EMP-2026-004",
    firstName: "Amit",
    lastName: "Verma",
    email: "amit.verma@acme.com",
    phone: "+91 88765 11223",
    branch: "Bangalore Tech Hub",
    department: "Product Management",
    designation: "Lead Product Manager",
    reportingTo: "Rajiv Mehta",
    joiningDate: "2024-01-10",
    status: "Active",
    salaryStructure: {
      basic: 90000,
      hra: 36000,
      allowances: 24000,
      pfDeduction: 10800,
      esiDeduction: 0,
      professionalTax: 200,
      tds: 18000,
    },
    documents: [
      { id: "doc-6", name: "Amit_Offer_Signed.pdf", type: "Contract", uploadedAt: "2024-01-02" }
    ],
    systemPrivilege: "Employee",
    history: [
      { date: "2024-01-10", type: "Joining", description: "Joined as Senior PM" },
      { date: "2026-01-01", type: "Promotion", description: "Promoted to Lead Product Manager" }
    ]
  },
  {
    id: "EMP-005",
    employeeId: "EMP-2026-005",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@acme.com",
    phone: "+91 77654 32109",
    branch: "Bangalore Tech Hub",
    department: "Design",
    designation: "UX UI Designer",
    reportingTo: "Amit Verma",
    joiningDate: "2024-08-15",
    status: "Active",
    salaryStructure: {
      basic: 40000,
      hra: 16000,
      allowances: 14000,
      pfDeduction: 4800,
      esiDeduction: 0,
      professionalTax: 200,
      tds: 2500,
    },
    documents: [
      { id: "doc-7", name: "Priya_Design_Portfolio_A.pdf", type: "Portfolio Reference", uploadedAt: "2024-08-10" }
    ],
    systemPrivilege: "Employee",
    history: [
      { date: "2024-08-15", type: "Joining", description: "Joined as UX UI Designer" }
    ]
  },
  {
    id: "EMP-006",
    employeeId: "EMP-2026-006",
    firstName: "Deepak",
    lastName: "Joshi",
    email: "deepak.joshi@acme.com",
    phone: "+91 99887 76655",
    branch: "Delhi Regional Office",
    department: "Sales & Marketing",
    designation: "Sales Executive",
    reportingTo: "Rajiv Mehta",
    joiningDate: "2025-10-01",
    status: "Active",
    salaryStructure: {
      basic: 18000, // Below 21,000 - ESI active!
      hra: 7200,
      allowances: 3800,
      pfDeduction: 2160,
      esiDeduction: 217.5, // 0.75% of Gross (18000+7200+3800 = 29000 -> 217.5)
      professionalTax: 200,
      tds: 0,
    },
    documents: [],
    systemPrivilege: "Employee",
    history: [
      { date: "2025-10-01", type: "Joining", description: "Joined Delhi branch as Sales Associate" }
    ]
  }
];

export const INITIAL_LEAVE_BALANCES: Record<string, { Casual: number, Sick: number, Earned: number, CompOff: number }> = {
  "EMP-2026-001": { Casual: 8, Sick: 10, Earned: 15, CompOff: 2 },
  "EMP-2026-002": { Casual: 6, Sick: 5, Earned: 12, CompOff: 1 },
  "EMP-2026-003": { Casual: 4, Sick: 8, Earned: 10, CompOff: 4 },
  "EMP-2026-004": { Casual: 7, Sick: 9, Earned: 14, CompOff: 0 },
  "EMP-2026-005": { Casual: 6, Sick: 6, Earned: 8, CompOff: 1 },
  "EMP-2026-006": { Casual: 5, Sick: 7, Earned: 5, CompOff: 1 },
};

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: "leave-101",
    employeeId: "EMP-2026-003",
    employeeName: "Vikram Sharma",
    leaveType: "Casual",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
    reason: "Personal family event in Indore",
    status: "Pending",
    appliedOn: "2026-06-12",
  },
  {
    id: "leave-102",
    employeeId: "EMP-2026-005",
    employeeName: "Priya Nair",
    leaveType: "Sick",
    startDate: "2026-06-11",
    endDate: "2026-06-11",
    reason: "Suffering from high fever",
    status: "Approved",
    appliedOn: "2026-06-11",
    approvedBy: "Pooja Patel"
  },
  {
    id: "leave-103",
    employeeId: "EMP-2026-006",
    employeeName: "Deepak Joshi",
    leaveType: "Earned",
    startDate: "2026-06-24",
    endDate: "2026-06-28",
    reason: "Outstation trip with hometown friends",
    status: "Rejected",
    appliedOn: "2026-06-08",
    approvedBy: "Pooja Patel"
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Vikram Sharma - Mumbai Branch (Present entries for June, with some lates and an regularization)
  { id: "att-001", employeeId: "EMP-2026-003", date: "2026-06-01", checkIn: "09:12", checkOut: "18:05", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-002", employeeId: "EMP-2026-003", date: "2026-06-02", checkIn: "09:35", checkOut: "18:15", status: "Late", workFromHome: false, overtimeHours: 0 },
  { id: "att-003", employeeId: "EMP-2026-003", date: "2026-06-03", checkIn: "08:55", checkOut: "20:00", status: "Present", workFromHome: false, overtimeHours: 2 },
  { id: "att-004", employeeId: "EMP-2026-003", date: "2026-06-04", checkIn: "09:05", checkOut: "18:00", status: "Present", workFromHome: true, overtimeHours: 0 },
  { id: "att-005", employeeId: "EMP-2026-003", date: "2026-06-05", checkIn: "09:01", checkOut: "21:30", status: "Present", workFromHome: false, overtimeHours: 3.5 },
  { id: "att-006", employeeId: "EMP-2026-003", date: "2026-06-08", checkIn: "11:00", checkOut: "19:00", status: "Present", workFromHome: false, overtimeHours: 0, regularizationRequested: true, regularizationReason: "Forgot access card, was present from 09:00 AM", regularizationStatus: "Pending" },
  { id: "att-007", employeeId: "EMP-2026-003", date: "2026-06-09", checkIn: "09:10", checkOut: "18:10", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-008", employeeId: "EMP-2026-003", date: "2026-06-10", checkIn: "09:05", checkOut: "18:00", status: "Present", workFromHome: true, overtimeHours: 0 },
  { id: "att-009", employeeId: "EMP-2026-003", date: "2026-06-11", checkIn: "08:58", checkOut: "18:12", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-010", employeeId: "EMP-2026-003", date: "2026-06-12", checkIn: "09:02", checkOut: "18:05", status: "Present", workFromHome: false, overtimeHours: 0 },

  // Pooja Patel
  { id: "att-101", employeeId: "EMP-2026-002", date: "2026-06-01", checkIn: "09:15", checkOut: "18:30", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-102", employeeId: "EMP-2026-002", date: "2026-06-02", checkIn: "09:05", checkOut: "18:15", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-103", employeeId: "EMP-2026-002", date: "2026-06-03", checkIn: "09:08", checkOut: "18:00", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-104", employeeId: "EMP-2026-002", date: "2026-06-04", checkIn: "09:10", checkOut: "18:40", status: "Present", workFromHome: false, overtimeHours: 0 },
  { id: "att-105", employeeId: "EMP-2026-002", date: "2026-06-05", checkIn: "08:50", checkOut: "18:00", status: "Present", workFromHome: false, overtimeHours: 0 },

  // Priya Nair (Sick leave on June 11, check table leave-102 above)
  { id: "att-201", employeeId: "EMP-2026-005", date: "2026-06-11", checkIn: "00:00", checkOut: "00:00", status: "On Leave", workFromHome: false, overtimeHours: 0 },

  // Deepak Joshi
  { id: "att-301", employeeId: "EMP-2026-006", date: "2026-06-01", checkIn: "09:32", checkOut: "18:00", status: "Late", workFromHome: false, overtimeHours: 0 },
  { id: "att-302", employeeId: "EMP-2026-006", date: "2026-06-02", checkIn: "09:40", checkOut: "18:05", status: "Late", workFromHome: false, overtimeHours: 0 },
  { id: "att-303", employeeId: "EMP-2026-006", date: "2026-06-03", checkIn: "00:00", checkOut: "00:00", status: "Absent", workFromHome: false, overtimeHours: 0 },
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: "slip-001",
    employeeId: "EMP-2026-003",
    employeeName: "Vikram Sharma",
    month: "May 2026",
    attendanceDays: 21,
    basic: 70000,
    hra: 28000,
    allowances: 22000,
    grossAmount: 120000,
    pfDeduction: 8400,
    esiDeduction: 0,
    professionalTax: 200,
    tds: 11000,
    totalDeductions: 19600,
    netAmount: 100400,
    processedAt: "2026-05-30"
  },
  {
    id: "slip-002",
    employeeId: "EMP-2026-002",
    employeeName: "Pooja Patel",
    month: "May 2026",
    attendanceDays: 22,
    basic: 60000,
    hra: 24000,
    allowances: 16000,
    grossAmount: 100000,
    pfDeduction: 7200,
    esiDeduction: 0,
    professionalTax: 200,
    tds: 6000,
    totalDeductions: 13400,
    netAmount: 86600,
    processedAt: "2026-05-30"
  },
  {
    id: "slip-003",
    employeeId: "EMP-2026-006",
    employeeName: "Deepak Joshi",
    month: "May 2026",
    attendanceDays: 18,
    basic: 18000,
    hra: 7200,
    allowances: 3800,
    grossAmount: 29000,
    pfDeduction: 2160,
    esiDeduction: 217.5,
    professionalTax: 200,
    tds: 0,
    totalDeductions: 2577.5,
    netAmount: 26422.5,
    processedAt: "2026-05-30"
  }
];

export const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: "rev-201",
    employeeId: "EMP-2026-003",
    employeeName: "Vikram Sharma",
    reviewPeriod: "FY 2026 Q1",
    status: "Completed",
    kpis: [
      { id: "kpi-1", title: "Code Quality and Coverage", weight: 40, selfRating: 4, managerRating: 5 },
      { id: "kpi-2", title: "On-Time Task Delivery", weight: 30, selfRating: 4, managerRating: 4 },
      { id: "kpi-3", title: "Technical Leadership & Core Mentoring", weight: 30, selfRating: 3, managerRating: 4 }
    ],
    goals: [
      { id: "g-1", title: "Refactor core authentication engine and move to oauth format", status: "Achieved" },
      { id: "g-2", title: "Achieve > 85% test coverage in all engineering repositories", status: "In Progress" }
    ],
    selfEvaluation: "Worked heavily on stabilizing the core billing and tenant modules. Guided two junior associates successfully into the React 19 framework.",
    managerComments: "Vikram has demonstrated stellar code precision and helped standardise our CI pipelines. He is highly recommended for promotion to Principal Engineer in the next cycle.",
    appraisalRating: 4.3,
    recommendation: "Increment"
  },
  {
    id: "rev-202",
    employeeId: "EMP-2026-005",
    employeeName: "Priya Nair",
    reviewPeriod: "FY 2026 Q1",
    status: "Pending Manager Review",
    kpis: [
      { id: "kpi-4", title: "User Research & Customer Synthesis", weight: 50, selfRating: 5 },
      { id: "kpi-5", title: "High Fidelity Interactive Prototypes", weight: 50, selfRating: 4 }
    ],
    goals: [
      { id: "g-3", title: "Complete design guidelines for Acme Enterprise Dashboard", status: "Achieved" }
    ],
    selfEvaluation: "Conducted 15 user interviews and fully redesigned the employee check-in interface. I believe the designs align directly with modern high-contrast aesthetic requirements.",
    managerComments: ""
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    timestamp: "2026-06-14T10:15:00-07:00",
    userEmail: "pooja.patel@acme.com",
    role: "HR Admin",
    action: "Approve Leave",
    details: "Approved sick leave request leaf-102 for Priya Nair"
  },
  {
    id: "log-002",
    timestamp: "2026-06-14T12:00:10-07:00",
    userEmail: "rajiv.mehta@acme.com",
    role: "CEO / Superadmin",
    action: "Salary Structure Edit",
    details: "Adjusted TDS projection threshold guidelines for financial year 2026"
  },
  {
    id: "log-003",
    timestamp: "2026-06-14T14:35:12-07:00",
    userEmail: "services.nexorahub@gmail.com",
    role: "System Integrator / Superadmin",
    action: "Update System Config",
    details: "Updated Indian compliance calculations settings for Provident Fund contributions (12% cap)"
  }
];
