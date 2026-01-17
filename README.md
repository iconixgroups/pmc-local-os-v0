# PMC Project Management System

A local-first Architecture & Project Management Consultancy (PMC) web application built with Next.js, React, and TypeScript.

## Features

- **Local-First Architecture**: No cloud dependencies, runs entirely on local systems
- **Excel Integration**: Uses Excel files as the system of record with seamless sync
- **PWA Capabilities**: Installable on mobile devices with offline functionality
- **Role-Based Access**: Comprehensive role system for different user types
- **Project Management**: Complete project lifecycle management
- **Team Management**: Resource allocation and team assignment
- **Financial Tracking**: Invoice generation and billing management
- **Inspection Management**: Site inspection scheduling and compliance tracking

## User Roles

- **Management/Directors**: Full system access and oversight
- **PMC Head/Principal Architect**: Project oversight and team management
- **Team Lead Architect**: Project execution and task management
- **Architect/Engineer**: Task execution and reporting
- **Site Engineer/Inspector**: Inspection management
- **Accounts/Billing**: Financial management
- **Admin/IT**: System administration

## Project Types

- **Architecture**: Design and architectural services
- **PMC**: Project Management Consultancy
- **Design + PMC**: Combined design and project management
- **Liaising**: Client liaison and coordination services

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Access

1. Click "Initialize Sample Data" on the login page
2. Login with:
   - Email: admin@pmc.com
   - Password: password

## Architecture

### Local-First Design

The application is designed to run entirely locally without requiring any cloud services or internet connectivity:

- **Data Storage**: Uses browser localStorage for data persistence
- **Excel Integration**: Reads and writes directly to Excel files
- **Offline Capability**: Service worker enables offline functionality
- **Local Network**: Can be deployed on internal LAN for team access

### Data Structure

```
Company
 └── Projects
      ├── Project Settings
      ├── Project Team
      │    └── Team Lead Architect
      │         └── Project Team Members
      ├── Milestones
      │    └── Tasks
      │         └── Inspections
      │         └── Bill Certifications
      ├── Documents (Folder-Linked)
      ├── Invoices
      └── Cost & Profitability
```

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: Browser localStorage
- **Excel Processing**: xlsx library
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Heroicons

## Core Modules

### 1. Dashboard
- Project overview and KPIs
- Recent activity tracking
- Quick access to key functions

### 2. Project Management
- Project creation and editing
- Status tracking and progress monitoring
- Folder structure generation
- Excel file synchronization

### 3. Team Management
- Resource allocation
- Team member assignment
- Cost tracking and profitability analysis

### 4. Financial Management
- Invoice generation
- Payment tracking
- Bill certification management

### 5. Inspection Management
- Site inspection scheduling
- Compliance tracking
- Report generation

### 6. Document Management
- Folder-based organization
- File linking and referencing
- Version control

## Excel Integration

The system uses Excel files as the single source of truth:

- **Auto-generation**: Creates structured Excel files for each project
- **Two-way Sync**: Reads from and writes back to Excel
- **Conflict Handling**: File lock detection and user alerts
- **Template System**: Standardized Excel templates per company

## Security & Privacy

- **Local Processing**: All data stays on local systems
- **No Cloud Dependency**: No data transmitted to external servers
- **Role-Based Access**: Granular permission system
- **Audit Trail**: Complete activity logging through Excel

## Deployment

### Local Installation

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### PWA Installation

Users can install the application on their devices:

1. Open the application in a supported browser
2. Look for the "Install" prompt or use browser menu
3. The app will be available as a native application

## Development

### Project Structure

```
/home/engine/project
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── projects/         # Project management
│   ├── ui/              # Reusable UI components
│   └── ...
├── lib/                  # Core libraries
│   ├── types/            # TypeScript type definitions
│   ├── storage/         # Local storage management
│   ├── excel/            # Excel integration
│   └── auth/             # Authentication logic
└── public/               # Static assets
    ├── manifest.json      # PWA manifest
    ├── sw.js             # Service worker
    └── icons/            # App icons
```

### Key Files

- `lib/types/index.ts`: Core type definitions
- `lib/storage/manager.ts`: Local storage operations
- `lib/excel/manager.ts`: Excel integration logic
- `lib/auth/context.tsx`: Authentication and authorization
- `components/dashboard/Dashboard.tsx`: Main dashboard component

## Contributing

1. Create feature branches from `main`
2. Follow existing code conventions
3. Add TypeScript types for new features
4. Test on multiple screen sizes
5. Ensure PWA functionality works

## License

This project is proprietary software for Architecture & PMC firms.

## Support

For technical support or feature requests, please contact the development team.

---

**Built for Architecture & PMC firms who prioritize data privacy and local control.**