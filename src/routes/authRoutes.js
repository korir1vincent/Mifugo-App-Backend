// const express = require('express');
// const router = express.Router();
// const { register, login, getMe, updateProfile } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', protect, getMe);
// router.put('/profile', protect, updateProfile);

// module.exports = router;
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteAccount,
  registerPushToken,
  removePushToken,
  updateNotificationSettings,
  sendTestPush,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/push-token', protect, registerPushToken);
router.delete('/push-token', protect, removePushToken);
router.put('/notification-settings', protect, updateNotificationSettings);
router.post('/push-test', protect, sendTestPush);

module.exports = router;