/**
 * FASE 3: Componente para proteger acciones basadas en permisos
 * Oculta o deshabilita elementos según los permisos del usuario
 */
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * ProtectedAction - Wrapper that hides/disables content based on permissions
 * 
 * @param {string|string[]} permission - Required permission(s)
 * @param {boolean} requireAll - If true, requires ALL permissions (default: false = any)
 * @param {string} fallback - 'hide' | 'disable' | 'blur' - How to handle unauthorized
 * @param {string} message - Custom message for tooltip when disabled
 * @param {ReactNode} children - Content to protect
 */
export function ProtectedAction({ 
  permission, 
  requireAll = false,
  fallback = 'hide',
  message = 'No tienes permiso para esta acción',
  children 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const permissionList = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll 
    ? hasAllPermissions(permissionList) 
    : hasAnyPermission(permissionList);

  if (hasAccess) {
    return children;
  }

  // Handle fallback based on type
  switch (fallback) {
    case 'hide':
      return null;
      
    case 'disable':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="opacity-50 cursor-not-allowed pointer-events-none">
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                {message}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
    case 'blur':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <div className="blur-sm pointer-events-none">
                  {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                  <Lock className="w-5 h-5 text-stone-400" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
    default:
      return null;
  }
}

/**
 * OwnerOnly - Only shows content to business owners
 */
export function OwnerOnly({ children, fallback = 'hide' }) {
  const { canManageUsers, loading } = usePermissions();

  if (loading) return null;
  if (!canManageUsers()) {
    if (fallback === 'hide') return null;
    return (
      <div className="opacity-50 cursor-not-allowed pointer-events-none">
        {children}
      </div>
    );
  }

  return children;
}

/**
 * AdminOrOwner - Shows content to admins and owners
 */
export function AdminOrOwner({ children, fallback = 'hide' }) {
  const { isAdminOrOwner, loading } = usePermissions();

  if (loading) return null;
  if (!isAdminOrOwner()) {
    if (fallback === 'hide') return null;
    return (
      <div className="opacity-50 cursor-not-allowed pointer-events-none">
        {children}
      </div>
    );
  }

  return children;
}

export default ProtectedAction;
