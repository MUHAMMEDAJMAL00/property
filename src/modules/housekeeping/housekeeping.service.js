const { HousekeepingTask, HousekeepingTaskType, DamageAndMissing, Laundry, TASK_STATUS } = require('./housekeeping.model');
const { Room, ROOM_STATUS } = require('../room/room.model');
const createCrudService = require('../../utils/genericCrud');
const ApiError = require('../../utils/ApiError');

const taskService = createCrudService(HousekeepingTask, {
  searchFields: ['instructions'],
  filterFields: ['status', 'room_id', 'task_type_id', 'priority', 'assigned_staff_id'],
  includes: ['room', 'taskType', 'assignedStaff'],
});

taskService.create = async (data, user) => {
  const room = await Room.findByPk(data.room_id);
  if (!room) throw ApiError.notFound('Room not found');

  const task = await HousekeepingTask.create({
    ...data,
    status: data.assigned_staff_id ? TASK_STATUS.ASSIGNED : TASK_STATUS.PENDING,
    created_by: user ? user.user_id : null,
  });

  if (room.status === ROOM_STATUS.AVAILABLE || room.status === ROOM_STATUS.RESERVED) {
    await Room.update({ status: ROOM_STATUS.HOUSEKEEPING_IN_PROGRESS }, { where: { room_id: room.room_id } });
  }
  return taskService.getById(task.task_id);
};

taskService.assignStaff = async (taskId, staffId, user) => {
  const task = await taskService.getById(taskId);
  await task.update({ assigned_staff_id: staffId, status: TASK_STATUS.ASSIGNED, updated_by: user ? user.user_id : null });
  return taskService.getById(taskId);
};

taskService.start = async (taskId, user) => {
  const task = await taskService.getById(taskId);
  await task.update({ status: TASK_STATUS.IN_PROGRESS, started_at: new Date(), assigned_staff_id: task.assigned_staff_id || user?.employee_id || null, updated_by: user ? user.user_id : null });
  return taskService.getById(taskId);
};

taskService.complete = async (taskId, user) => {
  const task = await taskService.getById(taskId);
  await task.update({ status: TASK_STATUS.DONE, completed_at: new Date(), updated_by: user ? user.user_id : null });
  return taskService.getById(taskId);
};

taskService.verify = async (taskId, user) => {
  const { Op } = require('sequelize');
  const task = await taskService.getById(taskId);
  if (task.status !== TASK_STATUS.DONE) throw ApiError.badRequest('Task must be completed before verification');
  await task.update({ status: TASK_STATUS.VERIFIED, verified_by: user ? user.user_id : null, verified_at: new Date() });

  const remaining = await HousekeepingTask.count({
    where: { room_id: task.room_id, [Op.not]: { status: TASK_STATUS.VERIFIED } },
  });
  if (remaining === 0) {
    await Room.update({ status: ROOM_STATUS.AVAILABLE }, { where: { room_id: task.room_id, status: ROOM_STATUS.HOUSEKEEPING_PENDING } });
  }
  return taskService.getById(taskId);
};

const damageService = createCrudService(DamageAndMissing, {
  searchFields: ['item'],
  filterFields: ['status', 'room_id', 'booking_id'],
  includes: ['room', 'booking'],
});

const laundryService = createCrudService(Laundry, {
  searchFields: ['notes'],
  filterFields: ['status', 'room_id', 'guest_id', 'item_type'],
  includes: ['room', 'guest'],
});

const taskTypeService = createCrudService(HousekeepingTaskType, {
  searchFields: ['name'],
  filterFields: ['status'],
});

module.exports = { taskService, damageService, laundryService, taskTypeService };