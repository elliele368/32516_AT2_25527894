import { useState } from "react";
import carListData from "../data/carList";
import CarCard from "../components/CarCard";

export default function Reservation() {
  const [cars, setCars] = useState(carListData);

  const toggleReservation = (vin) => {
    setCars((prev) =>
      prev.map((car) =>
        car.vin === vin
          ? { ...car, reserved: !car.reserved }
          : car.reserved
          ? { ...car, reserved: false }
          : car
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 py-10">
      {cars.map((car) => (
        <CarCard
          key={car.vin}
          {...car}
          onAction={() => toggleReservation(car.vin)}
        />
      ))}
    </div>
  );
}