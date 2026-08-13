const express = require('express');

require('../database/associations');

const authRoute = require('../modules/auth/auth.route');
const userRoute = require('../modules/user/user.route');
const roleRoute = require('../modules/role/role.route');
const employeeRoute = require('../modules/employee/employee.route');
const propertyRoute = require('../modules/property/property.route');
const departmentRoute = require('../modules/department/department.route');
const floorRoute = require('../modules/floor/floor.route');
const roomTypeRoute = require('../modules/roomType/roomType.route');
const amenityRoute = require('../modules/amenity/amenity.route');
const roomRoute = require('../modules/room/room.route');
const guestRoute = require('../modules/guest/guest.route');
const companyRoute = require('../modules/company/company.route');
const bookingRoute = require('../modules/booking/booking.route');
const billingRoute = require('../modules/billing/billing.route');
const housekeepingRoute = require('../modules/housekeeping/housekeeping.route');
const maintenanceRoute = require('../modules/maintenance/maintenance.route');
const securityRoute = require('../modules/security/security.route');
const accountingRoute = require('../modules/accounting/accounting.route');
const assetRoute = require('../modules/asset/asset.route');
const attendanceRoute = require('../modules/attendance/attendance.route');
const payrollRoute = require('../modules/payroll/payroll.route');
const settingsRoute = require('../modules/settings/settings.route');
const dashboardRoute = require('../modules/dashboard/dashboard.route');
const reportRoute = require('../modules/report/report.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);
router.use('/employees', employeeRoute);
router.use('/properties', propertyRoute);
router.use('/departments', departmentRoute);
router.use('/floors', floorRoute);
router.use('/room-types', roomTypeRoute);
router.use('/amenities', amenityRoute);
router.use('/rooms', roomRoute);
router.use('/guests', guestRoute);
router.use('/companies', companyRoute);
router.use('/bookings', bookingRoute);
router.use('/billing', billingRoute);
router.use('/housekeeping', housekeepingRoute);
router.use('/maintenance', maintenanceRoute);
router.use('/security', securityRoute);
router.use('/accounting', accountingRoute);
router.use('/assets', assetRoute);
router.use('/attendance', attendanceRoute);
router.use('/payroll', payrollRoute);
router.use('/settings', settingsRoute);
router.use('/dashboard', dashboardRoute);
router.use('/reports', reportRoute);

module.exports = router;