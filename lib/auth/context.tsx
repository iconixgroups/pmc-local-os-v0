// Authentication Context and Hooks for PMC System
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { localStorageManager } from '../storage/manager';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  'management': ['view_all', 'edit_all', 'delete_all', 'create_company', 'manage_users', 'view_financials'],
  'pmc_head': ['view_projects', 'edit_projects', 'manage_teams', 'view_financials', 'create_milestones'],
  'team_lead_architect': ['view_projects', 'edit_projects', 'manage_tasks', 'create_inspections'],
  'architect': ['view_projects', 'edit_tasks', 'view_own_tasks'],
  'engineer': ['view_projects', 'edit_tasks', 'view_own_tasks'],
  'site_engineer': ['view_projects', 'create_inspections', 'edit_inspections'],
  'accounts': ['view_financials', 'create_invoices', 'edit_invoices', 'manage_billing'],
  'admin': ['view_all', 'edit_all', 'delete_all', 'manage_system', 'backup_data']
};

const RESOURCE_PERMISSIONS = {
  'projects': {
    'view': ['management', 'pmc_head', 'team_lead_architect', 'architect', 'engineer', 'site_engineer'],
    'edit': ['management', 'pmc_head', 'team_lead_architect'],
    'create': ['management', 'pmc_head', 'team_lead_architect'],
    'delete': ['management', 'admin']
  },
  'teams': {
    'view': ['management', 'pmc_head', 'team_lead_architect'],
    'manage': ['management', 'pmc_head', 'team_lead_architect']
  },
  'financials': {
    'view': ['management', 'pmc_head', 'accounts'],
    'edit': ['management', 'accounts']
  },
  'users': {
    'view': ['management', 'pmc_head', 'admin'],
    'manage': ['management', 'admin']
  },
  'inspections': {
    'view': ['management', 'pmc_head', 'team_lead_architect', 'architect', 'engineer', 'site_engineer'],
    'create': ['team_lead_architect', 'site_engineer'],
    'edit': ['team_lead_architect', 'site_engineer']
  },
  'invoices': {
    'view': ['management', 'pmc_head', 'accounts'],
    'create': ['accounts', 'pmc_head'],
    'edit': ['accounts']
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('pmc_current_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Validate user still exists
          const existingUser = await localStorageManager.getUserById(userData.id);
          if (existingUser) {
            setUser(existingUser);
          } else {
            localStorage.removeItem('pmc_current_user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('pmc_current_user');
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      // Simple authentication - in real app, this would be more secure
      const users = await localStorageManager.getUsers();
      const foundUser = users.find(u => u.email === email && u.active);

      if (foundUser) {
        // In a real app, you'd verify the password hash
        setUser(foundUser);
        localStorage.setItem('pmc_current_user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pmc_current_user');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.includes(user.role);
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    const resourcePermissions = RESOURCE_PERMISSIONS[resource as keyof typeof RESOURCE_PERMISSIONS];
    
    if (!resourcePermissions) return false;
    
    const allowedRoles = resourcePermissions[action as keyof typeof resourcePermissions];
    if (!allowedRoles) return false;
    
    return hasRole(allowedRoles as UserRole[]);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[],
  requiredPermission?: { resource: string; action: string }
) => {
  const WithAuthComponent = (props: P) => {
    const { user, hasRole, canAccess } = useAuth();

    if (!user) {
      return <div>Please log in to access this page.</div>;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      return <div>You don&apos;t have permission to access this page.</div>;
    }

    if (requiredPermission && !canAccess(requiredPermission.resource, requiredPermission.action)) {
      return <div>You don&apos;t have permission to perform this action.</div>;
    }

    return <Component {...props} />;
  };

  WithAuthComponent.displayName = 'withAuth';

  return WithAuthComponent;
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user, hasRole, canAccess } = useAuth();

  const hasPermission = (resource: string, action: string): boolean => {
    return canAccess(resource, action);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.every(role => role === user.role);
  };

  return {
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    user,
    isAdmin: user?.role === 'admin' || user?.role === 'management',
    isManagement: user?.role === 'management',
    isPMCHead: user?.role === 'pmc_head',
    isTeamLead: user?.role === 'team_lead_architect',
    canManageProjects: canAccess('projects', 'manage'),
    canViewFinancials: canAccess('financials', 'view'),
    canManageUsers: canAccess('users', 'manage')
  };
};