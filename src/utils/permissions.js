export const SUBADMIN_PERMISSION_GROUPS = [
  {
    page: 'products',
    label: 'Products',
    permissions: [
      { key: 'products.view', label: 'View' },
      { key: 'products.create', label: 'Create' },
      { key: 'products.update', label: 'Edit / update' },
      { key: 'products.delete', label: 'Delete' },
    ],
  },
  {
    page: 'categories',
    label: 'Categories',
    permissions: [
      { key: 'categories.view', label: 'View' },
      { key: 'categories.create', label: 'Create' },
      { key: 'categories.update', label: 'Edit / update' },
      { key: 'categories.delete', label: 'Delete' },
    ],
  },
  {
    page: 'orders',
    label: 'Orders',
    permissions: [
      { key: 'orders.view', label: 'View' },
      { key: 'orders.update', label: 'Update status' },
      { key: 'orders.assign_rider', label: 'Assign rider' },
    ],
  },
  {
    page: 'inventory',
    label: 'Inventory',
    permissions: [
      { key: 'inventory.view', label: 'View' },
      { key: 'inventory.update', label: 'Edit / update' },
      { key: 'inventory.restock', label: 'Restock' },
      { key: 'inventory.delete', label: 'Delete' },
    ],
  },
  {
    page: 'branch',
    label: 'Branch',
    permissions: [
      { key: 'branch.view', label: 'View' },
      { key: 'branch.update', label: 'Edit / update' },
    ],
  },
  {
    page: 'profile',
    label: 'Profile',
    permissions: [
      { key: 'profile.view', label: 'View' },
      { key: 'profile.update', label: 'Edit / update' },
    ],
  },
];

export const DEFAULT_SUBADMIN_PERMISSIONS = SUBADMIN_PERMISSION_GROUPS.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

export const hasPermission = (user, permission) => {
  if (user?.role !== 'subadmin') return true;

  const permissions = user.permissions;
  if (!Array.isArray(permissions)) return true;
  if (permissions.includes('*')) return true;

  return permissions.includes(permission);
};

export const canAccessPage = (user, page) => {
  if (user?.role !== 'subadmin') return true;
  if (page === 'dashboard') return true;

  const group = SUBADMIN_PERMISSION_GROUPS.find((item) => item.page === page);
  return group ? hasPermission(user, group.permissions[0].key) : false;
};