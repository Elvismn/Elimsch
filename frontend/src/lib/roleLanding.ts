import { PATH } from '@/app/routePaths';
import type { UserRole } from '@/types/domain';

export const ROLE_LANDING: Record<UserRole, string> = {
  admin: PATH.ADMIN_TRIPS,
  driver: PATH.DRIVER_HOME,
  'co-driver': PATH.CODRIVER_HOME,
  parent: PATH.PARENT_HOME,
};

export function roleLanding(role: UserRole | undefined | null): string {
  if (!role) return PATH.LOGIN;
  return ROLE_LANDING[role] ?? PATH.LOGIN;
}