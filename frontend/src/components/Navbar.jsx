import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#123f35] px-5 py-4 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* TOP NAVBAR */}
        <div className="flex items-center justify-between">
          {/* LOGO + NAME */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 sm:gap-3"
          >
            <img
              src="/way-to-paradise-logo.jpg"
              alt="Way To Paradise"
              className="h-11 w-11 object-contain sm:h-14 sm:w-14"
            />

            <div className="font-serif">
              <h1 className="text-base font-bold tracking-wider sm:text-2xl">
                WAY TO PARADISE
              </h1>

              <p className="text-[7px] tracking-[0.2em] text-gray-300 sm:text-[9px] sm:tracking-[0.3em]">
                TRAVELS · EXPLORE · REMEMBER
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-7">
            <Link to="/" className="transition hover:text-[#d4aa55]">
              Home
            </Link>
            <Link
              to="/destinations"
              className="transition hover:text-[#d4aa55]"
            >
              Destinations
            </Link>

            <Link to="/tours" className="transition hover:text-[#d4aa55]">
              Tours
            </Link>

            <Link to="/my-trips" className="transition hover:text-[#d4aa55]">
              My Trips
            </Link>

            <Link to="/budget" className="transition hover:text-[#d4aa55]">
              Smart Budget
            </Link>

            <Link to="/chatbot" className="transition hover:text-[#d4aa55]">
              Chatbot
            </Link>

            <Link to="/about" className="transition hover:text-[#d4aa55]">
              About
            </Link>
            <Link
              to="/plan"
              className="rounded-full bg-white px-6 py-3 font-semibold text-[#123f35] transition hover:bg-[#d4aa55]"
            >
              Plan a Trip
            </Link>
          </div>

          {/* MOBILE + TABLET MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/20 px-3 py-2 text-2xl transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE + TABLET MENU */}
        {menuOpen && (
          <div className="mt-4 border-t border-white/15 pt-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                Home
              </Link>

              <Link
                to="/destinations"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                Destinations
              </Link>

              <Link
                to="/tours"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                Tours
              </Link>

              <Link
                to="/my-trips"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                My Trips
              </Link>

              <Link
                to="/budget"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                Smart Budget
              </Link>

              <Link
                to="/chatbot"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                Chatbot
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 hover:bg-white/10"
              >
                About
              </Link>

              <Link
                to="/plan"
                onClick={closeMenu}
                className="mt-2 rounded-full bg-white px-6 py-3 text-center font-semibold text-[#123f35] transition hover:bg-[#d4aa55]"
              >
                Plan a Trip →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
