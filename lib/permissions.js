export const PERMISSIONS = {
  ADMIN_ACCESS: "admin.access",
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  SALES_VIEW: "sales.view",
  SUBSCRIPTIONS_VIEW: "subscriptions.view",
  REPORTS_VIEW: "reports.view"
};

const ROLE_PERMISSION_MAP = {
  ADMIN: Object.values(PERMISSIONS),
  USER: []
};

export const getPermissionsForRole = (role) => ROLE_PERMISSION_MAP[role] || [];

export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  return getPermissionsForRole(user.role).includes(permission);
};

export const hasAnyPermission = (user, permissions) => {
  if (!user || !Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

export const canAccessAdminPanel = (user) =>
  hasAnyPermission(user, [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.REPORTS_VIEW
  ]);
