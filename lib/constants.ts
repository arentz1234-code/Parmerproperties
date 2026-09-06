// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string
}

export interface NavGroup {
  group: string
  items: NavItem[]
}

export const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Activity', href: '/dashboard/activity', icon: 'Activity' },
    ],
  },
  {
    group: 'Properties',
    items: [
      { label: 'Properties', href: '/dashboard/properties', icon: 'Building2' },
      { label: 'Units', href: '/dashboard/units', icon: 'DoorOpen' },
      { label: 'Inspections', href: '/dashboard/inspections', icon: 'ClipboardCheck' },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Tenants', href: '/dashboard/tenants', icon: 'Users' },
      { label: 'Owners', href: '/dashboard/owners', icon: 'Briefcase' },
      { label: 'Vendors', href: '/dashboard/vendors', icon: 'Wrench' },
      { label: 'Leads', href: '/dashboard/leads', icon: 'UserPlus' },
      { label: 'Applications', href: '/dashboard/applications', icon: 'FileText' },
    ],
  },
  {
    group: 'Financials',
    items: [
      { label: 'Payments', href: '/dashboard/payments', icon: 'CreditCard' },
      { label: 'Leases', href: '/dashboard/leases', icon: 'ScrollText' },
      { label: 'Reports', href: '/dashboard/reports/financial', icon: 'BarChart3' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Maintenance', href: '/dashboard/maintenance', icon: 'Hammer' },
      { label: 'Work Orders', href: '/dashboard/work-orders', icon: 'ClipboardList' },
      { label: 'Tasks', href: '/dashboard/tasks', icon: 'CheckSquare' },
      { label: 'Messages', href: '/dashboard/messages', icon: 'MessageSquare' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Occupancy', href: '/dashboard/reports/occupancy', icon: 'PieChart' },
      { label: 'Maintenance', href: '/dashboard/reports/maintenance', icon: 'BarChart2' },
      { label: 'Documents', href: '/dashboard/documents', icon: 'FolderOpen' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
      { label: 'Team', href: '/dashboard/settings/team', icon: 'UsersRound' },
    ],
  },
]

export const TENANT_NAV_ITEMS: NavGroup[] = [
  {
    group: 'My Home',
    items: [
      { label: 'Dashboard', href: '/tenant', icon: 'LayoutDashboard' },
      { label: 'My Lease', href: '/tenant/lease', icon: 'ScrollText' },
      { label: 'Payments', href: '/tenant/payments', icon: 'CreditCard' },
    ],
  },
  {
    group: 'Support',
    items: [
      { label: 'Maintenance', href: '/tenant/maintenance', icon: 'Wrench' },
      { label: 'Messages', href: '/tenant/messages', icon: 'MessageSquare' },
      { label: 'Documents', href: '/tenant/documents', icon: 'FolderOpen' },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'Profile', href: '/tenant/profile', icon: 'User' },
      { label: 'Settings', href: '/tenant/settings', icon: 'Settings' },
    ],
  },
]

// ─── Status Colors ─────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  // Unit Status
  VACANT: 'bg-yellow-100 text-yellow-800',
  OCCUPIED: 'bg-green-100 text-green-800',
  NOTICE: 'bg-orange-100 text-orange-800',
  MAINTENANCE: 'bg-red-100 text-red-800',

  // Lease Status
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',

  // Payment Status
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  WAIVED: 'bg-purple-100 text-purple-800',

  // Application Status
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',

  // Maintenance Status
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  PENDING_PARTS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',

  // Lead Status
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-indigo-100 text-indigo-800',
  TOURED: 'bg-purple-100 text-purple-800',
  APPLIED: 'bg-green-100 text-green-800',
  LOST: 'bg-gray-100 text-gray-800',

  // Inspection Status
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS_INSPECTION: 'bg-indigo-100 text-indigo-800',

  // Task Status
  TODO: 'bg-gray-100 text-gray-800',
  DONE: 'bg-green-100 text-green-800',
}

// ─── Priority Colors ──────────────────────────────────────────────────────────

export const PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-gray-100 text-gray-800 border-gray-200',
}

// ─── Status Labels ─────────────────────────────────────────────────────────────

export const UNIT_STATUS_LABELS: Record<string, string> = {
  VACANT: 'Vacant',
  OCCUPIED: 'Occupied',
  NOTICE: 'Notice Given',
  MAINTENANCE: 'Under Maintenance',
}

export const LEASE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  TERMINATED: 'Terminated',
  PENDING: 'Pending',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  PARTIAL: 'Partial',
  WAIVED: 'Waived',
}

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_PARTS: 'Pending Parts',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DENIED: 'Denied',
  WITHDRAWN: 'Withdrawn',
}

export const MAINTENANCE_PRIORITY_LABELS: Record<string, string> = {
  EMERGENCY: 'Emergency',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  TOURED: 'Toured',
  APPLIED: 'Applied',
  LOST: 'Lost',
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export const INSPECTION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// ─── Select Options ────────────────────────────────────────────────────────────

export const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
]

export const MAINTENANCE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Structural' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'general', label: 'General' },
  { value: 'emergency', label: 'Emergency' },
]

export const VENDOR_TRADES = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'other', label: 'Other' },
]

export const DOCUMENT_CATEGORIES = [
  { value: 'LEASE', label: 'Lease' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'PHOTO', label: 'Photo' },
  { value: 'OTHER', label: 'Other' },
]

export const PAYMENT_METHODS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHECK', label: 'Check' },
  { value: 'CASH', label: 'Cash' },
  { value: 'ACH', label: 'ACH' },
  { value: 'MONEY_ORDER', label: 'Money Order' },
]

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'ZILLOW', label: 'Zillow' },
  { value: 'APARTMENTS_COM', label: 'Apartments.com' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'OTHER', label: 'Other' },
]

// ─── Company Info ─────────────────────────────────────────────────────────────

export const COMPANY_INFO = {
  name: 'Parmer Properties',
  company: 'Parmer Development',
  phone: '(334) 750-2059',
  email: 'leasing@parmerdevelopment.com',
  website: 'parmerdevelopment.com',
  address: 'Auburn, AL',
}

// ─── Demo Credentials ──────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS = {
  manager: {
    email: 'manager@parmerdevelopment.com',
    password: 'demo1234',
    role: 'MANAGER',
    label: 'Property Manager',
  },
  tenant: {
    email: 'tenant@parmerdevelopment.com',
    password: 'demo1234',
    role: 'TENANT',
    label: 'Tenant',
  },
  owner: {
    email: 'owner@parmerdevelopment.com',
    password: 'demo1234',
    role: 'OWNER',
    label: 'Property Owner',
  },
}
