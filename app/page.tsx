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
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Overview of your project management activities
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Quick Stats */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Active Projects</span>
                          <span className="text-sm font-semibold text-gray-900">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                          <span className="text-sm font-semibold text-gray-900">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Pending Invoices</span>
                          <span className="text-sm font-semibold text-gray-900">-</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">System initialized successfully</p>
                            <p className="text-xs text-gray-500">Just now</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to PMC Project Management System</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your local-first architecture and project management solution. Navigate using the menu above to manage your projects, teams, and more.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleNavigate('projects')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>View Projects</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('teams')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Manage Teams</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
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
      <AppContent />
    </AuthProvider>
  );
}