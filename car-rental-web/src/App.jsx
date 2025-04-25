import Header from "./components/Header";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Reservation from "./pages/Reservation";
import backgroundImage from "./assets/header-bg.png";

export default function App() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <div className="min-h-screen bg-slate-100 overflow-hidden relative">
            {/* Show background image if on homepage */}
            {isHome && (
                <>
                    <div
                        className="absolute top-0 left-0 w-full h-[200px] bg-cover bg-center z-0"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className="absolute top-0 left-0 w-full h-[200px] bg-black/20 z-10" />
                </>
            )}

            {/* Header - Đặt trực tiếp không bọc trong div */}
            <Header solid={!isHome} />

            {/* Routed content */}
            <div className="relative z-20 pt-20 px-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/reservation" element={<Reservation />} />
                </Routes>
            </div>
        </div>
    );
}