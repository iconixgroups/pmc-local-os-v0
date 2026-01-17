// Project Management Component with Full CRUD for PMC System
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/context';
import { localStorageManager } from '../../lib/storage/manager';
import { Project, Company, ProjectType, ProjectStatus, Priority } from '../../lib/types';
import Modal, { ConfirmDialog } from '../ui/Modal';
import { useToast } from '../ui/Toast';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'pmc', label: 'PMC' },
  { value: 'design_pmc', label: 'Design + PMC' },
  { value: 'liaising', label: 'Liaising' }
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export default function ProjectList() {
  const { user, canAccess } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    companyId: '',
    type: 'architecture' as ProjectType,
    status: 'planning' as ProjectStatus,
    priority: 'medium' as Priority,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalFee: 0,
    teamLeadArchitectId: ''
  });

  const canManageProjects = canAccess('projects', 'create') || canAccess('projects', 'edit');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, companiesData, usersData] = await Promise.all([
        localStorageManager.getProjects(),
        localStorageManager.getCompanies(),
        localStorageManager.getUsers()
      ]);
      
      setCompanies(companiesData);
      
      // Filter projects based on user role and assignments
      let filteredProjects = projectsData;
      
      if (user) {
        // Management/Admin can see all projects
        if (user.role !== 'management' && user.role !== 'admin') {
          // Filter to show projects where user is:
          // 1. Team lead
          // 2. Team member
          // 3. Assigned to the project
          filteredProjects = projectsData.filter(project => {
            // Check if user is team lead
            if (project.teamLeadArchitectId === user.id) return true;
            
            // Check if user is a team member
            const isTeamMember = project.team.some(member => 
              member.userId === user.id && member.isActive
            );
            if (isTeamMember) return true;
            
            // Management can see all projects
            return false;
          });
        }
      }
      
      setProjects(filteredProjects);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      planning: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const resetForm = () => {
    const defaultCompanyId = companies[0]?.id || '';
    setFormData({
      name: '',
      description: '',
      companyId: defaultCompanyId,
      type: 'architecture',
      status: 'planning',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalFee: 0,
      teamLeadArchitectId: user?.id || ''
    });
  };

  const handleCreate = async () => {
    if (!formData.companyId) {
      showToast('error', 'Please select a company');
      return;
    }

    if (!formData.name.trim()) {
      showToast('error', 'Project name is required');
      return;
    }

    try {
      const teamLeadId = user?.id || `lead-${Date.now()}`;
      const newProject = await localStorageManager.createProject({
        name: formData.name,
        description: formData.description,
        companyId: formData.companyId,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        estimatedDuration: 90,
        totalFee: formData.totalFee,
        feeStructure: {
          id: `fee-${Date.now()}`,
          type: 'fixed',
          amount: formData.totalFee
        },
        folderPath: `${formData.name.replace(/\s+/g, '_')}_${Date.now()}`,
        excelFilePath: '',
        folderStructure: {
          id: `folder-${Date.now()}`,
          name: 'Project Structure',
          folders: [],
          companyId: formData.companyId
        },
        team: [{
          id: `member-${Date.now()}`,
          userId: teamLeadId,
          projectId: '',
          role: 'Team Lead',
          allocation: 100,
          joinedDate: new Date(),
          isActive: true
        }],
        teamLeadArchitectId: teamLeadId,
        milestones: [],
        invoices: [],
        documents: []
      });

      // Add user to project's team if not already there
      if (user) {
        await localStorageManager.updateProject(newProject.id, {
          team: [{
            id: `member-${Date.now()}-1`,
            userId: user.id,
            projectId: newProject.id,
            role: 'Team Lead',
            allocation: 100,
            joinedDate: new Date(),
            isActive: true
          }],
          teamLeadArchitectId: user.id
        });
      }

      showToast('success', 'Project created successfully');
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('error', 'Failed to create project');
    }
  };

  const handleEdit = async () => {
    if (!selectedProject) return;

    try {
      await localStorageManager.updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        companyId: formData.companyId,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        totalFee: formData.totalFee
      });

      showToast('success', 'Project updated successfully');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      showToast('error', 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      await localStorageManager.deleteProject(selectedProject.id);
      showToast('success', 'Project deleted successfully');
      setShowDeleteDialog(false);
      setSelectedProject(null);
      loadData();
    } catch (error) {
      showToast('error', 'Failed to delete project');
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      companyId: project.companyId,
      type: project.type,
      status: project.status,
      priority: project.priority,
      startDate: new Date(project.startDate).toISOString().split('T')[0],
      endDate: new Date(project.endDate).toISOString().split('T')[0],
      totalFee: project.totalFee,
      teamLeadArchitectId: project.teamLeadArchitectId
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
        {canManageProjects && (
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
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects..."
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
            {PROJECT_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'You have no assigned projects yet.'
            }
          </p>
          {canManageProjects && (
            <div className="mt-6">
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create New Project
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">
                        {companies.find(c => c.id === project.companyId)?.name || 'Unknown Company'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {project.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Fee: ${project.totalFee.toLocaleString()}</span>
                  <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{project.team.length} members</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(project)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {canManageProjects && (
                      <button
                        onClick={() => openDeleteDialog(project)}
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
        title="Create New Project"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Downtown Office Complex"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee ($)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee ($)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.totalFee}
              onChange={(e) => setFormData({ ...formData, totalFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"? This action cannot be undone and will delete all associated data including invoices, inspections, and milestones.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
