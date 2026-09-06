// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  MANAGER = 'MANAGER',
  TENANT = 'TENANT',
  OWNER = 'OWNER',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  COMMERCIAL = 'COMMERCIAL',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
}

export enum UnitStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  NOTICE = 'NOTICE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum LeaseStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  PENDING = 'PENDING',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
  WAIVED = 'WAIVED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CHECK = 'CHECK',
  CASH = 'CASH',
  ACH = 'ACH',
  MONEY_ORDER = 'MONEY_ORDER',
}

export enum MaintenancePriority {
  EMERGENCY = 'EMERGENCY',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum MaintenanceStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_PARTS = 'PENDING_PARTS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum DocumentCategory {
  LEASE = 'LEASE',
  INSPECTION = 'INSPECTION',
  NOTICE = 'NOTICE',
  RECEIPT = 'RECEIPT',
  PHOTO = 'PHOTO',
  OTHER = 'OTHER',
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  ZILLOW = 'ZILLOW',
  APARTMENTS_COM = 'APARTMENTS_COM',
  REFERRAL = 'REFERRAL',
  WALK_IN = 'WALK_IN',
  OTHER = 'OTHER',
}

// ─── Emergency Contact ────────────────────────────────────────────────────────

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: Role
  phone?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: PropertyType
  description?: string
  yearBuilt?: number
  createdAt: Date
  updatedAt: Date
}

export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  bedrooms: number
  bathrooms: number
  sqft?: number
  rentAmount: number
  deposit?: number
  status: UnitStatus
  floor?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tenant {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: Date
  emergencyContacts: EmergencyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface Lease {
  id: string
  unitId: string
  tenantId: string
  startDate: Date
  endDate: Date
  rentAmount: number
  deposit: number
  petDeposit?: number
  petAllowed: boolean
  status: LeaseStatus
  renewalStatus?: string
  notes?: string
  signedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  leaseId: string
  tenantId: string
  amount: number
  amountDue: number
  status: PaymentStatus
  method?: PaymentMethod
  dueDate: Date
  paidAt?: Date
  lateFee?: number
  notes?: string
  referenceNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceRequest {
  id: string
  unitId: string
  requestedBy: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  category: string
  vendorId?: string
  scheduledAt?: Date
  completedAt?: Date
  notes?: string
  estimatedCost?: number
  actualCost?: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkOrder {
  id: string
  requestId: string
  vendorId: string
  description: string
  scheduledAt?: Date
  completedAt?: Date
  cost?: number
  notes?: string
  createdAt: Date
}

export interface Vendor {
  id: string
  name: string
  trade: string
  contactName: string
  email?: string
  phone: string
  address?: string
  licenseNumber?: string
  insured: boolean
  rating?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Owner {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  taxId?: string
  createdAt: Date
  updatedAt: Date
}

export interface PropertyOwnership {
  id: string
  propertyId: string
  ownerId: string
  ownershipShare: number
  startDate: Date
  endDate?: Date
}

export interface Document {
  id: string
  name: string
  category: DocumentCategory
  url: string
  mimeType: string
  sizeBytes?: number
  propertyId?: string
  unitId?: string
  tenantId?: string
  leaseId?: string
  uploadedBy: string
  createdAt: Date
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  receiverIds: string[]
  subject?: string
  body: string
  readAt?: Date
  createdAt: Date
}

export interface Application {
  id: string
  unitId: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  income?: number
  employerName?: string
  creditScore?: number
  references?: string
  status: ApplicationStatus
  notes?: string
  submittedAt: Date
  decidedAt?: Date
}

export type InspectionType = 'MOVE_IN' | 'MOVE_OUT' | 'PERIODIC'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'TOURED' | 'APPLIED' | 'LOST'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Inspection {
  id: string
  unitId: string
  type: InspectionType
  status: InspectionStatus
  scheduledAt: Date
  completedAt?: Date
  rooms: Record<string, unknown>
  photos?: string[]
  notes?: string
  conductedBy: string
  createdAt: Date
}

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  propertyId?: string
  unitId?: string
  source: LeadSource
  notes?: string
  status: LeadStatus
  createdAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  assignedTo: string
  dueDate?: Date
  priority: MaintenancePriority
  status: TaskStatus
  createdAt: Date
}

// ─── Compound Types ────────────────────────────────────────────────────────────

export type PropertyWithUnits = Property & {
  units: Unit[]
}

export type UnitWithLease = Unit & {
  lease?: Lease & {
    tenant: Tenant
  }
}

export type TenantWithLease = Tenant & {
  lease?: Lease & {
    unit: Unit & {
      property: Property
    }
  }
}

export interface DashboardKPIs {
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  occupancyRate: number
  rentCollectedThisMonth: number
  overduePayments: number
  openMaintenanceRequests: number
  pendingApplications: number
  totalProperties: number
  activeLeases: number
}
