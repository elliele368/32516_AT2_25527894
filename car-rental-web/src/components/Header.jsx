import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Uncomment dòng này
import logo from "../assets/logo.svg";

export default function Header({ solid = false }) {
    const [isScrolled, setIsScrolled] = useState(false); // track scroll
    const location = useLocation(); //current page
    const isHome = location.pathname === "/"; //current page is home or not?
    const isReservation = location.pathname === "/reservation"; //reservation page

    useEffect(() => {
        if (!isHome) return; // if not home, return
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20); // if scrolled more than 20px, set isScrolled to true
        };

        window.addEventListener("scroll", handleScroll); // add event listener to window
        return () => window.removeEventListener("scroll", handleScroll); // remove event listener on unmount
    }, [isHome]);


    // if not Home, prop 'solid' is always true. if Home, prop 'solid' is true if scrolled more than 20px :)

    const solidHeader = solid || isScrolled; // if solid is true or scrolled is true, set solidHeader to true
    const activeLinkClass = "font-semibold border-b-4 border-yellow-500 text-transparent bg-clip-text"; // active link class

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-16 px-10 inline-flex justify-between items-center 
    ${solidHeader ? "bg-white shadow-lg border-b border-gray-200 text-gray-500" : "bg-transparent text-white"}`}>

            {/* logo and name */}
            <div class="inline-flex justify-start items-center gap-3">
                <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
                    <img src={logo} alt="ELcar logo" className="h-8 w-auto" />
                    <div class="w-36 inline-flex flex-col justify-start items-start gap-0.5">
                        <div className="self-stretch justify-center text-base font-bold uppercase leading-snug tracking-tight bg-gradient-to-l from-yellow-600 to-orange-300 bg-clip-text text-transparent">
                            ElCar Rental
                        </div>
                        <div class="self-stretch h-4 justify-center text-xs font-normal leading-normal tracking-tight">Fast and convenient...</div>
                    </div>
                </Link>
            </div>

            {/* reservation */}

            <nav className="self-stretch inline-flex justify-start items-center">
                <Link
                    to="/reservation"
                    className={`w-28 self-stretch px-3 inline-flex justify-center items-center gap-3
      ${isReservation ? activeLinkClass : "hover:text-yellow-600"} transition-all duration-300`}
                >
                    <div
                        className={`text-base leading-7 tracking-tight font-['Inter']
        ${isReservation
                                ? "text-transparent bg-gradient-to-l from-yellow-600 to-orange-300 bg-clip-text font-semibold"
                                : "font-normal"}
      `}
                    >
                        Reservation
                    </div>
                </Link>
            </nav>
        </header>
    )
}