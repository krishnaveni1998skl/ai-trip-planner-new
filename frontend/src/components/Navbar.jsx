import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#8a5a32] bg-[#4A2C1A] text-white shadow-lg">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/way-to-paradise-logo.jpg"
            alt="Way to Paradise"
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="hidden sm:block">
            <h1 className="font-serif text-lg font-semibold tracking-[0.15em]">
              WAY TO PARADISE
            </h1>

            <p className="text-[9px] tracking-[0.2em] text-[#E8D8C0]">
              TRAVELS · EXPLORE · REMEMBER
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium transition hover:text-[#C89B3C]"
          >
            Home
          </Link>

          <Link
            to="/my-trips"
            className="text-sm font-medium transition hover:text-[#C89B3C]"
          >
            My Trips
          </Link>

          <Link
            to="/plan"
            className="rounded-full bg-[#C89B3C] px-5 py-2 text-sm font-semibold text-[#2F2118] transition hover:bg-[#E8D8C0]"
          >
            Plan a Trip →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-[#A66A35] px-3 py-2 text-xl md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#8a5a32] bg-[#4A2C1A] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm hover:bg-[#6B4226]"
            >
              Home
            </Link>

            <Link
              to="/my-trips"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm hover:bg-[#6B4226]"
            >
              My Trips
            </Link>

            <Link
              to="/plan"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-[#C89B3C] px-4 py-3 text-center text-sm font-semibold text-[#2F2118]"
            >
              Plan a Trip →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
