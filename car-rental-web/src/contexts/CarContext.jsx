import { createContext, useContext, useState, useEffect } from 'react';
import { carService } from '../services/carService';

const CarContext = createContext();

export const useCar = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
};

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      console.log("🚀 ~ fetchCars ~ data:", data)
      setCars(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get car by ID
  const getCarById = async (id) => {
    try {
      setLoading(true);
      const data = await carService.getCarById(id);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reserve car
  const reserveCar = async (vin) => {
    try {
      setLoading(true);
      await carService.reserveCar(vin);
      setCars(prevCars =>
        prevCars.map(car =>
          car.vin === vin ? { ...car, reserved: true } : car
        )
      );
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel reservation
  const cancelReservation = async (vin) => {
    try {
      setLoading(true);
      await carService.cancelReservation(vin);
      setCars(prevCars =>
        prevCars.map(car =>
          car.vin === vin ? { ...car, reserved: false } : car
        )
      );
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new car
  const addCar = async (carData) => {
    try {
      setLoading(true);
      const data = await carService.addCar(carData);
      setCars(prevCars => [...prevCars, data]);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update car
  const updateCar = async (id, carData) => {
    try {
      setLoading(true);
      const data = await carService.updateCar(id, carData);
      setCars(prevCars => 
        prevCars.map(car => car.id === id ? data : car)
      );
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete car
  const deleteCar = async (id) => {
    try {
      setLoading(true);
      await carService.deleteCar(id);
      setCars(prevCars => prevCars.filter(car => car.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const value = {
    cars,
    loading,
    error,
    fetchCars,
    getCarById,
    reserveCar,
    cancelReservation,
    addCar,
    updateCar,
    deleteCar,
  };

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );
}; 