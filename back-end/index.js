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
      query.brand = brand;
    }

    if (type) {
      query.type = type;
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


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});