// Main app component with navigation and routing
"use client";

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth/context';
import { localStorageManager } from '../lib/storage/manager';
import Login from '../components/auth/Login';
import Navigation from '../components/ui/Navigation';
import ProjectList from '../components/projects/ProjectList';
import TeamsManagement from '../components/teams/TeamsManagement';
import InvoicesManagement from '../components/invoices/InvoicesManagement';
import InspectionsManagement from '../components/inspections/InspectionsManagement';
import ReportsPage from '../components/reports/ReportsPage';
import Dashboard from '../components/dashboard/Dashboard';
import { ToastProvider } from '../components/ui/Toast';

type Page = 'dashboard' | 'projects' | 'teams' | 'invoices' | 'inspections' | 'reports';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data if none exists
        await localStorageManager.initializeSampleData();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage your architecture and PMC projects
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <ProjectList />
              </div>
            </div>
          </div>
        );
      case 'teams':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage project teams and resources
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <TeamsManagement />
              </div>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Generate and manage project invoices
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <InvoicesManagement />
              </div>
            </div>
          </div>
        );
      case 'inspections':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Schedule and track site inspections
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <InspectionsManagement />
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Generate and view project reports
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <ReportsPage />
              </div>
            </div>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing PMC System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}