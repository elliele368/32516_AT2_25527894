export default function CarCard({ car, onAction }) {
  const {
    name,
    year,
    brand,
    type,
    description,
    price,
    available = true,
    reserved = false,
    image
  } = car;

  const handleAction = () => {
    if (onAction) onAction();
  };

  return (
    <div className="group bg-white rounded-lg shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-zinc-200/80 inline-flex flex-col items-start overflow-hidden w-full max-w-xl hover:outline-[rgba(255,212,144,1)] hover:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="w-full px-8 py-2 inline-flex justify-between items-center">
        <img
          className="w-48 h-40 object-contain"
          src={image || "https://res.cloudinary.com/dolponxt4/image/upload/CarRental-AT2/placeholder_car_l2qpmj"}
          alt={name || "Car image"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://res.cloudinary.com/dolponxt4/image/upload/CarRental-AT2/placeholder_car_l2qpmj";
          }}
        />
        <div className="w-60 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 w-full">
              <div className="text-gray-800 font-semibold group-hover:text-yellow-600 transition truncate">
                <span className="truncate">{name}</span>
              </div>
              {reserved && (
                <span className="flex-shrink-0 bg-[rgba(231,169,76,0.2)] text-yellow-600 text-xs font-normal px-2 py-1 rounded">
                  Reserved
                </span>
              )}
            </div>
            <div className="inline-flex gap-2 text-xs text-zinc-700">
              <span className="px-1.5 py-0.5 bg-slate-200/70 rounded">{year}</span>
              <span className="px-1.5 py-0.5 bg-slate-200/70 rounded">{brand}</span>
              <span className="px-1.5 py-0.5 bg-slate-200/70 rounded">{type}</span>
            </div>
          </div>
          <div className="text-neutral-500/80 text-sm font-light leading-snug tracking-tight">{description}</div>
        </div>
      </div>

      <div className="w-full px-8 py-3 bg-neutral-50 rounded-tr-xl shadow-[4px_0px_12px_0px_rgba(0,0,0,0.04)] border-t border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className={`h-10 px-2 py-0.5 rounded flex items-center ${
              available ? "bg-[rgba(225,240,233,1)] text-green-700" : "bg-slate-200 text-neutral-500"
            } text-sm font-normal`}
          >
            {available ? "Now available" : "Not available"}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-700 text-xl font-bold">${price}</span>
            <span className="text-zinc-400 text-xs">/ per day</span>
          </div>
        </div>

        {available ? (
          reserved ? (
            <button
              className="w-28 h-10 px-5 bg-white rounded shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-2"
              onClick={handleAction}
            >
              <span className="text-neutral-500 text-base font-semibold">Cancel</span>
            </button>
          ) : (
            <button
              className="w-28 h-10 px-5 bg-[rgba(231,170,76,1)] rounded shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] flex justify-center items-center gap-2 text-white font-semibold text-base hover:bg-yellow-600 transition"
              onClick={handleAction}
            >
              Rent
            </button>
          )
        ) : (
          <div className="w-28 h-10 px-5 bg-neutral-300 rounded shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] flex justify-center items-center gap-2 text-white font-semibold text-base">
            Rent
          </div>
        )}
      </div>
    </div>
  );
}