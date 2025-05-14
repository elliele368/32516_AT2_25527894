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
    const { search, brand, type, vin } = req.query;

    // Dynamic query object
    console.log('Search:', search);
    console.log('Brand:', brand);
    console.log('Type:', type);
    console.log('VIN:', vin);
    const query = {};

    // Handle specific VIN search if provided
    if (vin) {
      query.vin = { $regex: new RegExp(vin, 'i') };
    }

    // Handle search across name, brand, description
    if (search) {
      if (search.startsWith('"') && search.endsWith('"')) {
        // Exact search handling - case insensitive
        const exact = search.slice(1, -1); // remove quotes
        query.$or = [
          { name: { $regex: new RegExp(`^${exact}$`, 'i') } },
          { brand: { $regex: new RegExp(`^${exact}$`, 'i') } },
          { description: { $regex: new RegExp(exact, 'i') } },
          { type: { $regex: new RegExp(`^${exact}$`, 'i') } }
        ];
      } else {
        // Normal search with keywords
        const searchRegex = new RegExp(search, 'i');
        
        // Create basic search conditions
        const searchConditions = [
          { name: { $regex: searchRegex } },
          { brand: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { type: { $regex: searchRegex } }
        ];
        
        // If there are multiple keywords, also search for each one
        const keywords = search.split(/[,\s/]+/).filter(Boolean);
        if (keywords.length > 1) {
          keywords.forEach(keyword => {
            const keywordRegex = new RegExp(keyword, 'i');
            searchConditions.push(
              { name: { $regex: keywordRegex } },
              { brand: { $regex: keywordRegex } },
              { description: { $regex: keywordRegex } },
              { type: { $regex: keywordRegex } }
            );
          });
        }
        
        query.$or = searchConditions;
      }
    }

    // Handle brand filter
    if (brand !== undefined && brand.trim() !== '') {
      const brands = brand.split(',').filter(Boolean);
      if (brands.length > 0) {
        // Create array of OR conditions for each brand
        const brandConditions = brands.map(b => {
          return { brand: { $regex: new RegExp(b.trim(), 'i') } };
        });

        // Combine with existing search if any
        if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: brandConditions }
          ];
          delete query.$or;
        } else {
          query.$or = brandConditions;
        }
      }
    }

    // Handle type filter
    if (type !== undefined && type.trim() !== '') {
      const types = type.split(',').filter(Boolean);
      if (types.length > 0) {
        // Create array of OR conditions for each type
        const typeConditions = types.map(t => {
          return { type: { $regex: new RegExp(t.trim(), 'i') } };
        });

        // Combine with existing conditions
        if (query.$and) {
          query.$and.push({ $or: typeConditions });
        } else if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: typeConditions }
          ];
          delete query.$or;
        } else {
          query.$or = typeConditions;
        }
      }
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Execute query
    const cars = await Car.find(query);

    // Return consistent response format
    if (!cars || cars.length === 0) {
      return res.status(200).json({ message: 'No cars found', data: [] });
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