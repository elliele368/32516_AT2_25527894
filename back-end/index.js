import express from 'express';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import { Car } from './src/models/cars.model.js';
import Rental from './src/models/rentals.model.js';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();
// Connect to MongoDB
connectDB();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({message:'Hello World!'});
});

// get all cars with optional search and filters
app.get('/cars', async (req, res) => {
  try {
    const { search, brand, type } = req.query;

    // Dynamic query object
    const query = {};

    if (search) {
      if (search.startsWith('"') && search.endsWith('"')) {
        const exact = search.slice(1, -1); // remove quotes
        query.$or = [
          { name: exact },
          { brand: exact }
        ];
      } else {
        const keywords = search.split(/[,\s/]+/).filter(Boolean);
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $in: keywords.map(k => new RegExp(k, 'i')) } }
        ];
      }
    }

    if (brand !== undefined) {
      const brands = brand.split(',').filter(Boolean);
      if (brands.length === 0) {
        return res.status(200).json({ message: 'No cars found', data: [] });
      }
      query.brand = { $in: brands };
    }

    if (type !== undefined) {
      const types = type.split(',').filter(Boolean);
      if (types.length === 0) {
        return res.status(200).json({ message: 'No cars found', data: [] });
      }
      query.type = { $in: types };
    }

    const cars = await Car.find(query);

    if (!cars || cars.length === 0) {
      return res.status(404).json({ message: 'No cars found' });
    }

    res.status(200).json({ message: 'Cars fetched successfully', data: cars });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/car/suggestions', async (req, res) => {
  try {
    const { search } = req.query;
    const suggestions = await Car.find({
      $or: [
        { brand: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ]
    });
    res.status(200).json({ message: 'Suggestions fetched successfully', data: suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Reserve a car by VIN
app.put('/api/cars/:vin/reserve', async (req, res) => {
  try {
    const { vin } = req.params;

    // Reset all reserved cars
    await Car.updateMany({ reserved: true }, { reserved: false });

    // Reserve the selected car
    const car = await Car.findOneAndUpdate(
      { vin },
      { reserved: true },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car reserved successfully', data: car });
  } catch (error) {
    console.error('Error reserving car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a reservation by VIN
app.put('/api/cars/:vin/cancel', async (req, res) => {
  try {
    const { vin } = req.params;

    const car = await Car.findOneAndUpdate(
      { vin },
      { reserved: false },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Reservation cancelled successfully', data: car });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint to handle car rental
app.post('/api/rentals', async (req, res) => {
  try {
    const rentalData = req.body;

    // Check if car is still available
    const car = await Car.findOne({ vin: rentalData.carInfo.vin });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Important: Check if car is still available
    if (!car.available) {
      return res.status(400).json({ message: 'Car is no longer available' });
    }

    // Create new rental record
    const newRental = new Rental({
      customerInfo: rentalData.customerInfo,
      rentalInfo: rentalData.rentalInfo,
      carInfo: rentalData.carInfo,
      status: 'confirmed',
      submittedAt: new Date()
    });

    // Save rental
    const savedRental = await newRental.save();
    
    // Update car availability - this affects all clients
    const updatedCar = await Car.findOneAndUpdate(
      { vin: rentalData.carInfo.vin },
      { available: false, reserved: false },
      { new: true }
    );

    res.status(201).json({
      message: 'Rental created successfully',
      rental: savedRental,
      car: updatedCar
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});