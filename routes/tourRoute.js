const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRoute = require('./reviewRoute');
const router = express.Router();

// Nested Routes
// Reviews Middleware Nested
router.use('/:tourid/reviews', reviewRoute);

router
  .route('/')
  .get(tourController.getAll)
  .post(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAll);
router
  .route('/month-plan/:year')
  .get(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistance);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
