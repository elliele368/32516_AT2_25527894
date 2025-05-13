import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getFilteredCars } from '../api/api';
import CarCard from '../components/CarCard';
import Search from '../components/Search';

export default function SearchResults({ initialSearch, initialBrandFilter, initialTypeFilter }) {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilteredCars = async () => {
      try {
        setLoading(true);
        const search = searchParams.get('search') || '';
        const brand = searchParams.get('brand')?.split(',') || [];
        const type = searchParams.get('type')?.split(',') || [];

        const response = await getFilteredCars({ search, brand, type });
        setCars(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load search results. Please try again later.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredCars();
  }, [searchParams]);

  const handleRent = async (vin) => {
    try {
      const response = await fetch(`http://localhost:3002/api/cars/${vin}/reserve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reserved: true }),
      });
      if (!response.ok) throw new Error("Failed to reserve car");

      // Dispatch global update event
      window.dispatchEvent(new Event("carDataUpdated"));

      navigate("/reservation");
    } catch (err) {
      console.error("Error reserving car:", err);
      alert("Could not complete reservation.");
    }
  };

  const handleCancel = async (vin) => {
    try {
      const response = await fetch(`http://localhost:3002/api/cars/${vin}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reserved: false }),
      });
      if (!response.ok) throw new Error("Failed to cancel reservation");

      // Re-fetch filtered cars
      const search = searchParams.get('search') || '';
      const brand = searchParams.get('brand')?.split(',') || [];
      const type = searchParams.get('type')?.split(',') || [];
      const updated = await getFilteredCars({ search, brand, type });
      setCars(updated.data || []);
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      alert("Could not cancel the reservation.");
    }
  };

  if (loading) {
    return (
      <div className="relative z-20 flex justify-center mb-[40px]">
        <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <div className="w-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="w-full fixed top-[64px] z-[60] px-10 py-2 bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-b border-zinc-200 flex justify-center items-center">
          <div className="w-full max-w-[1200px]">
            <Search
              initialSearch={initialSearch}
              initialBrandFilter={initialBrandFilter}
              initialTypeFilter={initialTypeFilter}
            />
          </div>
        </div>
        <div className="w-full h-[600px] flex flex-col justify-center items-center bg-slate-100 pt-[124px]">
          <div className="w-[550px] inline-flex flex-col justify-start items-center gap-3">
            <div className="self-stretch h-80 relative overflow-hidden">
              <img
                src="./src/assets/blank.svg"
                alt="Search error"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="self-stretch text-center justify-center text-neutral-500 text-base leading-snug tracking-tight">
              No search results available. Please try a different keyword or filter.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full fixed top-[64px] z-[60] px-10 py-2 bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-b border-zinc-200 flex justify-center items-center">
        <div className="w-full max-w-[1200px]">
          <Search
            initialSearch={initialSearch}
            initialBrandFilter={initialBrandFilter}
            initialTypeFilter={initialTypeFilter}
          />
        </div>
      </div>
      {cars.length > 0 ? (
        <div className="relative z-20 flex justify-center mb-[40px] mt-[124px]">
          <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
            <div className="w-full mb-6">
              <div className="flex justify-between items-center w-full">
                <div className="text-yellow-600 text-lg font-semibold leading-7">SEARCH RESULTS</div>
                <div className="h-9 px-2 py-0.5 bg-slate-200 rounded flex items-center gap-2.5">
                  <div className="text-neutral-500 text-base font-base leading-none tracking-tight">
                    {cars.length} result{cars.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.vin || car.id}
                  car={car}
                  onRent={() => handleRent(car.vin)}
                  onCancel={() => handleCancel(car.vin)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full fixed top-[64px] z-[60] px-10 py-2 bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-b border-zinc-200 flex justify-center items-center">
            <div className="w-full max-w-[1200px]">
              <Search
                initialSearch={initialSearch}
                initialBrandFilter={initialBrandFilter}
                initialTypeFilter={initialTypeFilter}
              />
            </div>
          </div>
          <div className="w-full h-[600px] flex flex-col justify-center items-center bg-slate-100 pt-[124px]">
            <div className="w-[550px] inline-flex flex-col justify-start items-center gap-3">
              <div className="self-stretch h-80 relative overflow-hidden">
                <img
                  src="./src/assets/blank.svg"
                  alt="No search results"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="self-stretch text-center justify-center text-neutral-500 text-base leading-snug tracking-tight">
                No search results available. Please try a different keyword or filter.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}