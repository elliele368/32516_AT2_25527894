import express from 'express';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import { Car } from './src/models/cars.model.js';
import cors from 'cors';

dotenv.config();
// Connect to MongoDB
connectDB();

const app = express();
const PORT = 3002;
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (brand) {
      const brands = brand.split(','); // support multiple brands
      query.brand = { $in: brands };
    }

    if (type) {
      const types = type.split(','); // support multiple types
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

// suggestions for car names
app.get('/cars/suggestions', async (req, res) => {
  try {
    const { search } = req.query;
    const suggestions = await Car.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },]
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});