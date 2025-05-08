export default function NoCarSelected() {
    return (
      <div className="w-full h-[600px] flex flex-col justify-center items-center bg-slate-100">
        <div className="w-[550px] inline-flex flex-col justify-start items-center gap-3">
          <div className="self-stretch h-80 relative overflow-hidden">
            <img
              src="./src/assets/blank.svg"
              alt="No car selected"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="self-stretch text-center justify-center text-neutral-500 text-base leading-snug tracking-tight">
            No car selected or unavailable. Please pick another car to proceed.
          </div>
        </div>
      </div>
    );
  }