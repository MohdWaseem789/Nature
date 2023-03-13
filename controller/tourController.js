/*
@author : Mohd Waseem
All Are Crud Operation
This file handle the routesHandler function in this file we can write
 delete,get, getAll,create function
*/
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utill/ErrorHandling');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utill/catchasync');
const Factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an  image Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

//upload.single('image')
//upload.array('images' , 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tour/${req.body.imageCover}`);

  // images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (files, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(files.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tour/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAll = Factory.getAll(Tour);
exports.getTour = Factory.getOne(Tour, { path: 'reviews' });
exports.createTour = Factory.createOne(Tour);
exports.updateTour = Factory.updateOne(Tour);
exports.deleteTour = Factory.deleteOne(Tour);
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: 'Easy' } } },
  ]);
  res.status(200).json({
    statusbar: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDate',
    },
    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDate' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' }, //it will give the name of tour if we hide this line it will give only the number of tour
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    { $project: { _id: 0 } },
    { $sort: { numTourStart: -1 } },
  ]);
  res.status(200).json({
    statusbar: 'success',
    data: {
      plan,
    },
  });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longtitude in the format of lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longtitude in the format of lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
