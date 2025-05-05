import { useState, useEffect } from "react";
import CarCard from "../components/CarCard";
import { getCars } from "../api/api";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await getCars();
        const listCars = data.data || [];
        setCars(listCars);
        setError(null);
      } catch (err) {
        setError("Failed to load cars. Please try again later.");
        console.error("Error loading cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="relative z-20 flex justify-center mb-[40px]">
      <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start gap-4">
        <h2 className="w-full text-yellow-600 text-lg font-semibold text-center">CHOOSE A CAR</h2>
        
        {loading && (
          <div className="w-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
          </div>
        )}
        
        {error && (
          <div className="w-full text-center text-red-500 py-4">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {cars.length > 0 ? (
              cars.map((car) => (
                <CarCard key={car.vin || car.id} car={car} />
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
  );
}