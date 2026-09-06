import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#123f35] px-4 py-4 text-white shadow-md sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* =========================
            TOP NAVBAR
        ========================== */}

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

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            <Link
              to="/"
              className="font-medium transition hover:text-[#d4aa55]"
            >
              Home
            </Link>

            
            <Link
              to="/my-trips"
              className="font-medium transition hover:text-[#d4aa55]"
            >
              My Trips
            </Link>

            

            {/* PLAN TRIP BUTTON */}

            <Link
              to="/plan"
              className="rounded-full bg-white px-5 py-3 font-semibold text-[#123f35] transition duration-300 hover:bg-[#d4aa55] hover:text-white"
            >
              Plan a Trip →
            </Link>
          </div>

          {/* =========================
              MOBILE MENU BUTTON
          ========================== */}

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="rounded-lg border border-white/20 px-3 py-2 text-2xl transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* =========================
            MOBILE / TABLET MENU
        ========================== */}

        {menuOpen && (
          <div className="mt-4 border-t border-white/15 pt-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium transition hover:bg-white/10"
              >
                Home
              </Link>

              
              <Link
                to="/my-trips"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium transition hover:bg-white/10"
              >
                My Trips
              </Link>

              

              {/* MOBILE PLAN BUTTON */}

              <Link
                to="/plan"
                onClick={closeMenu}
                className="mt-2 rounded-full bg-white px-6 py-3 text-center font-semibold text-[#123f35] transition hover:bg-[#d4aa55] hover:text-white"
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
