const catchAsync = require('./catchAsync');
const ApiResponse = require('./ApiResponse');

/**
 * Factory that builds standard controllers from a CRUD service.
 * Pass { exclude: ['remove'] } to skip unsafe actions for transactional modules.
 */
const createGenericController = (service, { exclude = [] } = {}) => {
  const controller = {};

  if (!exclude.includes('list')) {
    controller.list = catchAsync(async (req, res) => {
      const data = await service.list(req.query);
      res.json(ApiResponse.success('Records fetched', data));
    });
  }

  if (!exclude.includes('getById')) {
    controller.getById = catchAsync(async (req, res) => {
      const data = await service.getById(req.params.id);
      res.json(ApiResponse.success('Record fetched', data));
    });
  }

  if (!exclude.includes('create')) {
    controller.create = catchAsync(async (req, res) => {
      const data = await service.create(req.body, req.user);
      res.status(201).json(ApiResponse.success('Record created', data));
    });
  }

  if (!exclude.includes('update')) {
    controller.update = catchAsync(async (req, res) => {
      const data = await service.update(req.params.id, req.body, req.user);
      res.json(ApiResponse.success('Record updated', data));
    });
  }

  if (!exclude.includes('remove')) {
    controller.remove = catchAsync(async (req, res) => {
      const data = await service.remove(req.params.id);
      res.json(ApiResponse.success('Record removed', data));
    });
  }

  return controller;
};

module.exports = createGenericController;