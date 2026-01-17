// Excel Integration Utilities for PMC System
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Project,
  ExcelProjectData,
  ProjectTeamMember 
} from '../types';

export class ExcelManager {
  private workbook: XLSX.WorkBook | null = null;
  private filePath: string = '';

  constructor(filePath?: string) {
    this.filePath = filePath || '';
  }

  // Create new Excel workbook with standard PMC structure
  createNewProjectWorkbook(project: Project): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    // Project Info Sheet
    const projectInfoData = [
      ['Project Information'],
      ['Project Name', project.name],
      ['Company', project.companyId],
      ['Type', project.type],
      ['Status', project.status],
      ['Priority', project.priority],
      ['Team Lead Architect', project.teamLeadArchitectId],
      ['Start Date', project.startDate.toLocaleDateString()],
      ['End Date', project.endDate.toLocaleDateString()],
      ['Total Fee', project.totalFee],
      ['Fee Structure', JSON.stringify(project.feeStructure)],
      [''],
      ['Folder Path', project.folderPath],
      ['Excel File Path', project.excelFilePath],
      [''],
      ['Created At', project.createdAt.toLocaleDateString()],
      ['Updated At', project.updatedAt.toLocaleDateString()]
    ];

    const projectInfoSheet = XLSX.utils.aoa_to_sheet(projectInfoData);
    XLSX.utils.book_append_sheet(workbook, projectInfoSheet, 'Project Info');

    // Team Sheet
    const teamData = [
      ['Team Members'],
      ['Name', 'Role', 'Allocation %', 'Hourly Rate', 'Monthly Cost', 'Joined Date'],
      ...project.team.map(member => [
        member.userId,
        member.role,
        member.allocation,
        member.hourlyRate || '',
        member.monthlyCost || '',
        member.joinedDate.toLocaleDateString()
      ])
    ];

    const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team');

    // Milestones Sheet
    const milestonesData = [
      ['Milestones'],
      ['Name', 'Description', 'Order', 'Start Date', 'End Date', 'Status', 'Completion %', 'Tasks Count'],
      ...project.milestones.map(milestone => [
        milestone.name,
        milestone.description,
        milestone.order,
        milestone.startDate.toLocaleDateString(),
        milestone.endDate.toLocaleDateString(),
        milestone.status,
        milestone.completionPercentage,
        milestone.tasks.length
      ])
    ];

    const milestonesSheet = XLSX.utils.aoa_to_sheet(milestonesData);
    XLSX.utils.book_append_sheet(workbook, milestonesSheet, 'Milestones');

    // Tasks Sheet
    const tasksData = [
      ['Tasks'],
      ['Title', 'Description', 'Assigned To', 'Status', 'Priority', 'Estimated Hours', 'Start Date', 'Due Date'],
      ...project.milestones.flatMap(milestone => 
        milestone.tasks.map(_task => [
          _task.title,
          _task.description,
          _task.assignedTo,
          _task.status,
          _task.priority,
          _task.estimatedHours,
          _task.startDate.toLocaleDateString(),
          _task.dueDate.toLocaleDateString()
        ])
      )
    ];

    const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

    // Inspections Sheet
    const inspectionsData = [
      ['Inspections'],
      ['Title', 'Inspector', 'Date', 'Status', 'Compliance', 'Observations', 'Next Inspection'],
      // TODO: Add inspection data when inspections are implemented
    ];

    const inspectionsSheet = XLSX.utils.aoa_to_sheet(inspectionsData);
    XLSX.utils.book_append_sheet(workbook, inspectionsSheet, 'Inspections');

    // Invoices Sheet
    const invoicesData = [
      ['Invoices'],
      ['Number', 'Type', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Description'],
      ...project.invoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.type,
        invoice.amount,
        invoice.issueDate.toLocaleDateString(),
        invoice.dueDate.toLocaleDateString(),
        invoice.status,
        invoice.description
      ])
    ];

    const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
    XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Invoices');

    // Costs Sheet
    const costsData = [
      ['Project Costs'],
      ['Resource', 'Type', 'Cost', 'Period'],
      ['Total Project Fee', 'Revenue', project.totalFee, 'Total'],
      ['Team Costs', 'Cost', '0', 'Monthly'] // Will be calculated
    ];

    const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
    XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs');

    this.workbook = workbook;
    return workbook;
  }

  // Load Excel file
  async loadWorkbook(filePath: string): Promise<XLSX.WorkBook> {
    try {
      const file = await fetch(filePath);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      this.workbook = workbook;
      this.filePath = filePath;
      return workbook;
    } catch (error) {
      console.error('Error loading workbook:', error);
      throw new Error('Failed to load Excel file');
    }
  }

  // Read project data from Excel
  readProjectData(): Partial<Project> | null {
    if (!this.workbook) return null;

    const projectInfo = this.workbook.Sheets['Project Info'];
    const team = this.workbook.Sheets['Team'];
    const milestones = this.workbook.Sheets['Milestones'];
    const tasks = this.workbook.Sheets['Tasks'];
    const invoices = this.workbook.Sheets['Invoices'];

    if (!projectInfo) return null;

    // Parse project info
    const projectData: Partial<Project> = {};
    
    // Basic project info extraction logic
    // This would parse the actual Excel cells and populate the project object

    return projectData;
  }

  // Update Excel with new data
  updateWorkbook(data: Partial<Project>): void {
    if (!this.workbook) return;

    // Update relevant sheets based on data changes
    // Implementation would depend on specific update requirements
  }

  // Save workbook to file
  async saveWorkbook(fileName?: string): Promise<void> {
    if (!this.workbook) throw new Error('No workbook to save');

    const filePath = fileName || this.filePath || 'project_data.xlsx';
    const excelBuffer = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, filePath);
  }

  // Export project to Excel format
  async exportProjectToExcel(project: Project, fileName?: string): Promise<void> {
    const workbook = this.createNewProjectWorkbook(project);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const finalFileName = fileName || `${project.name.replace(/\s+/g, '_')}_Data.xlsx`;
    saveAs(blob, finalFileName);
  }

  // Import data from Excel file
  async importFromExcel(file: File): Promise<ExcelProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const projectData = this.parseWorkbookData(workbook);
          resolve(projectData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private parseWorkbookData(workbook: XLSX.WorkBook): ExcelProjectData {
    // const projectInfo = workbook.Sheets['Project Info'];
    // const team = workbook.Sheets['Team'];
    // const milestones = workbook.Sheets['Milestones'];
    // const tasks = workbook.Sheets['Tasks'];
    // const invoices = workbook.Sheets['Invoices'];

    // Parse data from sheets
    const parsedData: ExcelProjectData = {
      projectInfo: {
        name: '',
        company: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
        totalFee: ''
      },
      team: [],
      milestones: [],
      tasks: [],
      invoices: []
    };

    // Implement parsing logic for each sheet
    // This would extract data from the Excel sheets and format it

    return parsedData;
  }

  // Create folder structure template
  createFolderStructureTemplate(companyId: string, projectName: string): string[] {
    const baseFolder = `${projectName}_${companyId}`;
    
    return [
      `${baseFolder}/01_Agreements`,
      `${baseFolder}/02_Drawings`,
      `${baseFolder}/03_Approvals`,
      `${baseFolder}/04_Inspections`,
      `${baseFolder}/05_Billing`,
      `${baseFolder}/06_Invoices`,
      `${baseFolder}/07_Documentation`,
      `${baseFolder}/08_Photos`,
      `${baseFolder}/09_Certificates`,
      `${baseFolder}/10_Reports`
    ];
  }

  // Sync data between Excel and application
  async syncWithExcel(projectId: string, excelFilePath: string): Promise<boolean> {
    try {
      await this.loadWorkbook(excelFilePath);
      const projectData = this.readProjectData();
      
      if (projectData) {
        // Update local data with Excel data
        // This would involve updating the local store/database
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Excel sync error:', error);
      return false;
    }
  }
}

export const excelManager = new ExcelManager();