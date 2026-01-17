// Inspections Management Component for PMC System
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, usePermissions } from '../../lib/auth/context';
import { localStorageManager } from '../../lib/storage/manager';
import { Inspection, Project } from '../../lib/types';

interface InspectionWithProject extends Inspection {
  projectName?: string;
}

export default function InspectionsManagement() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [inspections, setInspections] = useState<InspectionWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsData = await localStorageManager.getProjects();
      setProjects(projectsData);
      
      const allInspections: InspectionWithProject[] = [];
      projectsData.forEach(project => {
        project.milestones.forEach(milestone => {
          // Check for inspections in milestones if implemented
        });
      });
      setInspections(allInspections);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getComplianceColor = (status: string) => {
    const colors: Record<string, string> = {
      compliant: 'bg-green-100 text-green-800',
      partially_compliant: 'bg-yellow-100 text-yellow-800',
      non_compliant: 'bg-red-100 text-red-800',
      pending_review: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectById = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const canCreateInspections = hasPermission('inspections', 'create');

  // Sample inspection data for demo
  const sampleInspections: InspectionWithProject[] = [
    {
      id: 'insp-1',
      projectId: 'sample',
      title: 'Foundation Inspection',
      description: 'Check foundation work for compliance with blueprints',
      inspectorId: 'user-1',
      inspectionDate: new Date('2025-01-20'),
      status: 'completed',
      complianceStatus: 'compliant',
      observations: 'Foundation meets all specifications',
      recommendations: 'Proceed to next phase',
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectName: 'Downtown Office Complex'
    },
    {
      id: 'insp-2',
      projectId: 'sample',
      title: 'Structural Framing Inspection',
      description: 'Inspect steel framing installation',
      inspectorId: 'user-1',
      inspectionDate: new Date('2025-01-25'),
      status: 'scheduled',
      complianceStatus: 'pending_review',
      observations: '',
      recommendations: '',
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectName: 'Downtown Office Complex'
    },
    {
      id: 'insp-3',
      projectId: 'sample',
      title: 'Electrical Rough-In Inspection',
      description: 'Verify electrical wiring meets code requirements',
      inspectorId: 'user-1',
      inspectionDate: new Date('2025-01-15'),
      status: 'completed',
      complianceStatus: 'partially_compliant',
      observations: 'Minor corrections needed in third floor',
      recommendations: 'Address noted issues before drywall',
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectName: 'Riverside Apartments'
    }
  ];

  const displayInspections = inspections.length > 0 ? inspections : sampleInspections;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Management</h2>
          <p className="text-gray-600 mt-1">Schedule and track site inspections</p>
        </div>
        {canCreateInspections && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Schedule Inspection</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {displayInspections.filter(i => i.status === 'scheduled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {displayInspections.filter(i => i.status === 'in_progress').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-green-600">
                    {displayInspections.filter(i => i.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Non-Compliant</dt>
                  <dd className="text-lg font-medium text-red-600">
                    {displayInspections.filter(i => i.complianceStatus === 'non_compliant').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Inspections List */}
      {displayInspections.length === 0 ? (
        <div className="bg-white shadow rounded-lg text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inspections found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Schedule your first inspection to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {displayInspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      inspection.status === 'completed' ? 'bg-green-100' :
                      inspection.status === 'in_progress' ? 'bg-yellow-100' :
                      inspection.status === 'scheduled' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        inspection.status === 'completed' ? 'text-green-600' :
                        inspection.status === 'in_progress' ? 'text-yellow-600' :
                        inspection.status === 'scheduled' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{inspection.title}</h3>
                      <p className="text-sm text-gray-500">{inspection.projectName || getProjectById(inspection.projectId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                      {inspection.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(inspection.complianceStatus)}`}>
                      {inspection.complianceStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">{inspection.description}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Inspection Date</span>
                    <p className="font-medium text-gray-900">{formatDate(inspection.inspectionDate)}</p>
                  </div>
                  {inspection.nextInspectionDate && (
                    <div>
                      <span className="text-gray-500">Next Inspection</span>
                      <p className="font-medium text-gray-900">{formatDate(inspection.nextInspectionDate)}</p>
                    </div>
                  )}
                </div>

                {inspection.observations && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Observations:</span>
                    <p className="text-sm text-gray-900 mt-1">{inspection.observations}</p>
                  </div>
                )}

                {inspection.recommendations && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Recommendations:</span>
                    <p className="text-sm text-gray-900 mt-1">{inspection.recommendations}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-500">Inspector ID: {inspection.inspectorId}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                    {canCreateInspections && (
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
