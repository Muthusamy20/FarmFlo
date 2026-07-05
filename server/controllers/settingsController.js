const { SystemSetting } = require('../models');
const { logActivity } = require('../utils/activityLogger');

exports.getAll = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findAll();
    const result = {};
    settings.forEach((s) => { result[s.setting_key] = s.setting_value; });
    res.json(result);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: 'Setting key required' });
    const [setting] = await SystemSetting.findOrCreate({
      where: { setting_key: key },
      defaults: { setting_value: value },
    });
    if (setting) await setting.update({ setting_value: value });
    await logActivity(req.user.id, 'update', 'settings', `Updated setting: ${key}`, req.ip);
    res.json({ key, value });
  } catch (err) { next(err); }
};
