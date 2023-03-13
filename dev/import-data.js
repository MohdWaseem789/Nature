const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Review = require('./../models/reviewModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(' DB Connection is Succesfull '));

// READ FILE FROM DEV TOUR.JSON

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/simple-tours.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE THROUGH JSON FILE

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data succecfully lodaed');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data succecfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// node script to add the collection through file into database
// script=> node dev/import-data.js
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
