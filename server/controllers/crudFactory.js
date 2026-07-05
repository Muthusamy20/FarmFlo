const { Op } = require('sequelize');
const { paginate, buildSearchWhere, paginatedResponse } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');
const { getFarmFilter } = require('../middleware/rbac');

const createCrudController = (Model, options = {}) => {
  const {
    moduleName = 'resource',
    searchFields = ['name'],
    include = [],
    beforeCreate,
    beforeUpdate,
    farmScoped = true,
    imageField = 'image',
  } = options;

  const notDeleted = { deleted_at: null };

  const getWhere = (req, extra = {}) => {
    const where = { ...notDeleted, ...extra };
    if (farmScoped && req.user.role !== 'admin') {
      Object.assign(where, getFarmFilter(req.user));
    }
    if (req.query.farm_id) where.farm_id = req.query.farm_id;
    return where;
  };

  return {
    getAll: async (req, res, next) => {
      try {
        const { page, limit, offset } = paginate(req.query);
        const searchWhere = buildSearchWhere(searchFields, req.query.search);
        const where = { ...getWhere(req), ...searchWhere };

        const sortField = req.query.sort || 'created_at';
        const sortOrder = req.query.order === 'asc' ? 'ASC' : 'DESC';

        const { rows, count } = await Model.findAndCountAll({
          where,
          include,
          limit,
          offset,
          order: [[sortField, sortOrder]],
        });
        res.json(paginatedResponse(rows, count, page, limit));
      } catch (err) { next(err); }
    },

    getById: async (req, res, next) => {
      try {
        const item = await Model.findOne({
          where: { id: req.params.id, ...notDeleted },
          include,
        });
        if (!item) return res.status(404).json({ message: 'Not found' });
        if (farmScoped && req.user.role !== 'admin') {
          const filter = getFarmFilter(req.user);
          const data = item.toJSON();
          if (filter.farm_id && data.farm_id !== filter.farm_id) {
            return res.status(403).json({ message: 'Access denied' });
          }
        }
        res.json(item);
      } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
      try {
        const data = { ...req.body, created_by: req.user.id };
        if (req.file && imageField) data[imageField] = `/uploads/${req.file.filename}`;
        if (beforeCreate) await beforeCreate(data, req);
        const item = await Model.create(data);
        await logActivity(req.user.id, 'create', moduleName, `Created ${moduleName} #${item.id}`, req.ip);
        res.status(201).json(item);
      } catch (err) { next(err); }
    },

    update: async (req, res, next) => {
      try {
        const item = await Model.findOne({ where: { id: req.params.id, ...notDeleted } });
        if (!item) return res.status(404).json({ message: 'Not found' });

        const data = { ...req.body };
        if (req.file && imageField) data[imageField] = `/uploads/${req.file.filename}`;
        if (beforeUpdate) await beforeUpdate(data, req, item);
        await item.update(data);
        await logActivity(req.user.id, 'update', moduleName, `Updated ${moduleName} #${item.id}`, req.ip);
        res.json(item);
      } catch (err) { next(err); }
    },

    remove: async (req, res, next) => {
      try {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can delete records' });
        }
        const item = await Model.findOne({ where: { id: req.params.id, ...notDeleted } });
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update({ deleted_at: new Date() });
        await logActivity(req.user.id, 'delete', moduleName, `Deleted ${moduleName} #${item.id}`, req.ip);
        res.json({ message: 'Deleted successfully' });
      } catch (err) { next(err); }
    },
  };
};

module.exports = createCrudController;
