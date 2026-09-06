import React from 'react';
import { useParams } from 'react-router-dom';

export interface NavModule {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
  accent: string;
  custom?: boolean;
}

export interface KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}

export interface Activity {
  actor: string;
  action: string;
  target: string;
  time: string;
}

export const MODULE_DATA: Record<
  string,
  {
    description: string;
    kpis: KPI[];
    activities: Activity[];
    tableLabel: string;
    rows: Record<string, string>[];
    rowCols: string[];
  }
> = {
  crm: {
    description: 'Customer pipeline, accounts, contacts, and support tickets.',
    kpis: [
      { label: 'Open Deals', value: '147', delta: '+14 this month', up: true },
      { label: 'Pipeline Value', value: '$4.2M', delta: '+$320K vs last month', up: true },
      { label: 'Conversion Rate', value: '24.3%', delta: '-1.2% vs Q2', up: false },
      { label: 'Avg. Deal Size', value: '$28,500', delta: '+$3,200 vs last month', up: true },
    ],
    activities: [
      { actor: 'Marcus Chen', action: 'moved deal to', target: 'Proposal — TechStart Inc.', time: '4m ago' },
      { actor: 'Layla Kim', action: 'logged call with', target: 'GlobalTrade Co.', time: '22m ago' },
      { actor: 'AutoBot', action: 'created follow-up', target: 'Orbit Systems — 3d overdue', time: '1h ago' },
      { actor: 'Sara Patel', action: 'closed won', target: 'Nexus Corp — $88,000', time: '3h ago' },
    ],
    tableLabel: 'Recent Deals',
    rowCols: ['Company', 'Stage', 'Value', 'Owner', 'Close Date'],
    rows: [
      { Company: 'Acme Corp', Stage: 'Negotiation', Value: '$142,000', Owner: 'Marcus Chen', 'Close Date': 'Sep 15, 2026' },
      { Company: 'TechStart Inc.', Stage: 'Proposal', Value: '$64,500', Owner: 'Layla Kim', 'Close Date': 'Sep 22, 2026' },
      { Company: 'Orbit Systems', Stage: 'Discovery', Value: '$31,200', Owner: 'Sara Patel', 'Close Date': 'Oct 05, 2026' },
      { Company: 'GlobalTrade Co.', Stage: 'Qualified', Value: '$95,000', Owner: 'Marcus Chen', 'Close Date': 'Oct 12, 2026' },
    ],
  },
  finance: {
    description: 'General ledger, accounts payable/receivable, budgeting, and reporting.',
    kpis: [
      { label: 'Revenue (MTD)', value: '$1.84M', delta: '+11% vs Aug 2026', up: true },
      { label: 'Expenses (MTD)', value: '$1.21M', delta: '+4% vs Aug 2026', up: false },
      { label: 'Gross Margin', value: '34.2%', delta: '+2.1pp vs Q2', up: true },
      { label: 'Pending Invoices', value: '38', delta: 'Total $412,000', up: false },
    ],
    activities: [
      { actor: 'Finance Bot', action: 'processed invoice', target: 'INV-2026-0841 — $24,500', time: '8m ago' },
      { actor: 'Helen Wu', action: 'approved journal', target: 'JE-4421 — Depreciation Q3', time: '45m ago' },
      { actor: 'AP System', action: 'flagged overdue', target: 'Vendor Apex Ltd — 32d', time: '2h ago' },
      { actor: 'Helen Wu', action: 'closed period', target: 'August 2026', time: '1d ago' },
    ],
    tableLabel: 'Recent Transactions',
    rowCols: ['Ref', 'Account', 'Type', 'Amount', 'Date'],
    rows: [
      { Ref: 'JE-4432', Account: 'Revenue — Software', Type: 'Credit', Amount: '$84,000', Date: 'Sep 04, 2026' },
      { Ref: 'JE-4431', Account: 'Salaries & Wages', Type: 'Debit', Amount: '$142,000', Date: 'Sep 03, 2026' },
      { Ref: 'INV-0841', Account: 'Accounts Receivable', Type: 'Debit', Amount: '$24,500', Date: 'Sep 02, 2026' },
      { Ref: 'PO-2218', Account: 'Cost of Goods Sold', Type: 'Debit', Amount: '$38,200', Date: 'Sep 01, 2026' },
    ],
  },
  hr: {
    description: 'Employee management, org structure, leave, payroll, and recruitment.',
    kpis: [
      { label: 'Headcount', value: '1,248', delta: '+12 since Aug 2026', up: true },
      { label: 'Open Positions', value: '34', delta: 'Across 8 departments', up: false },
      { label: 'Leave Requests', value: '21', delta: 'Pending approval', up: false },
      { label: 'Turnover Rate', value: '3.1%', delta: '-0.4% vs last quarter', up: true },
    ],
    activities: [
      { actor: 'Sara O.', action: 'approved leave', target: 'James T. — Annual × 5d', time: '1h ago' },
      { actor: 'HR Bot', action: 'sent offer letter', target: 'Candidate — Lead Engineer', time: '2h ago' },
      { actor: 'Payroll', action: 'processed run', target: 'September 2026 — 1,248 staff', time: '6h ago' },
      { actor: 'Recruiter', action: 'advanced candidate', target: 'Final round — UX Designer', time: '1d ago' },
    ],
    tableLabel: 'Recent Hires',
    rowCols: ['Name', 'Department', 'Role', 'Start Date', 'Status'],
    rows: [
      { Name: 'Amara Diallo', Department: 'Engineering', Role: 'Senior Backend Engineer', 'Start Date': 'Sep 01, 2026', Status: 'Active' },
      { Name: 'Leo Tanaka', Department: 'Finance', Role: 'Financial Analyst', 'Start Date': 'Aug 15, 2026', Status: 'Active' },
      { Name: 'Priya Nair', Department: 'CRM', Role: 'Account Executive', 'Start Date': 'Aug 01, 2026', Status: 'Probation' },
      { Name: 'Omar Khalid', Department: 'HR', Role: 'HR Business Partner', 'Start Date': 'Jul 15, 2026', Status: 'Active' },
    ],
  },
  manufacturing: {
    description: 'Production orders, BOM management, shop floor scheduling, and quality control.',
    kpis: [
      { label: 'Active Orders', value: '83', delta: '+7 since Monday', up: true },
      { label: 'OEE', value: '78.4%', delta: '+2.1% vs last week', up: true },
      { label: 'Defect Rate', value: '0.8%', delta: '-0.3% vs Q2 avg', up: true },
      { label: 'On-Time Delivery', value: '91.2%', delta: '-2.1% vs target', up: false },
    ],
    activities: [
      { actor: 'WC-04 Line', action: 'completed batch', target: 'WO-2026-0481 — 2,400 units', time: '18m ago' },
      { actor: 'QC Bot', action: 'flagged batch', target: 'WO-2026-0479 — 12 defects', time: '1h ago' },
      { actor: 'Planner', action: 'scheduled order', target: 'WO-2026-0490 — Start Sep 6', time: '3h ago' },
      { actor: 'MES', action: 'reported downtime', target: 'WC-02 — 45min maintenance', time: '4h ago' },
    ],
    tableLabel: 'Active Work Orders',
    rowCols: ['Order', 'Product', 'Qty', 'Work Center', 'Status'],
    rows: [
      { Order: 'WO-0482', Product: 'Motor Assembly A4', Qty: '500', 'Work Center': 'WC-01', Status: 'In Progress' },
      { Order: 'WO-0483', Product: 'Circuit Board Rev3', Qty: '1,200', 'Work Center': 'WC-03', Status: 'In Progress' },
      { Order: 'WO-0484', Product: 'Gear Housing K2', Qty: '300', 'Work Center': 'WC-04', Status: 'Draft' },
      { Order: 'WO-0485', Product: 'Sensor Module V7', Qty: '800', 'Work Center': 'WC-02', Status: 'Scheduled' },
    ],
  },
  inventory: {
    description: 'Stock tracking, warehouse locations, reorder rules, and movement history.',
    kpis: [
      { label: 'SKU Count', value: '4,821', delta: '+34 this month', up: true },
      { label: 'Stock Value', value: '$3.6M', delta: '+$240K vs Aug', up: true },
      { label: 'Low Stock Alerts', value: '18', delta: 'Reorder triggered for 6', up: false },
      { label: 'Fulfillment Rate', value: '97.4%', delta: '+0.6% vs last month', up: true },
    ],
    activities: [
      { actor: 'WH-01', action: 'received shipment', target: 'PO-4421 — 800 units Raw Material', time: '12m ago' },
      { actor: 'Auto-Reorder', action: 'raised PO for', target: 'SKU-4821 — 500 units', time: '1h ago' },
      { actor: 'Pick System', action: 'picked items for', target: 'SO-8812 — 14 lines', time: '2h ago' },
      { actor: 'Auditor', action: 'completed cycle count', target: 'Zone B3 — 412 SKUs', time: '1d ago' },
    ],
    tableLabel: 'Low Stock Items',
    rowCols: ['SKU', 'Description', 'On Hand', 'Reorder Point', 'Status'],
    rows: [
      { SKU: 'SKU-4821', Description: 'Raw Material — Grade A Steel', 'On Hand': '42', 'Reorder Point': '100', Status: 'Critical' },
      { SKU: 'SKU-2210', Description: 'Circuit Board Rev3 — Bare', 'On Hand': '88', 'Reorder Point': '150', Status: 'Low' },
      { SKU: 'SKU-1104', Description: 'Gear Housing K2 Blank', 'On Hand': '65', 'Reorder Point': '80', Status: 'Low' },
      { SKU: 'SKU-3380', Description: 'Sensor Module V7 Base', 'On Hand': '23', 'Reorder Point': '50', Status: 'Critical' },
    ],
  },
  schedules: {
    description: 'Calendar events, resource booking, shift planning, and maintenance schedules.',
    kpis: [
      { label: 'Events This Week', value: '142', delta: '+18 vs last week', up: true },
      { label: 'Resource Conflicts', value: '4', delta: 'Needs resolution', up: false },
      { label: 'Maintenance Due', value: '7', delta: 'Next 30 days', up: false },
      { label: 'Utilization', value: '82%', delta: '+3% vs last week', up: true },
    ],
    activities: [
      { actor: 'Scheduler', action: 'booked room for', target: 'Q3 Review — Boardroom A', time: '10m ago' },
      { actor: 'System', action: 'flagged conflict', target: 'WC-02 vs WC-04 — Sep 7', time: '1h ago' },
      { actor: 'Tech Team', action: 'scheduled maintenance', target: 'WC-01 — Sep 10, 06:00', time: '3h ago' },
      { actor: 'HR Bot', action: 'published shifts for', target: 'WH-01 — Week 37', time: '6h ago' },
    ],
    tableLabel: 'Upcoming Events',
    rowCols: ['Event', 'Type', 'Resource', 'Start', 'Duration'],
    rows: [
      { Event: 'Q3 Review', Type: 'Meeting', Resource: 'Boardroom A', Start: 'Sep 06, 10:00', Duration: '2h' },
      { Event: 'WC-01 Maintenance', Type: 'Maintenance', Resource: 'WC-01', Start: 'Sep 10, 06:00', Duration: '4h' },
      { Event: 'Payroll Sync', Type: 'Automated', Resource: 'Finance Bot', Start: 'Sep 11, 00:00', Duration: '30m' },
      { Event: 'Warehouse Count', Type: 'Audit', Resource: 'WH-01 Zone B3', Start: 'Sep 12, 08:00', Duration: '6h' },
    ],
  },
  health: {
    description: 'Employee health programs, wellness tracking, medical leave, and benefits administration.',
    kpis: [
      { label: 'Active Programs', value: '12', delta: '+2 this quarter', up: true },
      { label: 'Enrollment Rate', value: '76%', delta: '+4% vs Q2', up: true },
      { label: 'Claims This Month', value: '84', delta: '-6 vs Aug 2026', up: true },
      { label: 'Avg. Claim Value', value: '$1,240', delta: '-$80 vs last month', up: true },
    ],
    activities: [
      { actor: 'Benefits Bot', action: 'processed claim', target: 'EMP-0821 — $2,100 Medical', time: '30m ago' },
      { actor: 'Wellness Team', action: 'published challenge', target: 'Step Challenge — Sep 2026', time: '2h ago' },
      { actor: 'Admin', action: 'enrolled employee', target: 'Amara Diallo — Dental Plan', time: '4h ago' },
      { actor: 'Insurer', action: 'renewed policy', target: 'Group Health — Sep 2026', time: '2d ago' },
    ],
    tableLabel: 'Active Programs',
    rowCols: ['Program', 'Category', 'Enrolled', 'Utilization', 'Renews'],
    rows: [
      { Program: 'Group Medical', Category: 'Insurance', Enrolled: '1,024', Utilization: '81%', Renews: 'Jan 2027' },
      { Program: 'Dental Plan', Category: 'Insurance', Enrolled: '986', Utilization: '64%', Renews: 'Jan 2027' },
      { Program: 'Step Challenge', Category: 'Wellness', Enrolled: '412', Utilization: '78%', Renews: 'Oct 2026' },
      { Program: 'EAP Counseling', Category: 'Mental Health', Enrolled: '1,248', Utilization: '22%', Renews: 'Mar 2027' },
    ],
  },
  learning: {
    description: 'Learning management, course catalog, certifications, and training compliance.',
    kpis: [
      { label: 'Active Courses', value: '48', delta: '+6 this quarter', up: true },
      { label: 'Completions (MTD)', value: '312', delta: '+44 vs Aug', up: true },
      { label: 'Compliance Rate', value: '88%', delta: '-2% — 3 mandatory overdue', up: false },
      { label: 'Avg. Score', value: '82.4%', delta: '+1.2% vs Q2', up: true },
    ],
    activities: [
      { actor: 'Leo Tanaka', action: 'completed course', target: 'IFRS 17 Accounting Fundamentals', time: '1h ago' },
      { actor: 'L&D Team', action: 'published course', target: 'ERP Power User — Module 4', time: '3h ago' },
      { actor: 'System', action: 'sent reminder', target: '24 staff — Mandatory Safety Training', time: '6h ago' },
      { actor: 'Priya Nair', action: 'earned certificate', target: 'Certified Sales Professional', time: '1d ago' },
    ],
    tableLabel: 'Recent Completions',
    rowCols: ['Employee', 'Course', 'Score', 'Completed', 'Certificate'],
    rows: [
      { Employee: 'Leo Tanaka', Course: 'IFRS 17 Fundamentals', Score: '94%', Completed: 'Sep 05, 2026', Certificate: 'Yes' },
      { Employee: 'Priya Nair', Course: 'Certified Sales Pro', Score: '88%', Completed: 'Sep 04, 2026', Certificate: 'Yes' },
      { Employee: 'Omar Khalid', Course: 'HR Business Partner', Score: '91%', Completed: 'Sep 03, 2026', Certificate: 'Yes' },
      { Employee: 'Amara Diallo', Course: 'System Architecture 301', Score: '97%', Completed: 'Sep 02, 2026', Certificate: 'Yes' },
    ],
  },
  shopping: {
    description: 'Purchase requisitions, vendor catalog, order approvals, and spend analytics.',
    kpis: [
      { label: 'Open POs', value: '61', delta: '+8 this week', up: true },
      { label: 'Spend (MTD)', value: '$842K', delta: '+6% vs Aug', up: false },
      { label: 'Pending Approvals', value: '14', delta: 'Avg. 1.4d wait time', up: false },
      { label: 'Vendor Count', value: '184', delta: '+3 new this month', up: true },
    ],
    activities: [
      { actor: 'Ops Team', action: 'submitted requisition', target: 'PR-2026-0312 — Office Supplies', time: '20m ago' },
      { actor: 'Helen Wu', action: 'approved PO', target: 'PO-4430 — $24,000 Apex Ltd', time: '1h ago' },
      { actor: 'Vendor Bot', action: 'received quote for', target: 'PR-0311 — IT Equipment', time: '3h ago' },
      { actor: 'Procurement', action: 'awarded contract to', target: 'DataCenter Co. — 12-month SLA', time: '1d ago' },
    ],
    tableLabel: 'Pending Approvals',
    rowCols: ['PR Ref', 'Description', 'Vendor', 'Amount', 'Submitted'],
    rows: [
      { 'PR Ref': 'PR-0312', Description: 'Office Supplies Q4', Vendor: 'Staples Pro', Amount: '$3,400', Submitted: 'Sep 05, 2026' },
      { 'PR Ref': 'PR-0311', Description: 'IT Equipment — 8x Laptops', Vendor: 'TechSource', Amount: '$18,400', Submitted: 'Sep 04, 2026' },
      { 'PR Ref': 'PR-0310', Description: 'Raw Material Restock', Vendor: 'Apex Ltd', Amount: '$42,000', Submitted: 'Sep 03, 2026' },
      { 'PR Ref': 'PR-0309', Description: 'Maintenance Spare Parts', Vendor: 'IndusParts Co.', Amount: '$8,200', Submitted: 'Sep 02, 2026' },
    ],
  },
};

function statusColor(s: string) {
  if (['Active', 'Healthy', 'Yes', 'In Progress', 'Critical'].includes(s)) return 'text-cyan-400';
  if (['Warning', 'Low', 'Probation', 'Scheduled'].includes(s)) return 'text-amber-400';
  if (['Inactive', 'Draft'].includes(s)) return 'text-slate-500';
  return 'text-slate-300';
}

interface ModulePageProps {
  moduleConfig?: NavModule;
}

export const ModulePage: React.FC<ModulePageProps> = ({ moduleConfig }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const id = moduleConfig?.id || moduleId || 'crm';
  const data = MODULE_DATA[id];

  const label = moduleConfig?.label || id.toUpperCase();
  const color = moduleConfig?.color || 'bg-cyan-600';

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 text-sm">
        <div className="text-center">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white mx-auto mb-3`}>
            {moduleConfig?.icon || '📦'}
          </div>
          <p className="font-medium text-slate-300 mb-1">{label}</p>
          <p className="text-slate-500">This module is currently being configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-cyan-950/40`}>
          <span className="scale-125">{moduleConfig?.icon || '⚙️'}</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-200 tracking-wide">{label}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{data.description}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {data.kpis.map((k) => (
          <div key={k.label} className="bg-[#111827] border border-slate-800 rounded p-4 shadow-sm hover:border-slate-700 transition-colors">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-mono">{k.label}</p>
            <p className="text-xl font-semibold text-slate-200 font-mono mb-1">{k.value}</p>
            <p className={`text-xs font-mono ${k.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {k.up ? '↑' : '↓'} {k.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 font-mono">Recent Activity</p>
          <div className="space-y-3">
            {data.activities.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5`}>
                  {a.actor
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-200 font-medium">{a.actor}</span> {a.action}{' '}
                    <span className="text-slate-300 font-medium">{a.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">{data.tableLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  {data.rowCols.map((c) => (
                    <th key={c} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    {data.rowCols.map((c) => (
                      <td
                        key={c}
                        className={`px-4 py-2.5 text-xs whitespace-nowrap ${statusColor(row[c])} ${
                          c === data.rowCols[0] ? 'font-medium text-slate-200' : ''
                        }`}
                      >
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
