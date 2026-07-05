const { Op } = require('sequelize');
const { Notification } = require('../models');
const { paginate, paginatedResponse } = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = { [Op.or]: [{ user_id: req.user.id }, { user_id: null }] };
    if (req.query.unread === 'true') where.is_read = false;

    const { rows, count } = await Notification.findAndCountAll({
      where, limit, offset, order: [['created_at', 'DESC']],
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, [Op.or]: [{ user_id: req.user.id }, { user_id: null }] } }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { [Op.or]: [{ user_id: req.user.id }, { user_id: null }], is_read: false } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { [Op.or]: [{ user_id: req.user.id }, { user_id: null }], is_read: false },
    });
    res.json({ count });
  } catch (err) { next(err); }
};
