export const PATH = {
  ROOT: '/',
  LOGIN: '/login',
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',

  PARENT_HOME: '/parent',
  PARENT_TRIP: '/parent/trips/:id',

  CODRIVER_HOME: '/codriver',

  DRIVER_HOME: '/driver',
  DRIVER_FUEL: '/driver/fuel',

  ADMIN_TRIPS: '/admin/trips',
  ADMIN_TRIP_NEW: '/admin/trips/new',
  ADMIN_TRIP_DETAIL: '/admin/trips/:id',
  ADMIN_ROUTES: '/admin/routes',
  ADMIN_ROUTE_NEW: '/admin/routes/new',
  ADMIN_ROUTE_EDIT: '/admin/routes/:id/edit',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_USERS: '/admin/users',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_FUEL: '/admin/fuel-logs',
} as const;

export const buildPath = {
  parentTrip: (id: string) => `/parent/trips/${id}`,
  adminTripDetail: (id: string) => `/admin/trips/${id}`,
  adminRouteEdit: (id: string) => `/admin/routes/${id}/edit`,
};