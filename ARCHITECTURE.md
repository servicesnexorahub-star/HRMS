# HRMS Enterprise Architecture & Technical Specification

This document provides a comprehensive technical overview of the **Human Resource Management System (HRMS)** architecture, including structural flowcharts, operational pipelines, and statutory rule specifications.

---

## 1. High-Level Component Topology

The system is constructed as a modern, single-page full-stack React application with high-fidelity components, rich client-side persistence, and strict separation of concerns.

```mermaid
graph TD
    %% Base Styles
    classDef main fill:#111114,stroke:#334155,stroke-width:2px,color:#fff;
    classDef module fill:#1e1b4b,stroke:#4f46e5,stroke-width:1px,color:#e0e7ff;
    classDef local fill:#064e3b,stroke:#059669,stroke-width:1px,color:#ecfdf5;
    classDef core fill:#0f172a,stroke:#1e293b,stroke-width:1px,color:#cbd5e1;

    subgraph EntryPoint [Runtime Shell]
        App[App.tsx React Native Context]:::main
        Storage[(Browser LocalStorage Engine)]:::local
    end

    subgraph CoreData [Shared Entities]
        Types[types.ts Defines Interfaces]:::core
        Data[data.ts Initial Mock Datasets]:::core
    end

    subgraph UIModules [HR & Employee Modules]
        HR[HRDashboard.tsx]:::module
        Emp[EmployeeManagement.tsx]:::module
        Att[AttendanceManagement.tsx]:::module
        Leave[LeaveManagement.tsx]:::module
        Payroll[PayrollManagement.tsx]:::module
        Perf[PerformanceManagement.tsx]:::module
        Self[SelfService.tsx]:::module
        Admin[AdminDashboard.tsx]:::module
    end

    %% Wiring
    App <-->|Sync Bidirectional State| Storage
    App -->|Props & state actions| UIModules
    UIModules -.->|Implements Schema Types| CoreData
```

---

## 2. Employee Bulk Excel Upload Pipeline

The bulk upload feature parses, validates, and imports employee records dynamically from Excel documents (`.xlsx`, `.xls`, `.csv`). It automates validation, checks for system conflicts, and runs statutory wage calculations in real time before committing records.

```mermaid
sequenceDiagram
    autonumber
    actor HRAdmin as HR Admin / Manager
    participant UI as EmployeeManagement Component
    participant Reader as FileReader & XLSX Engine
    participant Pivot as Normalizer & Parser
    participant Validator as Audit Validator
    participant Store as Global React State

    HRAdmin->>UI: Action: Open Bulk Scanner Modal
    HRAdmin->>UI: Drop Spreadsheet / Select Excel File
    activate UI
    UI->>Reader: readAsArrayBuffer(File)
    activate Reader
    Reader-->>UI: ArrayBuffer Payload
    deactivate Reader
    UI->>Pivot: parse workbook sheet [0]
    activate Pivot
    Note over Pivot: Maps standard and variations of headers<br/>(e.g., 'E-mail', 'Email Address' -> 'email')
    Pivot-->>UI: JSON Array Rows
    deactivate Pivot

    UI->>Validator: Feed rows for validation loop
    activate Validator
    Note over Validator: Checks mandatory fields,<br/>validates email structure,<br/>and runs duplicate record search
    alt Email Valid & No Local/Spreadsheet Conflict
        Validator-->>UI: Status: 'Ready' (Verified)
    else Mandatory values missing or duplicated
        Validator-->>UI: Status: 'Error' (Blocked with Details)
    end
    deactivate Validator

    UI-->>HRAdmin: Display interactive staging grid with warnings
    HRAdmin->>UI: Trigger: Verify & Bulk Import
    UI->>UI: Automatically pre-calculate EPF, ESIC, Tax & PT allowances
    UI->>Store: onBulkAddEmployees(stagedEmployees)
    Store-->>UI: Commit state and update localStorage
    UI-->>HRAdmin: Show Success Banner & close modal
    deactivate UI
```

---

## 3. Indian Statutory Compliance & Payroll Engine

For active payroll calculations, the system respects standard regulatory mandates and models.

### Deductions Formula Flow

```mermaid
flowchart TD
    %% Stylings
    classDef base fill:#17171a,stroke:#334155,color:#fff;
    classDef calc fill:#1e1b4b,stroke:#4f46e5,color:#cbd5e1;
    classDef out fill:#14532d,stroke:#16a34a,color:#ecfdf5;

    Salary[Employee Salary Structure]:::base --> Basic[Basic Salary]
    Salary --> HRA[HRA Contribution]
    Salary --> Allowances[Other Allowances]

    Basic -->|Multiply PF Rate 12%| PF[EPF Provident Fund Deduction]:::calc

    Basic & HRA & Allowances -->|Gross Salary Sum| Gross[Gross Wages]:::calc

    Gross --> CheckESI{Is Gross <= ₹21,000?}:::calc
    CheckESI -->|Yes| ESI[ESI Contribution 0.75% of Gross]:::calc
    CheckESI -->|No| ESINil[ESI Deduction = ₹0]:::calc

    Gross --> CheckPT{Is Gross > ₹10,000?}:::calc
    CheckPT -->|Yes| PT[Professional Tax = ₹200]:::calc
    CheckPT -->|No| PTNil[Professional PT = ₹0]:::calc

    PF & ESI & PT & TDS[Income Tax TDS Deducted] --> DeductSum[Total Deductions sum]:::calc
    Gross & DeductSum -->|Subtract deductions from Gross| Net[Net Direct Disbursement Payout]:::out
```

---

## 4. Multi-Actor State Transitions & Lifecycle Loop

The application provides dual workflows: Employee Self-Service (ESS) and HR / Operations dashboards. Below are the key states transitioned by these roles.

### A. Leave Request Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Pending : Employee Files Leave (ESS)
    Pending --> Approved : Manager Approves Workspace Status
    Pending --> Rejected : Manager Rejects with Reasons
    Approved --> [*]
    Rejected --> [*]
```

### B. Attendance Missed-Punch Regularization
```mermaid
stateDiagram-v2
    [*] --> MissingLog : Employee misses check-in
    MissingLog --> PendingRegularization : ESS: Files Regularization Claim (adds justification)
    PendingRegularization --> ApprovedCycle : Auditor Approves
    PendingRegularization --> RejectedCycle : Auditor Rejects
    ApprovedCycle --> PresentLog : Attendance marked as 'Present' (00:00/08:30 Adjusted)
    RejectedCycle --> AbsentLog : Remains 'Absent'
    PresentLog --> [*]
    AbsentLog --> [*]
```

### C. Performance Review Loop
```mermaid
stateDiagram-v2
    [*] --> PendingSelf_Eval : Q1/Q2 evaluation loop initialized
    PendingSelf_Eval --> PendingManagerReview : Employee completes self-appraisal rating
    PendingManagerReview --> Completed : Manager provides metrics scores & advice notes
    Completed --> PromotionalDecision : System calculates recommendation tags
    PromotionalDecision --> [*]
```
