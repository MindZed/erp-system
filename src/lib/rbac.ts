import { UserRole } from "@prisma/client";

const ALLOWED_MANAGER_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.MANAGER,
]);

export function isManagerOrAdmin(role: UserRole): boolean {
  return ALLOWED_MANAGER_ROLES.has(role);
}
