const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utill/catchasync');
const AppError = require('../utill/ErrorHandling');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get Tour Data from Collection
  const tours = await Tour.find();

  //2) Build template
  //3) Render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });

  if (!tour) {
    return next(new AppError('There is No Tour With That Name!', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name}`,
      tour,
    });
});

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'create your account!',
  });
};

exports.logInPage = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', {
      title: 'Log into your account',
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: ' Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings made by that specific user
  const bookings = await Booking.find({
    user: req.user.id,
  });

  // 2 Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); // $in--> checks if the _id is present in the array tourIDs

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours,
  });
});

exports.updateUserData = async (req, res, next) => {
  const UpdatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: ' Your account',
    user: UpdatedUser,
  });
};
exports.forgotPassword = (req, res) => {
  res.status(200).render('forgotpassword', {
    title: 'Forgot Password',
  });
};

exports.resetPassword = (req, res) => {
  res.status(200).render('resetpassword', {
    title: 'Reset Password',
    resetToken: req.params.resetToken,
  });
};
