import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFilteredCars } from '../api/api';
import CarCard from '../components/CarCard';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="relative z-20 flex justify-center mb-[40px]">
        <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <div className="w-full text-center text-red-500 py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    // to update 
    <div className="relative z-20 flex justify-center mb-[40px] mt-[80px]">
      <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
        <h2 className="w-full text-yellow-600 text-lg font-semibold text-center mb-6">SEARCH RESULTS</h2>
        
        {cars.length > 0 ? (
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
        ) : (
          <div className="w-full text-center text-gray-500 py-8">
            No cars found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
} 