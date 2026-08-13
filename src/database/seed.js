const bcrypt = require('bcryptjs');
const { sync } = require('./index');
const { models } = require('./associations');

const {
  Role,
  Permission,
  User,
  Property,
  Department,
  Floor,
  RoomType,
  Room,
  Amenity,
  Guest,
  Company,
  LeaveType,
} = models;

const MODULES = [
  'property',
  'booking',
  'guest',
  'room',
  'housekeeping',
  'maintenance',
  'security',
  'accounting',
  'asset',
  'attendance',
  'payroll',
  'staff',
  'reports',
  'settings',
];

async function seed() {
  await sync({ alter: true });

  console.log('[seed] Creating permissions...');
  const permissions = [];
  for (const moduleName of MODULES) {
    for (const action of ['read', 'create', 'update', 'delete']) {
      const name = `${moduleName}.${action}`;
      permissions.push({ name, description: `Can ${action} ${moduleName} data` });
    }
  }
  await Permission.bulkCreate(permissions, { ignoreDuplicates: true });

  console.log('[seed] Creating roles...');
  const roleDefs = [
    { name: 'super_admin', description: 'Full access to all modules' },
    { name: 'admin', description: 'Property administrator' },
    { name: 'front_office', description: 'Desk, bookings, guests, rooms, billing' },
    { name: 'housekeeping', description: 'Room cleaning and tasks' },
    { name: 'maintenance', description: 'Repair requests and work logs' },
    { name: 'security', description: 'Visitors, vehicles, gate passes' },
    { name: 'accounts', description: 'Accounting and finance' },
    { name: 'hr', description: 'Staff, attendance, payroll' },
  ];
  const roles = await Role.bulkCreate(roleDefs, { ignoreDuplicates: true, returning: true });
  const roleByName = {};
  roles.forEach((r) => { roleByName[r.name] = r; });

  const superAdminRole = roleByName.super_admin;
  const allPermissions = await Permission.findAll();
  await superAdminRole.setPermissions(allPermissions);

  console.log('[seed] Creating departments...');
  const departments = await Department.bulkCreate(
    [
      { name: 'Front Office', code: 'FO' },
      { name: 'Housekeeping', code: 'HK' },
      { name: 'Maintenance', code: 'MT' },
      { name: 'Security', code: 'SEC' },
      { name: 'Accounts', code: 'ACC' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'F&B', code: 'FNB' },
    ],
    { ignoreDuplicates: true }
  );

  console.log('[seed] Creating default property...');
  const property = await Property.findOrCreate({
    where: { name: 'Sunset Bay Resort' },
    defaults: {
      legal_name: 'Sunset Bay Resorts Pvt. Ltd.',
      restaurant_name: 'Azure Restaurant',
      phone: '+91 98765 43210',
      email: 'info@sunsetbayresort.com',
      address: 'Beach Road, Kovalam',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      country: 'India',
      gst_number: '32ABCDE1234F1Z5',
      currency: 'INR',
      is_default: true,
      status: 'active',
    },
  });

  console.log('[seed] Creating floors...');
  const floors = await Floor.bulkCreate(
    [
      { name: 'Ground Floor', description: 'Ground level rooms' },
      { name: 'First Floor', description: 'First level rooms' },
      { name: 'Second Floor', description: 'Second level rooms' },
      { name: 'Third Floor', description: 'Third level rooms' },
    ],
    { ignoreDuplicates: true }
  );

  console.log('[seed] Creating amenities...');
  const amenities = await Amenity.bulkCreate(
    [
      { name: 'Air Conditioning' },
      { name: 'Smart TV' },
      { name: 'WiFi' },
      { name: 'Mini Bar' },
      { name: 'Balcony' },
      { name: 'Electric Kettle' },
    ],
    { ignoreDuplicates: true }
  );

  console.log('[seed] Creating room types...');
  const roomTypes = await RoomType.bulkCreate(
    [
      { name: 'Standard', description: 'Comfortable garden-view room', base_rate: 2000, max_adults: 2, max_children: 1, bed_type: 'Queen', status: 'active' },
      { name: 'Deluxe', description: 'Spacious sea-view room', base_rate: 3500, max_adults: 3, max_children: 2, bed_type: 'King', status: 'active' },
      { name: 'Premium', description: 'Luxury suite with balcony', base_rate: 5000, max_adults: 4, max_children: 2, bed_type: 'King', status: 'active' },
    ],
    { ignoreDuplicates: true }
  );

  console.log('[seed] Creating rooms...');
  const roomSeed = [
    ['101', floors[0].floor_id, roomTypes[0].room_type_id],
    ['102', floors[0].floor_id, roomTypes[0].room_type_id],
    ['103', floors[0].floor_id, roomTypes[0].room_type_id],
    ['201', floors[1].floor_id, roomTypes[1].room_type_id],
    ['202', floors[1].floor_id, roomTypes[1].room_type_id],
    ['203', floors[1].floor_id, roomTypes[1].room_type_id],
    ['301', floors[2].floor_id, roomTypes[2].room_type_id],
    ['302', floors[2].floor_id, roomTypes[2].room_type_id],
    ['303', floors[2].floor_id, roomTypes[2].room_type_id],
  ];
  const rooms = [];
  for (const [number, floorId, roomTypeId] of roomSeed) {
    const [room] = await Room.findOrCreate({
      where: { room_number: number },
      defaults: {
        floor_id: floorId,
        room_type_id: roomTypeId,
        property_id: property.property_id,
        status: 'available',
        is_active: true,
      },
    });
    rooms.push(room);
  }

  console.log('[seed] Creating Leave Types...');
  await LeaveType.bulkCreate(
    [
      { name: 'Casual Leave', days_per_year: 12, code: 'CL' },
      { name: 'Sick Leave', days_per_year: 12, code: 'SL' },
      { name: 'Earned Leave', days_per_year: 15, code: 'EL' },
    ],
    { ignoreDuplicates: true }
  );

  console.log('[seed] Creating super admin user...');
  const passwordHash = bcrypt.hashSync('Admin@123', 10);
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@resort.com' },
    defaults: {
      first_name: 'Super',
      last_name: 'Admin',
      password_hash: passwordHash,
      role_id: superAdminRole.role_id,
      is_active: true,
    },
  });

  console.log('[seed] Creating sample company & guest...');
  const [company] = await Company.findOrCreate({
    where: { company_name: 'TripVoyage Travels' },
    defaults: {
      contact_person: 'Arun Nair',
      mobile: '+91 99887 76655',
      email: 'bookings@tripvoyage.in',
      company_type: 'travel_agency',
      status: 'active',
    },
  });

  await Guest.findOrCreate({
    where: { mobile: '+91 91234 56789' },
    defaults: {
      first_name: 'Riya',
      last_name: 'Sharma',
      email: 'riya.sharma@example.com',
      dob: new Date('1995-06-15'),
      gender: 'female',
      nationality: 'Indian',
      address: '12 MG Road, Pune',
      city: 'Pune',
      id_type: 'aadhaar',
      id_number: 'XXXX-XXXX-1234',
      company_id: company.company_id,
      is_active: true,
    },
  });

  console.log(`[seed] Done. Login with ${admin.email} / Admin@123`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});