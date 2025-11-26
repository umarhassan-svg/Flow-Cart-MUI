// src/utils/loadNavItems.ts
import type { ReactNode } from "react";
import rolesService from "../services/roles.service";
import { getCurrentUser } from "./ServicesHelpers/AuthHelpers";

export type NavItem = {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
};

/** Helpers */
function normalizePageKey(raw: unknown): string {
  if (raw == null) return "";
  const s = String(raw).trim().toLowerCase();
  if (!s) return "";
  const parts = s.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : s;
}



/** Convert 'user-management' | 'user_management' | 'user management' | 'users' -> PascalCase 'UserManagement', 'Users' */
function toPascalCase(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

/**
 * Build nav items for the current (logged-in) user using roles -> pages mapping.
 *
 * Rules:
 *  - key: normalized page key (last path segment, lowercased)
 *  - label: PascalCase version of the key
 *  - path: /<roleName>/<pageKey> where roleName is the first user role that contains that page
 *
 * Returns [] when no user found.
 */
export async function loadNavItemsForCurrentUser(): Promise<NavItem[]> {
  const user = getCurrentUser();
  if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
    return [];
  }

  // fetch all roles once
  const allRoles = await rolesService.getRoles();

  // keep insertion order and dedupe
  const seen = new Set<string>();
  const navItems: NavItem[] = [];

  // iterate user's roles in order — this lets us pick the "first role" that grants a page
  for (const roleName of user.roles) {
    const role = allRoles.find((r) => r.name === roleName);
    if (!role || !Array.isArray(role.pages)) continue;

    for (const rawPage of role.pages) {
      const key = normalizePageKey(rawPage);
      if (!key || seen.has(key)) continue;
      seen.add(key);

      const label = toPascalCase(key);
      // path uses the role that granted this page; prefer lowercase role in path
      const path = `/${encodeURIComponent(String(roleName).toLowerCase())}/${encodeURIComponent(key)}`;

      navItems.push({ key, label, path });
    }
  }

  return navItems;
}
