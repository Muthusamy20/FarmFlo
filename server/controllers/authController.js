const { body } = require('express-validator');
const {
  User, PasswordResetToken, EmailVerificationToken,
} = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  generateToken, hashToken, signAccessToken, signRefreshToken, verifyRefreshToken,
} = require('../utils/tokens');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');

const sanitizeUser = (user) => {
  const u = user.toJSON ? user.toJSON() : { ...user };
  delete u.password_hash;
  delete u.refresh_token;
  return u;
};

const setRefreshCookie = (res, token, remember) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
};

exports.registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await hashPassword(password);
    const user = await User.create({ name, email, password_hash, role: 'user' });

    const verifyToken = generateToken();
    await EmailVerificationToken.create({
      user_id: user.id,
      token_hash: hashToken(verifyToken),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await sendVerificationEmail(email, verifyToken);

    await logActivity(user.id, 'register', 'auth', 'User registered', req.ip);
    res.status(201).json({ message: 'Registration successful. Please verify your email.', user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

exports.loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

exports.login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.is_active) return res.status(403).json({ message: 'Account deactivated' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload, remember);

    await user.update({ refresh_token: hashToken(refreshToken) });
    setRefreshCookie(res, refreshToken, remember);

    await logActivity(user.id, 'login', 'auth', 'User logged in', req.ip);
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.update({ refresh_token: null }, { where: { id: req.user.id } });
      await logActivity(req.user.id, 'logout', 'auth', 'User logged out', req.ip);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== hashToken(token)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

exports.forgotPasswordValidators = [body('email').isEmail().normalizeEmail()];

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });

    const token = generateToken();
    await PasswordResetToken.destroy({ where: { user_id: user.id } });
    await PasswordResetToken.create({
      user_id: user.id,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
    });
    await sendPasswordResetEmail(email, token);
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) { next(err); }
};

exports.resetPasswordValidators = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
];

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const record = await PasswordResetToken.findOne({
      where: { token_hash: hashToken(token), expires_at: { [Op.gt]: new Date() } },
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const password_hash = await hashPassword(password);
    await User.update({ password_hash }, { where: { id: record.user_id } });
    await PasswordResetToken.destroy({ where: { id: record.id } });
    res.json({ message: 'Password reset successful' });
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const record = await EmailVerificationToken.findOne({
      where: { token_hash: hashToken(token), expires_at: { [Op.gt]: new Date() } },
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired verification token' });

    await User.update({ email_verified: true }, { where: { id: record.user_id } });
    await EmailVerificationToken.destroy({ where: { id: record.id } });
    res.json({ message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

exports.changePasswordValidators = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
];

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!(await comparePassword(currentPassword, user.password_hash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    await user.update({ password_hash: await hashPassword(newPassword) });
    await logActivity(user.id, 'change_password', 'auth', 'Password changed', req.ip);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

exports.updateProfileValidators = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, theme, language, notification_prefs } = req.body;
    const user = await User.findByPk(req.user.id);
    const updates = {};
    if (name) updates.name = name;
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      updates.email = email;
      updates.email_verified = false;
    }
    if (theme) updates.theme = theme;
    if (language) updates.language = language;
    if (notification_prefs) updates.notification_prefs = notification_prefs;
    await user.update(updates);
    res.json({ user: sanitizeUser(user) });
  } catch (err) { next(err); }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatar = `/uploads/${req.file.filename}`;
    await User.update({ avatar }, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash', 'refresh_token'] } });
    res.json({ user: sanitizeUser(user) });
  } catch (err) { next(err); }
};
