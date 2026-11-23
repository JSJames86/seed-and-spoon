// Who can be invited to log in, and how each group is labeled.
// Access is by invitation only: these are the only roles an invite can grant.
// Server routes import this list to validate roles, so the UI and API can't drift.

export const INVITABLE_ROLES = [
  { value: 'client', label: 'Client family' },
  { value: 'donor', label: 'Donor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'board', label: 'Board member' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
];

export const INVITABLE_ROLE_VALUES = INVITABLE_ROLES.map((r) => r.value);

export function roleLabel(value) {
  return INVITABLE_ROLES.find((r) => r.value === value)?.label ?? value;
}
