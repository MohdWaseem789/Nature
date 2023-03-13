const AppError = require('./../utill/ErrorHandling');

// Handling invalid database id in production
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};

// Handling duplicate fields in production
const handleDuplicateFields = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value : ${value}. please use another name`;
  return new AppError(message, 400);
};

// Handling mongoose validation error in production
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data . ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
  // Api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('Error', err);
  // Rendring Web Pages
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};
// handle  wrong token error in prod
const handleJWTError = () =>
  new AppError('Invalid Token ! Please Login Again', 401);
// handle expired token error in prod
const handleJWTExpiredError = () =>
  new AppError('Your token has Expired ! Please login again', 401);

const sendErrorProd = (err, req, res) => {
  // A) For Api
  if (req.originalUrl.startsWith('/api')) {
    // operational , trusted error : send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // 1. LOG Error
    console.error('Error', err);

    // 2. Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !',
    });
  }
  // B) Render Website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // 1. LOG Error
  console.error('Error', err);

  // 2. Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please Try Again Later',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);

    if (err.code === 11000) err = handleDuplicateFields(err);

    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(err, req, res);
  }
};
