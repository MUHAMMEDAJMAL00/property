const { Role, Permission, RolePermission } = require('../modules/role/role.model');
const { User } = require('../modules/user/user.model');
const { Employee } = require('../modules/employee/employee.model');
const { Property } = require('../modules/property/property.model');
const { Department } = require('../modules/department/department.model');
const { Floor } = require('../modules/floor/floor.model');
const { RoomType } = require('../modules/roomType/roomType.model');
const { Amenity } = require('../modules/amenity/amenity.model');
const { Room, RoomStatusHistory } = require('../modules/room/room.model');
const { Guest } = require('../modules/guest/guest.model');
const { Company } = require('../modules/company/company.model');
const {
  Booking,
  BookingRoom,
  BookingGuest,
  GuestStay,
  BookingStatusHistory,
} = require('../modules/booking/booking.model');
const {
  Invoice,
  InvoiceItem,
  Payment,
  AdditionalCharge,
} = require('../modules/billing/billing.model');
const {
  HousekeepingTask,
  HousekeepingTaskType,
  DamageAndMissing,
  Laundry,
} = require('../modules/housekeeping/housekeeping.model');
const {
  MaintenanceRequest,
  MaintenanceCategory,
  MaintenanceArea,
  MaintenanceStatusHistory,
} = require('../modules/maintenance/maintenance.model');
const {
  Visitor,
  VisitorLog,
  Vehicle,
  VehicleEntryExit,
  GatePass,
  GatePassItem,
  PettyCashTransaction,
} = require('../modules/security/security.model');
const {
  ChartOfAccount,
  Journal,
  JournalEntry,
  Ledger,
  Expense,
} = require('../modules/accounting/accounting.model');
const {
  Asset,
  AssetCategory,
  AssetMovement,
  AssetDepreciation,
} = require('../modules/asset/asset.model');
const {
  Attendance,
  Holiday,
  OvertimeRecord,
} = require('../modules/attendance/attendance.model');
const {
  LeaveType,
  LeaveRequest,
  StaffAdvance,
  SalaryStructure,
  SalaryComponent,
  Payroll,
} = require('../modules/payroll/payroll.model');

function registerAssociations() {
  // --- Roles & Users ---
  Role.belongsToMany(Permission, {
    through: RolePermission,
    as: 'permissions',
    foreignKey: 'role_id',
    otherKey: 'permission_id',
  });
  Permission.belongsToMany(Role, {
    through: RolePermission,
    as: 'roles',
    foreignKey: 'permission_id',
    otherKey: 'role_id',
  });

  User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });
  Role.hasMany(User, { as: 'users', foreignKey: 'role_id' });

  User.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });
  Employee.hasOne(User, { as: 'user', foreignKey: 'employee_id' });

  // --- Employees & Departments ---
  Employee.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });
  Department.hasMany(Employee, { as: 'employees', foreignKey: 'department_id' });

  // --- Property hierarchy ---
  Property.hasMany(Room, { as: 'rooms', foreignKey: 'property_id' });
  Room.belongsTo(Property, { as: 'property', foreignKey: 'property_id' });

  Floor.hasMany(Room, { as: 'rooms', foreignKey: 'floor_id' });
  Room.belongsTo(Floor, { as: 'floor', foreignKey: 'floor_id' });

  RoomType.hasMany(Room, { as: 'rooms', foreignKey: 'room_type_id' });
  Room.belongsTo(RoomType, { as: 'roomType', foreignKey: 'room_type_id' });

  Room.hasMany(RoomStatusHistory, { as: 'statusHistory', foreignKey: 'room_id' });
  RoomStatusHistory.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  RoomStatusHistory.belongsTo(User, { as: 'changedByUser', foreignKey: 'changed_by' });

  Amenity.belongsToMany(RoomType, {
    through: 'room_type_amenities',
    as: 'roomTypes',
    foreignKey: 'amenity_id',
    otherKey: 'room_type_id',
  });
  RoomType.belongsToMany(Amenity, {
    through: 'room_type_amenities',
    as: 'amenities',
    foreignKey: 'room_type_id',
    otherKey: 'amenity_id',
  });

  // --- Guests & Companies ---
  Company.hasMany(Guest, { as: 'guests', foreignKey: 'company_id' });
  Guest.belongsTo(Company, { as: 'company', foreignKey: 'company_id' });

  // --- Bookings ---
  Guest.hasMany(Booking, { as: 'bookings', foreignKey: 'guest_id' });
  Booking.belongsTo(Guest, { as: 'guest', foreignKey: 'guest_id' });

  Company.hasMany(Booking, { as: 'bookings', foreignKey: 'company_id' });
  Booking.belongsTo(Company, { as: 'company', foreignKey: 'company_id' });

  Booking.hasMany(BookingRoom, { as: 'bookingRooms', foreignKey: 'booking_id' });
  BookingRoom.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });
  BookingRoom.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  BookingRoom.belongsTo(RoomType, { as: 'roomType', foreignKey: 'room_type_id' });

  Booking.hasMany(BookingGuest, { as: 'bookingGuests', foreignKey: 'booking_id' });
  BookingGuest.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });
  BookingGuest.belongsTo(Guest, { as: 'guest', foreignKey: 'guest_id' });

  Booking.hasMany(GuestStay, { as: 'stays', foreignKey: 'booking_id' });
  GuestStay.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });
  GuestStay.belongsTo(Guest, { as: 'guest', foreignKey: 'guest_id' });
  GuestStay.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });

  Booking.hasMany(BookingStatusHistory, { as: 'statusHistory', foreignKey: 'booking_id' });
  BookingStatusHistory.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });
  BookingStatusHistory.belongsTo(User, { as: 'changedByUser', foreignKey: 'changed_by' });

  // --- Billing ---
  Booking.hasMany(Invoice, { as: 'invoices', foreignKey: 'booking_id' });
  Invoice.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });
  Invoice.belongsTo(Guest, { as: 'guest', foreignKey: 'guest_id' });

  Invoice.hasMany(InvoiceItem, { as: 'items', foreignKey: 'invoice_id' });
  InvoiceItem.belongsTo(Invoice, { as: 'invoice', foreignKey: 'invoice_id' });

  Invoice.hasMany(Payment, { as: 'payments', foreignKey: 'invoice_id' });
  Payment.belongsTo(Invoice, { as: 'invoice', foreignKey: 'invoice_id' });

  Booking.hasMany(AdditionalCharge, { as: 'additionalCharges', foreignKey: 'booking_id' });
  AdditionalCharge.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });

  // --- Housekeeping ---
  HousekeepingTaskType.hasMany(HousekeepingTask, { as: 'tasks', foreignKey: 'task_type_id' });
  HousekeepingTask.belongsTo(HousekeepingTaskType, { as: 'taskType', foreignKey: 'task_type_id' });
  HousekeepingTask.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  HousekeepingTask.belongsTo(Employee, { as: 'assignedStaff', foreignKey: 'assigned_staff_id' });

  DamageAndMissing.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  DamageAndMissing.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });

  Laundry.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  Laundry.belongsTo(Guest, { as: 'guest', foreignKey: 'guest_id' });

  // --- Maintenance ---
  MaintenanceCategory.hasMany(MaintenanceRequest, { as: 'requests', foreignKey: 'category_id' });
  MaintenanceRequest.belongsTo(MaintenanceCategory, { as: 'category', foreignKey: 'category_id' });
  MaintenanceArea.hasMany(MaintenanceRequest, { as: 'requests', foreignKey: 'area_id' });
  MaintenanceRequest.belongsTo(MaintenanceArea, { as: 'area', foreignKey: 'area_id' });
  MaintenanceRequest.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });
  MaintenanceRequest.belongsTo(Employee, { as: 'assignedStaff', foreignKey: 'assigned_staff_id' });
  MaintenanceRequest.hasMany(MaintenanceStatusHistory, { as: 'statusHistory', foreignKey: 'request_id' });
  MaintenanceStatusHistory.belongsTo(MaintenanceRequest, { as: 'request', foreignKey: 'request_id' });
  MaintenanceStatusHistory.belongsTo(User, { as: 'changedByUser', foreignKey: 'changed_by' });

  // --- Security ---
  Visitor.hasMany(VisitorLog, { as: 'logs', foreignKey: 'visitor_id' });
  VisitorLog.belongsTo(Visitor, { as: 'visitor', foreignKey: 'visitor_id' });
  VisitorLog.belongsTo(Employee, { as: 'securityStaff', foreignKey: 'security_staff_id' });

  Vehicle.hasMany(VehicleEntryExit, { as: 'entries', foreignKey: 'vehicle_id' });
  VehicleEntryExit.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicle_id' });

  GatePass.belongsTo(Vehicle, { as: 'vehicle', foreignKey: 'vehicle_id' });
  GatePass.hasMany(GatePassItem, { as: 'items', foreignKey: 'gate_pass_id' });
  GatePassItem.belongsTo(GatePass, { as: 'gatePass', foreignKey: 'gate_pass_id' });

  // --- Accounting ---
  ChartOfAccount.hasMany(Ledger, { as: 'ledgerEntries', foreignKey: 'account_id' });
  Ledger.belongsTo(ChartOfAccount, { as: 'account', foreignKey: 'account_id' });

  Journal.hasMany(JournalEntry, { as: 'entries', foreignKey: 'journal_id' });
  JournalEntry.belongsTo(Journal, { as: 'journal', foreignKey: 'journal_id' });
  JournalEntry.belongsTo(ChartOfAccount, { as: 'account', foreignKey: 'account_id' });

  // --- Assets ---
  AssetCategory.hasMany(Asset, { as: 'assets', foreignKey: 'category_id' });
  Asset.belongsTo(AssetCategory, { as: 'category', foreignKey: 'category_id' });
  Asset.hasMany(AssetMovement, { as: 'movements', foreignKey: 'asset_id' });
  AssetMovement.belongsTo(Asset, { as: 'asset', foreignKey: 'asset_id' });
  Asset.hasMany(AssetDepreciation, { as: 'depreciations', foreignKey: 'asset_id' });
  AssetDepreciation.belongsTo(Asset, { as: 'asset', foreignKey: 'asset_id' });

  // --- Attendance & Payroll ---
  Employee.hasMany(Attendance, { as: 'attendance', foreignKey: 'employee_id' });
  Attendance.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });

  Employee.hasMany(OvertimeRecord, { as: 'overtime', foreignKey: 'employee_id' });
  OvertimeRecord.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });

  Employee.hasMany(LeaveRequest, { as: 'leaveRequests', foreignKey: 'employee_id' });
  LeaveRequest.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });
  LeaveType.hasMany(LeaveRequest, { as: 'requests', foreignKey: 'leave_type_id' });
  LeaveRequest.belongsTo(LeaveType, { as: 'leaveType', foreignKey: 'leave_type_id' });

  Employee.hasMany(StaffAdvance, { as: 'advances', foreignKey: 'employee_id' });
  StaffAdvance.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });

  Employee.hasMany(SalaryStructure, { as: 'salaryStructures', foreignKey: 'employee_id' });
  SalaryStructure.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });
  SalaryStructure.hasMany(SalaryComponent, { as: 'components', foreignKey: 'structure_id' });
  SalaryComponent.belongsTo(SalaryStructure, { as: 'structure', foreignKey: 'structure_id' });

  Employee.hasMany(Payroll, { as: 'payrolls', foreignKey: 'employee_id' });
  Payroll.belongsTo(Employee, { as: 'employee', foreignKey: 'employee_id' });
}

registerAssociations();

module.exports = {
  registerAssociations,
  models: {
    Role,
    Permission,
    RolePermission,
    User,
    Employee,
    Property,
    Department,
    Floor,
    RoomType,
    Amenity,
    Room,
    RoomStatusHistory,
    Guest,
    Company,
    Booking,
    BookingRoom,
    BookingGuest,
    GuestStay,
    BookingStatusHistory,
    Invoice,
    InvoiceItem,
    Payment,
    AdditionalCharge,
    HousekeepingTask,
    HousekeepingTaskType,
    DamageAndMissing,
    Laundry,
    MaintenanceRequest,
    MaintenanceCategory,
    MaintenanceArea,
    MaintenanceStatusHistory,
    Visitor,
    VisitorLog,
    Vehicle,
    VehicleEntryExit,
    GatePass,
    GatePassItem,
    PettyCashTransaction,
    ChartOfAccount,
    Journal,
    JournalEntry,
    Ledger,
    Expense,
    Asset,
    AssetCategory,
    AssetMovement,
    AssetDepreciation,
    Attendance,
    Holiday,
    OvertimeRecord,
    LeaveType,
    LeaveRequest,
    StaffAdvance,
    SalaryStructure,
    SalaryComponent,
    Payroll,
  },
};