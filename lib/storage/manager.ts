// Local Storage System for PMC Application
// Provides local-first data persistence using browser storage APIs

import { 
  Project, 
  Company, 
  User, 
  Milestone, 
  Task, 
  Inspection, 
  BillCertification, 
  Invoice,
  DocumentReference,
  UserRole,
  ProjectType,
  ProjectStatus
} from '../types';

export class LocalStorageManager {
  private readonly COMPANIES_KEY = 'pmc_companies';
  private readonly PROJECTS_KEY = 'pmc_projects';
  private readonly USERS_KEY = 'pmc_users';
  private readonly SETTINGS_KEY = 'pmc_settings';
  private readonly SYNC_QUEUE_KEY = 'pmc_sync_queue';

  // Company Management
  async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const newCompany: Company = {
      ...company,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const companies = await this.getCompanies();
    companies.push(newCompany);
    localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(companies));
    
    return newCompany;
  }

  async getCompanies(): Promise<Company[]> {
    const companies = localStorage.getItem(this.COMPANIES_KEY);
    return companies ? JSON.parse(companies) : [];
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const companies = await this.getCompanies();
    return companies.find(company => company.id === id) || null;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const companies = await this.getCompanies();
    const index = companies.findIndex(company => company.id === id);
    
    if (index === -1) return null;
    
    companies[index] = {
      ...companies[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(companies));
    return companies[index];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const companies = await this.getCompanies();
    const filteredCompanies = companies.filter(company => company.id !== id);
    
    if (filteredCompanies.length === companies.length) return false;
    
    localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(filteredCompanies));
    return true;
  }

  // Project Management
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projects = await this.getProjects();
    projects.push(newProject);
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    
    return newProject;
  }

  async getProjects(companyId?: string): Promise<Project[]> {
    const projects = localStorage.getItem(this.PROJECTS_KEY);
    let allProjects: Project[] = projects ? JSON.parse(projects) : [];
    
    if (companyId) {
      allProjects = allProjects.filter(project => project.companyId === companyId);
    }
    
    return allProjects;
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find(project => project.id === id) || null;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = await this.getProjects();
    const index = projects.findIndex(project => project.id === id);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filteredProjects));
    return true;
  }

  // User Management
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const users = await this.getUsers();
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
    return true;
  }

  // Milestone Management
  async createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Milestone> {
    const newMilestone: Milestone = {
      ...milestone,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = await this.getProjectById(milestone.projectId);
    if (!project) throw new Error('Project not found');

    project.milestones.push(newMilestone);
    await this.updateProject(project.id, project);
    
    return newMilestone;
  }

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone | null> {
    // Find project containing this milestone
    const projects = await this.getProjects();
    for (const project of projects) {
      const milestoneIndex = project.milestones.findIndex(m => m.id === id);
      if (milestoneIndex !== -1) {
        project.milestones[milestoneIndex] = {
          ...project.milestones[milestoneIndex],
          ...updates,
          updatedAt: new Date(),
        };
        
        await this.updateProject(project.id, project);
        return project.milestones[milestoneIndex];
      }
    }
    
    return null;
  }

  // Task Management
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Find project and milestone containing this task
    const projects = await this.getProjects();
    for (const project of projects) {
      const milestoneIndex = project.milestones.findIndex(m => m.id === task.milestoneId);
      if (milestoneIndex !== -1) {
        project.milestones[milestoneIndex].tasks.push(newTask);
        await this.updateProject(project.id, project);
        return newTask;
      }
    }
    
    throw new Error('Milestone not found');
  }

  // Invoice Management
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = await this.getProjectById(invoice.projectId);
    if (!project) throw new Error('Project not found');

    project.invoices.push(newInvoice);
    await this.updateProject(project.id, project);
    
    return newInvoice;
  }

  async updateInvoice(projectId: string, invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const project = await this.getProjectById(projectId);
    if (!project) return null;

    const invoiceIndex = project.invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex === -1) return null;

    project.invoices[invoiceIndex] = {
      ...project.invoices[invoiceIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.updateProject(project.id, project);
    return project.invoices[invoiceIndex];
  }

  async deleteInvoice(projectId: string, invoiceId: string): Promise<boolean> {
    const project = await this.getProjectById(projectId);
    if (!project) return false;

    const originalLength = project.invoices.length;
    project.invoices = project.invoices.filter(inv => inv.id !== invoiceId);

    if (project.invoices.length === originalLength) return false;

    await this.updateProject(project.id, project);
    return true;
  }

  async getInvoiceById(projectId: string, invoiceId: string): Promise<Invoice | null> {
    const project = await this.getProjectById(projectId);
    if (!project) return null;
    return project.invoices.find(inv => inv.id === invoiceId) || null;
  }

  // Inspection Management
  async createInspection(inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inspection> {
    const newInspection: Inspection = {
      ...inspection,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projects = await this.getProjects();
    for (const project of projects) {
      const milestoneIndex = project.milestones.findIndex(m => m.id === inspection.milestoneId);
      if (milestoneIndex !== -1) {
        project.milestones[milestoneIndex].inspections?.push(newInspection);
        await this.updateProject(project.id, project);
        return newInspection;
      }
    }
    
    // If no milestone, store in project-level inspections array (add if doesn't exist)
    const targetProject = await this.getProjectById(inspection.projectId);
    if (targetProject) {
      if (!targetProject.inspections) {
        targetProject.inspections = [];
      }
      targetProject.inspections.push(newInspection);
      await this.updateProject(targetProject.id, targetProject);
    }
    
    return newInspection;
  }

  async updateInspection(inspectionId: string, updates: Partial<Inspection>): Promise<Inspection | null> {
    const projects = await this.getProjects();
    for (const project of projects) {
      // Check project-level inspections
      if (project.inspections) {
        const inspectionIndex = project.inspections.findIndex(i => i.id === inspectionId);
        if (inspectionIndex !== -1) {
          project.inspections[inspectionIndex] = {
            ...project.inspections[inspectionIndex],
            ...updates,
            updatedAt: new Date(),
          };
          await this.updateProject(project.id, project);
          return project.inspections[inspectionIndex];
        }
      }
      
      // Check milestone-level inspections
      for (const milestone of project.milestones) {
        if (milestone.inspections) {
          const inspectionIndex = milestone.inspections.findIndex(i => i.id === inspectionId);
          if (inspectionIndex !== -1) {
            milestone.inspections[inspectionIndex] = {
              ...milestone.inspections[inspectionIndex],
              ...updates,
              updatedAt: new Date(),
            };
            await this.updateProject(project.id, project);
            return milestone.inspections[inspectionIndex];
          }
        }
      }
    }
    return null;
  }

  async deleteInspection(inspectionId: string): Promise<boolean> {
    const projects = await this.getProjects();
    for (const project of projects) {
      // Check project-level inspections
      if (project.inspections) {
        const originalLength = project.inspections.length;
        project.inspections = project.inspections.filter(i => i.id !== inspectionId);
        if (project.inspections.length !== originalLength) {
          await this.updateProject(project.id, project);
          return true;
        }
      }
      
      // Check milestone-level inspections
      for (const milestone of project.milestones) {
        if (milestone.inspections) {
          const originalLength = milestone.inspections.length;
          milestone.inspections = milestone.inspections.filter(i => i.id !== inspectionId);
          if (milestone.inspections.length !== originalLength) {
            await this.updateProject(project.id, project);
            return true;
          }
        }
      }
    }
    return false;
  }

  async getAllInspections(): Promise<Inspection[]> {
    const projects = await this.getProjects();
    const inspections: Inspection[] = [];
    
    for (const project of projects) {
      if (project.inspections) {
        inspections.push(...project.inspections);
      }
      for (const milestone of project.milestones) {
        if (milestone.inspections) {
          inspections.push(...milestone.inspections);
        }
      }
    }
    
    return inspections;
  }

  // Dashboard Data
  async getDashboardData(): Promise<{
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
    recentProjects: Project[];
  }> {
    const projects = await this.getProjects();
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const delayedProjects = projects.filter(p => 
      p.status === 'on_hold' || 
      (p.endDate && new Date(p.endDate) < new Date() && p.status !== 'completed')
    ).length;
    const totalRevenue = projects.reduce((sum, p) => sum + p.totalFee, 0);
    
    const allInvoices = projects.flatMap(p => p.invoices);
    const pendingInvoices = allInvoices.filter(i => i.status === 'issued').length;
    const overdueInvoices = allInvoices.filter(i => 
      i.status === 'issued' && new Date(i.dueDate) < new Date()
    ).length;
    
    const recentProjects = projects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      delayedProjects,
      totalRevenue,
      pendingInvoices,
      overdueInvoices,
      resourceUtilization: 75, // Mock data
      upcomingDeadlines: 3, // Mock data
      pendingInspections: 5, // Mock data
      recentProjects,
    };
  }

  // Search functionality
  async searchProjects(query: string): Promise<Project[]> {
    const projects = await this.getProjects();
    const lowercaseQuery = query.toLowerCase();
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.type.toLowerCase().includes(lowercaseQuery) ||
      project.status.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with sample data for demonstration
  async initializeSampleData(): Promise<void> {
    const existingCompanies = await this.getCompanies();
    if (existingCompanies.length > 0) return; // Already initialized

    // Create sample company
    const sampleCompany: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
      name: "Architecture Consultancy Ltd",
      address: "123 Business District, City",
      phone: "+1-555-0123",
      email: "info@archconsult.com",
      defaultFolderStructure: {
        id: "default-folder",
        name: "Standard PMC Structure",
        folders: [],
        companyId: ""
      },
      defaultExcelTemplate: "standard",
      active: true
    };

    const company = await this.createCompany(sampleCompany);

    // Create sample user (admin)
    const adminUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      name: "System Admin",
      email: "admin@pmc.com",
      role: 'admin',
      companyId: company.id,
      projects: [],
      active: true,
      hourlyRate: 100
    };

    await this.createUser(adminUser);

    console.log('Sample data initialized');
  }

  // Export all data for backup
  async exportAllData(): Promise<string> {
    const data = {
      companies: await this.getCompanies(),
      projects: await this.getProjects(),
      users: await this.getUsers(),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  async importAllData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.companies) {
        localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(data.companies));
      }
      
      if (data.projects) {
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(data.projects));
      }
      
      if (data.users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(data.users));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.COMPANIES_KEY);
    localStorage.removeItem(this.PROJECTS_KEY);
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }
}

export const localStorageManager = new LocalStorageManager();