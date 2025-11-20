

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  // optional direct user permissions (stored server-side)
  permissions: string[];
  // server computed effective permissions (union of role perms + user perms)
  effectivePermissions?: string[];
}


export type LoginValues = {
    email: string;
    password: string;
    remember: boolean;
};