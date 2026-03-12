/**
 * FASE 3: Hook de Permisos RBAC
 * Verifica permisos del usuario actual y proporciona utilidades para control de acceso
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBusinessUser, setIsBusinessUser] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('nailcost_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/business/my-permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setPermissions(data.permissions || []);
          setRole(data.role);
          setIsBusinessUser(data.is_business_user || false);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission) => {
    // Owner and main business accounts have all permissions
    if (role === 'owner' || (user?.user_type === 'business' && !isBusinessUser)) {
      return true;
    }
    return permissions.includes(permission);
  }, [permissions, role, user, isBusinessUser]);

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback((permissionList) => {
    if (role === 'owner' || (user?.user_type === 'business' && !isBusinessUser)) {
      return true;
    }
    return permissionList.some(p => permissions.includes(p));
  }, [permissions, role, user, isBusinessUser]);

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback((permissionList) => {
    if (role === 'owner' || (user?.user_type === 'business' && !isBusinessUser)) {
      return true;
    }
    return permissionList.every(p => permissions.includes(p));
  }, [permissions, role, user, isBusinessUser]);

  /**
   * Check if user can manage users (only owner)
   */
  const canManageUsers = useCallback(() => {
    return role === 'owner' || (user?.user_type === 'business' && !isBusinessUser);
  }, [role, user, isBusinessUser]);

  /**
   * Check if user is admin or owner
   */
  const isAdminOrOwner = useCallback(() => {
    return role === 'owner' || role === 'administrador' || 
           (user?.user_type === 'business' && !isBusinessUser);
  }, [role, user, isBusinessUser]);

  return {
    permissions,
    role,
    loading,
    isBusinessUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUsers,
    isAdminOrOwner,
  };
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // General
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_USERS: 'manage_users',
  
  // Clients
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENTS: 'create_clients',
  EDIT_CLIENTS: 'edit_clients',
  DELETE_CLIENTS: 'delete_clients',
  
  // Products
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Services
  VIEW_SERVICES: 'view_services',
  CREATE_SERVICES: 'create_services',
  EDIT_SERVICES: 'edit_services',
  DELETE_SERVICES: 'delete_services',
  
  // Appointments
  VIEW_APPOINTMENTS: 'view_appointments',
  CREATE_APPOINTMENTS: 'create_appointments',
  EDIT_APPOINTMENTS: 'edit_appointments',
  DELETE_APPOINTMENTS: 'delete_appointments',
  
  // Invoices
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',
  
  // Reports & Finance
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  VIEW_FINANCES: 'view_finances',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Employees & Payments
  VIEW_EMPLOYEES: 'view_employees',
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_PAYMENTS: 'manage_payments',
};

export default usePermissions;
