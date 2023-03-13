class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // BUILD THE QUERY
    // 1A) FILTERING
    const queryObj = { ...this.queryString };
    const excludeField = ['page', 'sort', 'limit', 'fields'];
    excludeField.forEach((el) => delete queryObj[el]);
    // 1B) ADVANCE FILTERING CHANGE THE OPERTORS
    let queryStr = JSON.stringify(queryObj); //convert string to obj
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //change $gt,$gte through regular expression
    this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // 2)Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitField() {
    // 3)fields limiting
    //it will show only whatever you pass in api and hide all the data
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); // it will remove the coma and give the space
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // for hide the__v that is created by mongoose in api
    }
    return this;
  }
  paging() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeature;
