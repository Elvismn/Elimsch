import {
  Bus,
  ClipboardList,
  Fuel,
  GraduationCap,
  Home,
  Map,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PATH } from '@/app/routePaths';
import type { UserRole } from '@/types/domain';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Trips', path: PATH.ADMIN_TRIPS, icon: Bus },
    { label: 'Routes', path: PATH.ADMIN_ROUTES, icon: Map },
    { label: 'Vehicles', path: PATH.ADMIN_VEHICLES, icon: Truck },
    { label: 'Users', path: PATH.ADMIN_USERS, icon: Users },
    { label: 'Students', path: PATH.ADMIN_STUDENTS, icon: GraduationCap },
    { label: 'Fuel', path: PATH.ADMIN_FUEL, icon: Fuel },
  ],
  driver: [
    { label: 'Today', path: PATH.DRIVER_HOME, icon: Bus },
    { label: 'Fuel', path: PATH.DRIVER_FUEL, icon: Fuel },
  ],
  'co-driver': [{ label: 'Manifest', path: PATH.CODRIVER_HOME, icon: ClipboardList }],
  parent: [{ label: 'Home', path: PATH.PARENT_HOME, icon: Home }],
};