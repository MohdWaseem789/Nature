const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchasync = require('./../utill/catchasync');
const AppError = require('./../utill/ErrorHandling');
const Email = require('./../utill/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookiOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };
  if (process.env.NODE_ENV === 'production') cookiOptions.secure = true;

  res.cookie('jwt', token, cookiOptions);

  // Remove Password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchasync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});
exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if mail and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // check if user exist & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // if everything ok , send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  //res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
};

exports.protectRoute = catchasync(async (req, res, next) => {
  // Getting token & check of its same !
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //console.log(token);

  if (!token) {
    // return res.redirect('/');
    return next(
      new AppError('You are not logged in please log  in to get access', 401)
    );
  }

  // Verification Token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exist
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(
      new AppError('The User Belong to this token does not exist', 401)
    );
  }

  // Check if user changed password after the token issue

  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User Recently Changed Password! Please Login Again', 401)
    );
  }

  // Grant Accsess to Protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

// only for render the page
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user still exist
      const freshUser = await User.findById(decode.id);
      if (!freshUser) {
        return next();
      }

      // Check if user changed password after the token issue

      if (freshUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      // There is logged in user
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Authorization Roles user and Admin Only admin can delete the Tours
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin' , 'lead-guide']. role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchasync(async (req, res, next) => {
  // Get User based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user of this email addreess', 404));
  }

  // Genrate the random Reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Sent email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });

    // For the error
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an Error sending the email Try again later', 500)
    );
  }
});

exports.resetPassword = catchasync(async (req, res, next) => {
  // Get User Based on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if Token has not Expired, and there is user, Set new Password
  if (!user) {
    return next(new AppError('token is invalid or Expire', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the User in send JWT
  createSendToken(user, 200, res);
});

// For Updating user password after the login
exports.updatePassword = catchasync(async (req, res, next) => {
  // Get User from collection based on id
  const user = await User.findById(req.user.id).select('+password');
  // Check if posted currentPasword is currect
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // if all ok update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
