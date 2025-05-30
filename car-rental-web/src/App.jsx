import Header from "./components/Header";
import Search from "./components/Search";
import SearchResults from "./pages/SearchResults";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Reservation from "./pages/Reservation";
import backgroundImage from "./assets/header-bg.png";
import { useState } from "react";
import CarCard from "./components/CarCard";
import { getCars } from "./api/api";
import { useEffect } from "react";
import clientDB from './utils/clientDatabase';

export default function App() {
    const location = useLocation();
    const isHome = location.pathname === "/";
    const [modalOverlay, setModalOverlay] = useState(null);

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialBrandFilter = searchParams.get("brand")?.split(",") || [];
    const initialTypeFilter = searchParams.get("type")?.split(",") || [];

    const mergeWithClientState = (cars) => {
      if (!cars || !Array.isArray(cars)) return [];
      
      const reservedByClient = clientDB.getReservedCar();
      
      return cars.map(car => {
        // If car is not available, this state is handled by the server and visible to all clients
        if (!car.available) {
          return car;
        }
        
        // If this client has reserved this car, show as reserved
        if (car.vin === reservedByClient) {
          return { ...car, reserved: true, reservedByClient: true };
        }
        
        // Otherwise show as not reserved (even if server says it's reserved)
        // This hides other clients' reservations
        return { ...car, reserved: false, reservedByClient: false };
      });
    };

    useEffect(() => {
      const fetchCars = async () => {
        try {
          setLoading(true);
          const response = await getCars();
          const serverCars = response.data || [];
          
          // Apply client-specific reservation state
          const carsWithClientState = mergeWithClientState(serverCars);
          
          setCars(carsWithClientState);
          setError(null);
        } catch (err) {
          console.error("Error fetching cars:", err);
          setError("Failed to load cars. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchCars();
      
      // Handle refresh of car data when reservation changes
      const handleCarDataUpdated = () => {
        fetchCars();
      };
      window.addEventListener("carDataUpdated", handleCarDataUpdated);
      
      return () => {
        window.removeEventListener("carDataUpdated", handleCarDataUpdated);
      };
    }, []);

    const handleRent = async (vin) => {
      try {
        // Check if there's a previous reservation
        const previousReservation = clientDB.getReservedCar();
        
        // If there's a previous reservation, cancel it first
        if (previousReservation && previousReservation !== vin) {
          try {
            // Cancel previous reservation on server
            await fetch(`http://localhost:3002/api/cars/${previousReservation}/cancel`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reserved: false }),
            });
            console.log(`Previous reservation for car ${previousReservation} was canceled.`);
          } catch (cancelError) {
            console.warn(`Error canceling previous reservation: ${cancelError}`);
            // Continue with new reservation even if cancellation fails
          }
        }
        
        // Make the server call to reserve the new car
        const response = await fetch(`http://localhost:3002/api/cars/${vin}/reserve`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reserved: true }),
        });
        
        if (!response.ok) throw new Error("Failed to reserve car");
        
        // Store the reservation in client database
        clientDB.reserveCar(vin);
        
        // Update the UI with updated reservation state
        setCars(prevCars =>
          prevCars.map(car => {
            // Mark the newly reserved car
            if (car.vin === vin) {
              return { ...car, reserved: true, reservedByClient: true };
            }
            // Remove reservation from previously reserved car
            if (car.vin === previousReservation) {
              return { ...car, reserved: false, reservedByClient: false };
            }
            return car;
          })
        );
        
        navigate("/reservation");
      } catch (err) {
        console.error("Error reserving car:", err);
        alert("Could not complete reservation.");
      }
    };

    const handleCancel = async (vin) => {
      try {
        // Cancel reservation on server
        const response = await fetch(`http://localhost:3002/api/cars/${vin}/cancel`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reserved: false }),
        });
        
        if (!response.ok) throw new Error("Failed to cancel reservation");

        // Remove client-side reservation
        clientDB.cancelReservation();
        
        // Update UI
        setCars((prevCars) =>
          prevCars.map((car) =>
            car.vin === vin ? { ...car, reserved: false, reservedByClient: false } : car
          )
        );
        
        navigate("/");
      } catch (err) {
        console.error("Error cancelling reservation:", err);
        alert("Could not cancel the reservation.");
      }
    };

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto scrollbar-hide relative z-30">
            {/* Show background image if on homepage */}
            {isHome && (
                <>
                    <div
                        className="absolute top-0 left-0 w-full h-[152px] bg-cover bg-center z-0"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-[152px] bg-black/5 z-10" />
                </>
            )}

            <Header solid={!isHome} />

            {/* Full search area on homepage */}
            {isHome && (
              <div className="relative z-20 flex justify-center mt-[90px]">
                <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-between items-start">
                    <div className="text-yellow-600 text-base font-semibold uppercase leading-snug tracking-tight">
                      Start a booking
                    </div>
                    <div className="flex justify-end items-center gap-8">
                      <div className="flex justify-start items-center gap-2">
                        <img src="/src/assets/check.svg" alt="check" className="w-5 h-5" />
                        <div className="text-gray-500 text-sm font-light leading-snug tracking-tight">
                          Free cancellation
                        </div>
                      </div>
                      <div className="flex justify-start items-center gap-2">
                        <img src="/src/assets/check.svg" alt="check" className="w-5 h-5" />
                        <div className="text-gray-500 text-sm font-light leading-snug tracking-tight">
                          Australian, P1, P2 and International licences
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  <Search />
                </div>
              </div>
            )}

            {/* Routed content */}
            <div className="relative z-[1] pt-6">
                <Routes>
                    <Route
                      path="/"
                      element={
                        <div className="relative z-20 flex justify-center mb-[40px]">
                          <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start gap-4">
                            <h2 className="w-full text-yellow-600 text-lg font-semibold text-center">CHOOSE A CAR</h2>

                            {loading && (
                              <div className="w-full flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
                              </div>
                            )}

                            {error && (
                              <div className="w-full text-center text-red-500 py-4">{error}</div>
                            )}

                            {!loading && !error && (
                              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cars.length > 0 ? (
                                  cars.map((car) => (
                                    <CarCard
                                      key={car.vin || car.id}
                                      car={car}
                                      onRent={() => handleRent(car.vin)}
                                      onCancel={() => handleCancel(car.vin)}
                                    />
                                  ))
                                ) : (
                                  <div className="col-span-2 text-center text-gray-500 py-8">
                                    No cars available at the moment.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="/search"
                      element={
                        <SearchResults
                          initialSearch={initialSearch}
                          initialBrandFilter={initialBrandFilter}
                          initialTypeFilter={initialTypeFilter}
                        />
                      }
                    />
                    <Route path="/reservation" element={<Reservation setModalOverlay={setModalOverlay} />} />
                </Routes>
            </div>

            {modalOverlay && (
              <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-[2px] flex justify-center items-center">
                {modalOverlay}
              </div>
            )}
        </div>
    );
}