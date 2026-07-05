const { paginate, paginatedResponse } = require('../utils/pagination');
const { ActivityLog } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { rows, count } = await ActivityLog.findAndCountAll({
      include: [{ association: 'user', attributes: ['id', 'name', 'email'] }],
      limit, offset,
      order: [['created_at', 'DESC']],
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (err) { next(err); }
};
