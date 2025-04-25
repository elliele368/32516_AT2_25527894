export default function Search() {
  return (
    <div className="self-stretch h-12 inline-flex justify-start items-center gap-3">
      {/* Car Brands */}
      <div className="self-stretch pl-3 pr-2 bg-orange-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-amber-200 flex justify-start items-center gap-2 hover:bg-orange-200/80 cursor-pointer active:ring active:ring-amber-300">
        <div className="text-yellow-600 text-base leading-snug tracking-tight">Car Brands (All)</div>
        <div className="w-6 h-6 relative">
          <img src="/src/assets/arrow-down.svg" alt="arrow down" className="w-5 h-5 ml-1 mt-0.5" />
        </div>
      </div>

      {/* Car Types */}
      <div className="self-stretch pl-3 pr-2 bg-orange-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-amber-200 flex justify-start items-center gap-2 hover:bg-orange-200/80 cursor-pointer active:ring active:ring-amber-300">
        <div className="text-yellow-600 text-base leading-snug tracking-tight">Car Types (All)</div>
        <div className="w-6 h-6 relative">
          <img src="/src/assets/arrow-down.svg" alt="arrow down" className="w-5 h-5 ml-1 mt-0.5" />
        </div>
      </div>

      {/* Search input + button */}
      <div className="flex-1 self-stretch rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center overflow-hidden">
        <div className="flex-1 h-11 px-4 flex justify-start items-center gap-2">
          {/* icon placeholder */}
          <div className="w-6 h-6 relative overflow-hidden flex items-center">
            <div className="w-6 h-6 left-0 top-0 absolute" />
            <img src="/src/assets/search.svg" alt="search icon" className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search for cars..."
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base leading-snug tracking-tight focus:outline-none"
          />
        </div>

        {/* Search button */}
        <div className="w-28 self-stretch px-5 bg-[rgba(231,170,76,1)] flex justify-center items-center gap-2 cursor-pointer hover:bg-yellow-600 transition-colors">
          <div className="text-white text-base font-medium leading-snug tracking-tight">Search</div>
        </div>
      </div>
    </div>
  );
}