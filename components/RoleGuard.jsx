'use client';

/**
 * RoleGuard Component
 *
 * Conditionally renders children based on user roles.
 * Used to show/hide UI elements based on user permissions.
 */

import { useAuth, UserRole } from '@/contexts/AuthContext';

/**
 * Guard component that renders children only if user has required role(s)
 *
 * @param {Object} props
 * @param {string|string[]} props.roles - Required role(s) to render children
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} props.fallback - Content to render if not authorized (optional)
 * @param {boolean} props.requireAll - If true, user must have ALL roles; if false, user needs ANY role
 */
export function RoleGuard({ roles, children, fallback = null, requireAll = false }) {
  const { hasRole, isAuthenticated, loading } = useAuth();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Must be authenticated to check roles
  if (!isAuthenticated) {
    return fallback;
  }

  // Normalize roles to array
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  // Check if user has required role(s)
  const hasAccess = requireAll
    ? requiredRoles.every((role) => hasRole(role))
    : requiredRoles.some((role) => hasRole(role));

  if (hasAccess) {
    return children;
  }

  return fallback;
}

/**
 * Donor-only content
 */
export function DonorOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={UserRole.DONOR} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Volunteer-only content
 */
export function VolunteerOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={UserRole.VOLUNTEER} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Client-only content
 */
export function ClientOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={UserRole.CLIENT} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Admin-only content
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Staff content (admin or volunteer)
 */
export function StaffOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={[UserRole.ADMIN, UserRole.VOLUNTEER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Hook for role-based rendering
 */
export function useRoleAccess() {
  const { hasRole, isAdmin, isDonor, isVolunteer, isClient, isAuthenticated } = useAuth();

  return {
    hasRole,
    isAdmin: isAdmin(),
    isDonor: isDonor(),
    isVolunteer: isVolunteer(),
    isClient: isClient(),
    isAuthenticated,
    canAccessDonorFeatures: isDonor() || isAdmin(),
    canAccessVolunteerFeatures: isVolunteer() || isAdmin(),
    canAccessClientFeatures: isClient() || isAdmin(),
    canAccessAdminFeatures: isAdmin(),
  };
}

export default RoleGuard;
