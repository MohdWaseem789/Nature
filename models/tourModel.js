// ALL ARE SCHEMA OPERATIONS PERFORM IN THIS FILE
const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // it will remove white space
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour must have less or equal then 40 charcter'],
      minlength: [10, 'A tour must have more or equal then 10 charcter'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have durations'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have groupsize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either : easy  medium  difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.66666 return 4.6
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price({value}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), // it will give the date & time
      select: false, // it will hide the createdAt time to the client
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],
    // guides: Array,  it is used embedded the document
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], // it is used for refrensing
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// price and ratings average making index to improve perfomance
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Document middleware : it will run only save doc or create doc
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});
// for guides field loop Embedded the document
/*tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});*/
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// it is used to refrencing the document and hide the field in response
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milisecond !`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
