// Inspections Management Component for PMC System with Full CRUD
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { localStorageManager } from '../../lib/storage/manager';
import { Inspection, Project, InspectionStatus, ComplianceStatus } from '../../lib/types';
import Modal, { ConfirmDialog } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface InspectionWithProject extends Inspection {
  projectId: string;
  projectName?: string;
  milestoneId?: string;
}

const INSPECTION_STATUSES: { value: InspectionStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const COMPLIANCE_STATUSES: { value: ComplianceStatus; label: string }[] = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partially_compliant', label: 'Partially Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
  { value: 'pending_review', label: 'Pending Review' }
];

export default function InspectionsManagement() {
  const { canAccess } = useAuth();
  const { showToast } = useToast();
  const [inspections, setInspections] = useState<InspectionWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionWithProject | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    status: 'scheduled' as InspectionStatus,
    complianceStatus: 'pending_review' as ComplianceStatus,
    observations: '',
    recommendations: ''
  });

  const canManageInspections = canAccess('inspections', 'create') || canAccess('inspections', 'edit');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData] = await Promise.all([
        localStorageManager.getProjects()
      ]);
      setProjects(projectsData);
      
      const allInspections: InspectionWithProject[] = [];
      projectsData.forEach(project => {
        // Check project-level inspections
        if (project.inspections) {
          project.inspections.forEach(inspection => {
            allInspections.push({
              ...inspection,
              projectId: project.id,
              projectName: project.name
            });
          });
        }
      });
      setInspections(allInspections);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('error', 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inspection.observations.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'scheduled',
      complianceStatus: 'pending_review',
      observations: '',
      recommendations: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.projectId) {
      showToast('error', 'Please select a project');
      return;
    }

    try {
      await localStorageManager.createInspection({
        ...formData,
        inspectionDate: new Date(formData.inspectionDate),
        inspectorId: 'current-user',
        milestoneId: undefined,
        taskId: undefined,
        photos: [],
        reportPath: undefined,
        nextInspectionDate: undefined
      });
      showToast('success', 'Inspection scheduled successfully');
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      showToast('error', 'Failed to schedule inspection');
    }
  };

  const handleEdit = async () => {
    if (!selectedInspection) return;

    try {
      await localStorageManager.updateInspection(selectedInspection.id, {
        ...formData,
        inspectionDate: new Date(formData.inspectionDate)
      });
      showToast('success', 'Inspection updated successfully');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      showToast('error', 'Failed to update inspection');
    }
  };

  const handleDelete = async () => {
    if (!selectedInspection) return;

    try {
      await localStorageManager.deleteInspection(selectedInspection.id);
      showToast('success', 'Inspection deleted successfully');
      setShowDeleteDialog(false);
      setSelectedInspection(null);
      loadData();
    } catch (error) {
      showToast('error', 'Failed to delete inspection');
    }
  };

  const openEditModal = (inspection: InspectionWithProject) => {
    setSelectedInspection(inspection);
    setFormData({
      title: inspection.title,
      description: inspection.description,
      projectId: inspection.projectId,
      inspectionDate: new Date(inspection.inspectionDate).toISOString().split('T')[0],
      status: inspection.status,
      complianceStatus: inspection.complianceStatus,
      observations: inspection.observations,
      recommendations: inspection.recommendations
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (inspection: InspectionWithProject) => {
    setSelectedInspection(inspection);
    setShowDeleteDialog(true);
  };

  const calculateStats = () => {
    return {
      total: filteredInspections.length,
      scheduled: filteredInspections.filter(i => i.status === 'scheduled').length,
      completed: filteredInspections.filter(i => i.status === 'completed').length,
      compliant: filteredInspections.filter(i => i.complianceStatus === 'compliant').length
    };
  };

  const stats = calculateStats();

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
        {canManageInspections && (
          <button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                  <dd className="text-lg font-medium text-yellow-600">{stats.scheduled}</dd>
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
                  <dd className="text-lg font-medium text-green-600">{stats.completed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Compliant</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.compliant}</dd>
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
            {INSPECTION_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
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
          {filteredInspections.map((inspection) => (
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
                      <p className="text-sm text-gray-500">{inspection.projectName}</p>
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
                    <span className="text-sm text-gray-500">Inspector: {inspection.inspectorId}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(inspection)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {canManageInspections && (
                      <button
                        onClick={() => openDeleteDialog(inspection)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule New Inspection"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Foundation Inspection"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InspectionStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {INSPECTION_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what will be inspected..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Schedule Inspection
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Inspection"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InspectionStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {INSPECTION_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
              <select
                value={formData.complianceStatus}
                onChange={(e) => setFormData({ ...formData, complianceStatus: e.target.value as ComplianceStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {COMPLIANCE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Inspection"
        message={`Are you sure you want to delete inspection "${selectedInspection?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
