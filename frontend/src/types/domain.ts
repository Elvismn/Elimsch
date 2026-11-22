export type UserRole = 'admin' | 'driver' | 'co-driver' | 'parent';

export type VehicleStatus = 'active' | 'maintenance' | 'out-of-service';
export type ShiftType = 'am' | 'pm';
export type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type ManifestStatus = 'expected' | 'boarded' | 'dropped' | 'no-show' | 'excused';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  plateNumber: string;
  makeModel: string;
  capacity: number;
  fuelTankCapacity: number;
  currentOdometer: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RouteStop {
  _id: string;
  stopName: string;
  sequenceOrder: number;
  location: GeoPoint;
  geofenceRadiusMeters: number;
}

export interface Route {
  _id: string;
  name: string;
  shiftType: ShiftType;
  stops: RouteStop[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAssignment {
  routeId: string;
  stopId: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  parentId: string | User;
  amAssignment: StudentAssignment | null;
  pmAssignment: StudentAssignment | null;
  qrCodeIdentifier: string;
  gradeOrClass?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceItem {
  studentId: string | Student;
  status: ManifestStatus;
  timestamp: string | null;
}

export interface Trip {
  _id: string;
  routeId: string | Route;
  vehicleId: string | Vehicle;
  driverId: string | User;
  coDriverId: string | User | null;
  date: string;
  status: TripStatus;
  attendanceManifest: AttendanceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  _id: string;
  vehicleId: string | Vehicle;
  tripId: string | Trip | null;
  litersAdded: number;
  totalCost: number;
  odometerReading: number;
  loggedBy: string | User;
  createdAt: string;
  updatedAt: string;
}