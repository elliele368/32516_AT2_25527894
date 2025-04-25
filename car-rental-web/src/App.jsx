import Header from "./components/Header";
import Search from "./components/Search";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Reservation from "./pages/Reservation";
import backgroundImage from "./assets/header-bg.png";

export default function App() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <div className="min-h-screen bg-slate-100 overflow-y-auto scrollbar-hide relative">
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
            <div className="relative z-20 pt-6">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/reservation" element={<Reservation />} />
                </Routes>
            </div>
        </div>
    );
}