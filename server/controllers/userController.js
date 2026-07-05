const { Op } = require('sequelize');
const { User, Farm } = require('../models');
const { hashPassword } = require('../utils/password');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      include: [{ association: 'assignedFarm', attributes: ['id', 'name'] }],
      limit, offset,
      order: [['created_at', 'DESC']],
    });
    res.json(paginatedResponse(rows, count, page, limit));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, assigned_farm_id } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const user = await User.create({
      name, email, password_hash: await hashPassword(password), role: role || 'user',
      assigned_farm_id, email_verified: true,
    });
    await logActivity(req.user.id, 'create', 'users', `Created user ${email}`, req.ip);
    const { password_hash, refresh_token, ...safe } = user.toJSON();
    res.status(201).json(safe);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email, role, assigned_farm_id, is_active, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (assigned_farm_id !== undefined) updates.assigned_farm_id = assigned_farm_id;
    if (is_active !== undefined) updates.is_active = is_active;
    if (password) updates.password_hash = await hashPassword(password);
    await user.update(updates);
    await logActivity(req.user.id, 'update', 'users', `Updated user #${user.id}`, req.ip);
    const { password_hash, refresh_token, ...safe } = user.toJSON();
    res.json(safe);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ is_active: false });
    await logActivity(req.user.id, 'deactivate', 'users', `Deactivated user #${user.id}`, req.ip);
    res.json({ message: 'User deactivated' });
  } catch (err) { next(err); }
};
