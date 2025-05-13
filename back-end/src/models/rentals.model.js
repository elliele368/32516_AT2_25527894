const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    license: String
  },
  rentalInfo: {
    startDate: Date,
    endDate: Date,
    days: Number,
    pricePerDay: Number,
    totalPrice: String
  },
  carInfo: {
    vin: String,
    brand: String,
    model: String
  },
  status: String,
  submittedAt: Date
});

module.exports = mongoose.model('Rental', rentalSchema);