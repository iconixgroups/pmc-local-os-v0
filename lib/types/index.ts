// Core Types for PMC Project Management System

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  projects: string[]; // Project IDs
  hourlyRate?: number;
  monthlyCost?: number;
  avatar?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'management' 
  | 'pmc_head' 
  | 'team_lead_architect' 
  | 'architect' 
  | 'engineer' 
  | 'site_engineer' 
  | 'accounts' 
  | 'admin';

export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  defaultFolderStructure: FolderStructure;
  defaultExcelTemplate: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderStructure {
  id: string;
  name: string;
  folders: Folder[];
  companyId: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  children?: Folder[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: Priority;
  teamLeadArchitectId: string;
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // in days
  totalFee: number;
  feeStructure: FeeStructure;
  folderPath: string;
  excelFilePath: string;
  folderStructure: FolderStructure;
  team: ProjectTeamMember[];
  milestones: Milestone[];
  invoices: Invoice[];
  documents: DocumentReference[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType = 'architecture' | 'pmc' | 'design_pmc' | 'liaising';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface FeeStructure {
  id: string;
  type: 'fixed' | 'percentage' | 'hourly' | 'milestone_based';
  amount: number;
  percentage?: number;
  milestones?: MilestonePayment[];
}

export interface MilestonePayment {
  milestoneId: string;
  amount: number;
  percentage: number;
}

export interface ProjectTeamMember {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  allocation: number; // percentage
  hourlyRate?: number;
  monthlyCost?: number;
  joinedDate: Date;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  startDate: Date;
  endDate: Date;
  status: MilestoneStatus;
  completionPercentage: number;
  tasks: Task[];
  billCertifications: BillCertification[];
  invoiceAmount?: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours?: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  dependencies: string[]; // Task IDs
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface Inspection {
  id: string;
  projectId: string;
  milestoneId?: string;
  taskId?: string;
  title: string;
  description: string;
  inspectorId: string;
  inspectionDate: Date;
  status: InspectionStatus;
  complianceStatus: ComplianceStatus;
  observations: string;
  recommendations: string;
  photos: string[]; // File paths
  reportPath?: string;
  nextInspectionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'pending_review';

export interface BillCertification {
  id: string;
  projectId: string;
  milestoneId: string;
  certificationNumber: string;
  amount: number;
  certificationDate: Date;
  certifyingAuthority: string;
  description: string;
  status: CertificationStatus;
  documentPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CertificationStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  type: InvoiceType;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  description: string;
  billCertificationId?: string;
  milestoneId?: string;
  paidDate?: Date;
  paymentMethod?: string;
  documentPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceType = 'pmc_to_client' | 'pmc_to_contractor';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface DocumentReference {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  filePath: string;
  folderPath: string;
  size: number;
  uploadedBy: string; // User ID
  uploadedAt: Date;
  tags: string[];
  isActive: boolean;
}

export type DocumentType = 'agreement' | 'drawing' | 'approval' | 'inspection' | 'billing' | 'invoice' | 'other';

export interface DashboardKPI {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  resourceUtilization: number;
  upcomingDeadlines: number;
  pendingInspections: number;
}

// Excel Data Interfaces
export interface ExcelProjectData {
  projectInfo: {
    name: string;
    company: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    totalFee: string;
  };
  team: Array<{
    name: string;
    role: string;
    allocation: string;
    hourlyRate: string;
  }>;
  milestones: Array<{
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    completion: string;
  }>;
  tasks: Array<{
    title: string;
    assignedTo: string;
    status: string;
    dueDate: string;
  }>;
  invoices: Array<{
    number: string;
    amount: string;
    status: string;
    dueDate: string;
  }>;
}