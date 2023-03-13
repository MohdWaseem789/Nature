const express = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController');

const router = express.Router();

router.use(authController.protectRoute); // All the routes(middlewares) after this middleware are protected

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.use(authController.restrictTo('admin', 'lead-guide')); // Only admin can access the routes below this middleware

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
