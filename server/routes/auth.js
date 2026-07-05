const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../config/upload');

const router = express.Router();

router.post('/register', authController.registerValidators, validate, authController.register);
router.post('/login', authController.loginValidators, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPasswordValidators, validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPasswordValidators, validate, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfileValidators, validate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePasswordValidators, validate, authController.changePassword);
router.post('/avatar', authenticate, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
