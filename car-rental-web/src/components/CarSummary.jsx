export default function CarSummary({ car }) {
  if (!car || !car.reserved) return null;

  const {
    name = "Kia Sunshine Hatch",
    year = "2023",
    brand = "Kia/Huyndai",
    type = "Hatchback",
    description = "Bright, fun, and compact for city driving.",
    image = "https://res.cloudinary.com/dolponxt4/image/upload/v1745657099/sunshine-hatch_bfquge.png"
  } = car;

  return (
    <div className="w-[508px] self-stretch px-10 pb-16 bg-white rounded shadow-[0px_4px_8px_0px_rgba(10,26,40,0.02)] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex flex-col justify-center items-center gap-1 overflow-hidden">
      <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-bold  uppercase leading-snug tracking-tight">
        {name}
      </div>
      <img className="w-[465px] h-72 object-contain" src={image} alt={name} />
      <div className="self-stretch flex flex-col justify-center items-center gap-5">
        <div className="self-stretch flex flex-col justify-start items-center gap-5">
          <div className="self-stretch inline-flex justify-center items-center gap-3">
            <div className="h-8 px-3 py-1 bg-slate-200 rounded flex justify-center items-center">
              <div className="text-center justify-center text-zinc-700 text-base font-normal  leading-none tracking-tight">{year}</div>
            </div>
            <div className="h-8 px-3 py-1 bg-slate-200 rounded flex justify-center items-center">
              <div className="text-center justify-center text-zinc-700 text-base font-normal  leading-none tracking-tight">{brand}</div>
            </div>
            <div className="h-8 px-3 py-1 bg-slate-200 rounded flex justify-center items-center">
              <div className="text-center justify-center text-zinc-700 text-base font-normal  leading-none tracking-tight">{type}</div>
            </div>
          </div>
        </div>
        <div className="self-stretch text-center justify-center text-neutral-500 text-xl font-light leading-snug tracking-tight">
          {description}
        </div>
      </div>
    </div>
  );
}