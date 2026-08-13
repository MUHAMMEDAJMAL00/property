const { Asset, AssetCategory, AssetMovement, AssetDepreciation } = require('./asset.model');
const createCrudService = require('../../utils/genericCrud');
const ApiError = require('../../utils/ApiError');

const assetService = createCrudService(Asset, {
  searchFields: ['asset_name', 'asset_code', 'vendor_name', 'invoice_number'],
  filterFields: ['category_id', 'status', 'department_id', 'location'],
  includes: ['category'],
});

assetService.create = async (data, user) => {
  const totalValue = Number(data.quantity || 1) * Number(data.unit_value);
  return Asset.create({
    ...data,
    total_value: data.total_value || totalValue,
    current_book_value: data.current_book_value || totalValue,
    created_by: user ? user.user_id : null,
  });
};

assetService.move = async (assetId, toLocation, notes, user) => {
  const asset = await assetService.getById(assetId);
  await AssetMovement.create({
    asset_id: asset.asset_id,
    from_location: asset.location,
    to_location: toLocation,
    moved_at: new Date(),
    moved_by: user ? user.user_id : null,
    notes,
  });
  await asset.update({ location: toLocation, updated_by: user ? user.user_id : null });
  return assetService.getById(assetId);
};

assetService.depreciate = async (assetId, period, user) => {
  const asset = await assetService.getById(assetId);
  const years = Number(asset.useful_life_years) || 1;
  const annualDepreciation = (Number(asset.total_value) - Number(asset.residual_value)) / years;
  const monthlyDepreciation = annualDepreciation / 12;

  const previousAll = await AssetDepreciation.findAll({ where: { asset_id: assetId } });
  const accumulated = previousAll.reduce((sum, d) => sum + Number(d.amount), 0) + monthlyDepreciation;
  const bookValue = Math.max(0, Number(asset.current_book_value) - monthlyDepreciation);

  await AssetDepreciation.create({
    asset_id: assetId,
    period,
    amount: monthlyDepreciation,
    accumulated_depreciation: accumulated,
    book_value_after: bookValue,
    created_by: user ? user.user_id : null,
  });
  await asset.update({ current_book_value: bookValue, updated_by: user ? user.user_id : null });
  return assetService.getById(assetId);
};

assetService.movements = async (assetId) => {
  await assetService.getById(assetId);
  return AssetMovement.findAll({ where: { asset_id: assetId }, order: [['moved_at', 'DESC']] });
};

const assetCategoryService = createCrudService(AssetCategory, {
  searchFields: ['name'],
  filterFields: ['status'],
});

module.exports = { assetService, assetCategoryService };