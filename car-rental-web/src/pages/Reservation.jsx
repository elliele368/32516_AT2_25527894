import NoCarSelected from "../components/NoCar";
import CarSummary from "../components/CarSummary";
import RentalForm from "../components/RentalForm";
import Modal from "../components/Modal";
import cancelImage from "../assets/cancel.svg";
import rentPendingImage from "../assets/rent-pending.svg";
import rentConfirmedImage from "../assets/rent-confirmed.svg";
import rentFailedImage from "../assets/blank.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCars } from "../api/api";
import failImage from "../assets/blank.svg";
import clientDB from '../utils/clientDatabase';

export default function Reservation({ setModalOverlay }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        setLoading(true);
        
        // Check if user has a reservation
        const reservedVin = clientDB.getReservedCar();
        if (!reservedVin) {
          setCars([]);
          setLoading(false);
          return;
        }
        
        // Fetch all cars
        const response = await getCars();
        
        // Filter to only the car reserved by this client
        const reservedCar = response.data.find(car => car.vin === reservedVin);
        
        if (reservedCar) {
          // Mark this car as reserved by the current client
          reservedCar.reserved = true;
          setCars([reservedCar]);
        } else {
          // Car not found or no longer available
          clientDB.cancelReservation();
          setCars([]);
        }
        
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
      clientDB.reserveCar(vin); // Persist reserved car to local storage
      window.dispatchEvent(new Event("carDataUpdated"));
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
      clientDB.cancelReservation();
      clientDB.clearFormData();
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
                // Get form data
                const formData = clientDB.getFormData();
                if (!formData) {
                  console.error("Form data not found. Please complete the form before confirming.");
                  return;
                }

                // Calculate rental details
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

                // Check if car is still available before confirming
                const checkResponse = await fetch(`http://localhost:3002/cars?vin=${reservedCar.vin}`);
                const checkData = await checkResponse.json();

                let carCheck = checkData.data ? checkData.data.find(car => car.vin === reservedCar.vin) : null;
                console.log("Car check data:", carCheck);
                if (!carCheck || !carCheck.available) {
                  // Clear the reservation from client state first
                  clientDB.cancelReservation();
                  clientDB.clearFormData();
                  
                  // Update the car status on the server side to ensure it's properly marked as unreserved
                  try {
                    await fetch(`http://localhost:3002/api/cars/${reservedCar.vin}/cancel`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ reserved: false }),
                    });
                  } catch (err) {
                    console.error("Error updating car status:", err);
                  }
                  
                  // Dispatch the event BEFORE showing the modal to ensure data is updated
                  window.dispatchEvent(new Event("carDataUpdated"));
                  
                  setModalOverlay(
                    <Modal
                      title="Rental Failed"
                      status="Failed"
                      image={rentFailedImage}
                      message="The car is no longer available."
                      description="Someone else has already rented this car. Please choose another vehicle."
                      buttons={[
                        <button
                          key="ok"
                          className="w-full h-11 bg-[rgba(231,170,76,1)] rounded-lg shadow-sm text-white text-base font-bold"
                          onClick={() => {
                            setModalOverlay(null);
                            navigate('/');
                          }}
                        >
                          Choose another car
                        </button>
                      ]}
                      onClose={() => {
                        setModalOverlay(null);
                        navigate('/');
                      }}
                    />
                  );
                  
                  // Update local state as well
                  setCars((prevCars) =>
                    prevCars.map((car) =>
                      car.vin === reservedCar.vin ? { ...car, reserved: false } : car
                    )
                  );
                  return;
                }

                // Send rental request to server
                const response = await fetch('http://localhost:3002/api/rentals', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(rentalSubmission),
                });

                const responseData = await response.json();

                if (response.ok) {
                  // Clear client-side data after successful rental
                  clientDB.cancelReservation();
                  clientDB.clearFormData();
                  
                  // Show success modal
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
                  
                  // Notify that car data needs to be updated
                  window.dispatchEvent(new Event("carDataUpdated"));
                } else {
                  // Show error modal
                  setModalOverlay(
                    <Modal
                      title="Rental Failed"
                      status="Failed"
                      image={rentFailedImage}
                      message="Your order could not be processed."
                      description={responseData.message || "There was an error processing your rental. Please try again."}
                      onClose={() => {
                        setModalOverlay(null);
                        navigate('/');
                        window.dispatchEvent(new Event("carDataUpdated"));
                      }}
                    />
                  );
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