export type allowedPages = {
  key: string;
    path: string;
    label: string;
    permission: string;
    order: number;
    icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  // optional direct user permissions (stored server-side)
  permissions: string[];
  // server computed effective permissions (union of role perms + user perms)
  effectivePermissions?: string[];
  // server computed allowed pages (union of role pages + user pages)
  allowedPages?: allowedPages[];

}


export type LoginValues = {
    email: string;
    password: string;
    remember: boolean;
};