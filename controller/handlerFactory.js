const { Model } = require('mongoose');
const catchAsync = require('./../utill/catchasync');
const AppError = require('./../utill/ErrorHandling');
const APIFeature = require('./../utill/apiFeature');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No Document Found with that id', 404));
    }
    res.status(204).json({
      statusbar: 'success',
      data: {
        tour: null,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No Document found with this ID !', 404));
    }
    res.status(200).json({
      statusbar: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      statusbar: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No Document found with this ID !', 404));
    }
    res.status(200).json({
      statusbar: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To Allow for nested Get reviews on Tour
    let filter = {};
    if (req.params.tourid) filter = { tour: req.params.tourid };

    const features = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .paging();
    // ? EXECUTE QUERY the explain method return how many doc we read
    // const doc = await features.query.explain();
    const doc = await features.query;
    //SEND RESPONSE
    res.status(200).json({
      statusbar: 'succes',
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
