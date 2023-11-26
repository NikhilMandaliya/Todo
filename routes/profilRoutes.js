const router = require('express').Router();

const { checkUser } = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router
    .route('/profile')
    .get(checkUser, profileController.getProfile)
    .post(checkUser, profileController.editProfile);

router.post('/change-password', checkUser, profileController.changePassword);

module.exports = router;
