import carList from "../data/carList";
import CarCard from "../components/CarCard";

export default function Home() {
  return (
    <div className="relative z-20 flex justify-center mb-[40px]">
      <div className="w-full max-w-[1200px] mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-14 2xl:mx-20 px-8 pt-5 pb-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex flex-col justify-start items-start gap-4">
      <h2 className="w-full text-yellow-600 text-lg font-semibold text-center">CHOOSE A CAR</h2>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {carList.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
    </div>
  );
}