const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
// Post/tour/34ghh53fffjj/reviews
// Post /reviews
// Nested Routes
const router = express.Router({ mergeParams: true });

// Protect routes after this Middleware
router.use(authController.protectRoute);

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
