import NoCarSelected from "../components/NoCar";
import CarSummary from "../components/CarSummary";
import RentalForm from "../components/RentalForm";
import Modal from "../components/Modal";
import cancelImage from "../assets/cancel.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCars } from "../api/api";

export default function Reservation({ setModalOverlay }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        setLoading(true);
        const response = await getCars(); // Make sure this uses port 3002
        setCars(response.data.filter((car) => car.reserved));
        setError(null);
      } catch (error) {
        setError('Failed to load available cars. Please try again later.');
        console.error('Error fetching available cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCars();
    
  }, []);

  const handleRent = async (vin) => {
    try {
      const response = await fetch(`http://localhost:3002/api/cars/${vin}/reserve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reserved: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to reserve the car');
      }

      alert('Car reserved successfully!');
      navigate('/reservations');
    } catch (error) {
      console.error('Error reserving car:', error);
      alert('Could not complete reservation. Please try again.');
    }
  };

  const handleCancel = async (vin) => {
    try {
      const response = await fetch(`http://localhost:3002/api/cars/${vin}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reserved: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel the reservation');
      }

      // Refresh the list of reserved cars
      setCars((prevCars) => prevCars.map(car => car.vin === vin ? { ...car, reserved: false } : car));
      navigate('/');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Could not cancel the reservation. Please try again.');
    }
  };

  const showCancelModal = (reservedCar) => {
    setModalOverlay(
      <Modal
        title="Cancel Reservation"
        // status="Pending"
        image={cancelImage}
        message="You are about to cancel your order..."
        description="This action will remove your selected car and clear all the information you have entered."
        buttons={[
          <button
            key="yes"
            className="w-full h-11 bg-white rounded-lg border border-zinc-200 shadow-sm text-neutral-500 text-base font-medium"
            onClick={() => {
              handleCancel(reservedCar.vin);
              setModalOverlay(null);
            }}
          >
            Yes, cancel my order
          </button>,
          <button
            key="no"
            className="w-full h-11 bg-[rgba(231,170,76,1)] rounded-lg shadow-sm text-white text-base font-medium"
            onClick={() => setModalOverlay(null)}
          >
            No, go back
          </button>
        ]}
        onClose={() => setModalOverlay(null)}
      />
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading available cars...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  const reservedCar = cars.find(car => car.reserved);

  return (
    <>
      {reservedCar ? (
        <div className="relative z-20 flex justify-center">
          <div className="w-[1200px] pt-16 mb-4 inline-flex justify-between items-center">
            <CarSummary car={reservedCar} />
            <RentalForm car={reservedCar} onCancel={() => showCancelModal(reservedCar)} />
          </div>
        </div>
      ) : (
        <NoCarSelected />
      )}
    </>
  );
}