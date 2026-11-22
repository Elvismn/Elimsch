require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Vehicle = require('../src/models/Vehicle');
const Route = require('../src/models/Route');
const Student = require('../src/models/Student');
const Trip = require('../src/models/Trip');
const FuelLog = require('../src/models/FuelLog');

const SALT_ROUNDS = 10;

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Route.deleteMany({}),
    Student.deleteMany({}),
    Trip.deleteMany({}),
    FuelLog.deleteMany({}),
  ]);
  console.log('🧹 Cleared collections');

  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const [admin, driver, coDriver, parent] = await User.create([
    { name: 'Admin User', email: 'admin@elimsch.com', passwordHash, role: 'admin', phone: '+254700000001' },
    { name: 'John Driver', email: 'driver@elimsch.com', passwordHash, role: 'driver', phone: '+254700000002' },
    { name: 'Jane CoDriver', email: 'codriver@elimsch.com', passwordHash, role: 'co-driver', phone: '+254700000003' },
    { name: 'Mary Parent', email: 'parent@elimsch.com', passwordHash, role: 'parent', phone: '+254700000004' },
  ]);
  console.log('👤 Users created');

  const vehicle = await Vehicle.create({
    plateNumber: 'KDJ 123X',
    makeModel: 'Toyota Hiace 2020',
    capacity: 14,
    fuelTankCapacity: 70,
    currentOdometer: 45000,
    status: 'active',
  });
  console.log('🚐 Vehicle created');

  const amRoute = await Route.create({
    name: 'Route A - Westlands (AM)',
    shiftType: 'am',
    stops: [
      { stopName: 'Westlands Terminal', sequenceOrder: 1, location: { type: 'Point', coordinates: [36.8060, -1.2670] }, geofenceRadiusMeters: 100 },
      { stopName: 'Parklands Stop', sequenceOrder: 2, location: { type: 'Point', coordinates: [36.8230, -1.2620] }, geofenceRadiusMeters: 100 },
      { stopName: 'School Gate', sequenceOrder: 3, location: { type: 'Point', coordinates: [36.8180, -1.2200] }, geofenceRadiusMeters: 100 },
    ],
  });

  const pmRoute = await Route.create({
    name: 'Route A - Westlands (PM)',
    shiftType: 'pm',
    stops: [
      { stopName: 'School Gate', sequenceOrder: 1, location: { type: 'Point', coordinates: [36.8180, -1.2200] }, geofenceRadiusMeters: 100 },
      { stopName: 'Parklands Stop', sequenceOrder: 2, location: { type: 'Point', coordinates: [36.8230, -1.2620] }, geofenceRadiusMeters: 100 },
      { stopName: 'Westlands Terminal', sequenceOrder: 3, location: { type: 'Point', coordinates: [36.8060, -1.2670] }, geofenceRadiusMeters: 100 },
    ],
  });
  console.log('🛣️  Routes created');

  const [alice, bob] = await Student.create([
    {
      firstName: 'Alice', lastName: 'Parent', parentId: parent._id,
      amAssignment: { routeId: amRoute._id, stopId: amRoute.stops[0]._id },
      pmAssignment: { routeId: pmRoute._id, stopId: pmRoute.stops[2]._id },
      gradeOrClass: 'Grade 5',
    },
    {
      firstName: 'Bob', lastName: 'Parent', parentId: parent._id,
      amAssignment: { routeId: amRoute._id, stopId: amRoute.stops[1]._id },
      pmAssignment: { routeId: pmRoute._id, stopId: pmRoute.stops[1]._id },
      gradeOrClass: 'Grade 3',
    },
  ]);
  console.log('🎓 Students created');

  console.log('\n=== ✅ Seed complete ===\n');
  console.log('Login credentials (all use password: Password123!)');
  console.log('  Admin:     admin@elimsch.com');
  console.log('  Driver:    driver@elimsch.com');
  console.log('  Co-Driver: codriver@elimsch.com');
  console.log('  Parent:    parent@elimsch.com\n');
  console.log('Sample IDs (use for POST /api/trips):');
  console.log(`  AM Route:    ${amRoute._id}`);
  console.log(`  PM Route:    ${pmRoute._id}`);
  console.log(`  Vehicle:     ${vehicle._id}`);
  console.log(`  Driver:      ${driver._id}`);
  console.log(`  Co-Driver:   ${coDriver._id}`);
  console.log(`  Parent:      ${parent._id}`);
  console.log(`  Student 1:   ${alice._id}  (QR: ${alice.qrCodeIdentifier})`);
  console.log(`  Student 2:   ${bob._id}  (QR: ${bob.qrCodeIdentifier})\n`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});