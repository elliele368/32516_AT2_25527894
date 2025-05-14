import NoCarSelected from "../components/NoCar";
import CarSummary from "../components/CarSummary";
import RentalForm from "../components/RentalForm";
import Modal from "../components/Modal";
import cancelImage from "../assets/cancel.svg";
import rentPendingImage from "../assets/rent-pending.svg";
import rentConfirmedImage from "../assets/rent-confirmed.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCars } from "../api/api";
import failImage from "../assets/blank.svg";
import { API_BASE_URL } from "../config/config";

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
      setCars((prevCars) =>
        prevCars.map((car) =>
          car.vin === vin ? { ...car, reserved: true } : { ...car, reserved: false }
        )
      );
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
      localStorage.removeItem("rentalForm");
      navigate('/');
      window.dispatchEvent(new Event("carDataUpdated"));
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

  const showConfirmPendingModal = (reservedCar) => {
    setModalOverlay(
      <Modal
        title="Rental Confirmation"
        status="Pending"
        image={rentPendingImage}
        message="You are about to confirm your order..."
        description="Your order has been placed but is not yet confirmed. Please confirm your order by clicking the button below."
        buttons={[
          <button
            key="confirm"
            className="w-full h-11 bg-[rgba(231,170,76,1)] rounded-lg shadow-sm text-white text-base font-bold"
            onClick={async () => {
              try {
                // Log the value of rentalForm from localStorage for debugging
                console.log("rentalForm from localStorage:", localStorage.getItem("rentalForm"));
                // Retrieve rental information from localStorage
                const formData = JSON.parse(localStorage.getItem("rentalForm"));
                if (!formData) {
                  console.error("Form data not found. Please complete the form before confirming.");
                  return;
                }

                // Calculate rental information
                const days = Math.max(
                  1,
                  Math.floor(
                    (new Date(formData.end).getTime() - new Date(formData.start).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
                const total = (reservedCar.price * days).toFixed(2);

                // Create data to send to server
                const rentalSubmission = {
                  customerInfo: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    license: formData.license
                  },
                  rentalInfo: {
                    startDate: formData.start,
                    endDate: formData.end,
                    days: days,
                    pricePerDay: reservedCar?.price || 0,
                    totalPrice: total
                  },
                  carInfo: {
                    vin: reservedCar?.vin,
                    brand: reservedCar?.brand,
                    model: reservedCar?.model
                  }
                };

                // Send rental request to server with logging for debugging
                console.log("Sending rental submission:", rentalSubmission);
                const response = await fetch('http://localhost:3002/api/rentals', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(rentalSubmission),
                });

                console.log("Server response status:", response.status);
                const responseData = await response.json();
                console.log("Server response data:", responseData);

                if (response.ok) {
                  // Clear form data
                  localStorage.removeItem("rentalForm");

                  // Update state cars to remove reserved car
                  setCars(prevCars => prevCars.filter(car => car.vin !== reservedCar.vin));
                  
                  // Show confirmation modal
                  setModalOverlay(
                    <Modal
                      title="Rental Confirmation"
                      status="Confirmed"
                      image={rentConfirmedImage}
                      message="Your order has been successfully confirmed!"
                      description="The selected car is now reserved for you, and you will receive a confirmation email shortly. Thank you for choosing our service!"
                      buttons={[]}
                      onClose={() => {
                        setModalOverlay(null);
                        navigate('/');
                      }}
                    />
                  );
                  // Close modal and navigate
                  // Update UI
                  window.dispatchEvent(new Event("carDataUpdated"));
                } else {
                  // Check if the error is due to the car no longer being available
                  if (!responseData.available) {
                    // Call API to remove reserved status
                    try {
                      const cancelResponse = await fetch(`http://localhost:3002/api/cars/${reservedCar.vin}/cancel`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ reserved: false }),
                      });

                      if (!cancelResponse.ok) {
                        console.warn("Warning: Could not update car reserved status to false");
                      } else {
                        console.log("Successfully removed reserved status from car");
                      }
                    } catch (cancelError) {
                      console.error("Error while removing reserved status:", cancelError);
                    }

                    // Show modal message instead of alert
                    setModalOverlay(
                      <Modal
                        title="Order Failed"
                        image={failImage}
                        message="Your order could not be completed..."
                        description="The selected car is no longer available at the time of processing. Please choose another car and try again."
                        onClose={() => {
                          setModalOverlay(null);
                          navigate('/');
                        }}
                      />
                    );
                    
                    // Clear form data
                    localStorage.removeItem("rentalForm");
                    
                    // Update state cars to remove reserved car
                    setCars([]);
                    
                    // Update UI
                    window.dispatchEvent(new Event("carDataUpdated"));
                  } else {
                    throw new Error(`Failed to submit rental: ${responseData.message || "Unknown error"}`);
                  }
                }
              } catch (error) {
                console.error('Error confirming rental:', error);
                alert('Could not confirm your rental. Please try again.');
              }
            }}
          >
            Confirm your rent
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
            <RentalForm
              car={reservedCar}
              onCancel={() => showCancelModal(reservedCar)}
              onConfirmPending={() => showConfirmPendingModal(reservedCar)}
            />
          </div>
        </div>
      ) : (
        <NoCarSelected />
      )}
    </>
  );
}