const express = require('express');
const viewsController = require('./../controller/viewsController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.logInPage);
router.get('/signup', viewsController.getSignupForm);
router.get('/me', authController.protectRoute, viewsController.getAccount);
router.get(
  '/my-tours',
  authController.protectRoute,
  viewsController.getMyTours
);
router.get('/forgotpassword', viewsController.forgotPassword);
router.get('/resetpassword/:resetToken', viewsController.resetPassword);
router.post(
  '/submit-user-data',
  authController.protectRoute,
  viewsController.updateUserData
);

module.exports = router;
