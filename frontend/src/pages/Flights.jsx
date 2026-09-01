import { useState } from "react";
import { useNavigate } from "react-router-dom";

const flights = [
  {
    airline: "Demo Airways",
    type: "Direct",
    departure: "08:00",
    arrival: "11:30",
    duration: "3h 30m",
    price: 36000,
  },
  {
    airline: "Travel Express",
    type: "1 Stop",
    departure: "14:00",
    arrival: "17:45",
    duration: "3h 45m",
    price: 30000,
  },
  {
    airline: "Sky Connect",
    type: "Direct",
    departure: "10:30",
    arrival: "14:00",
    duration: "3h 30m",
    price: 42000,
  },
];

function Flights() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("Chennai");
  const [to, setTo] = useState("Dubai");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");

  // ============================================================
  // PLAN TRIP WITH SELECTED FLIGHT
  // ============================================================

  const handlePlanTrip = (flight) => {
    const travelerCount = Number(travelers) || 1;

    // Flight price is for one traveler
    const totalFlightCost = flight.price * travelerCount;

    navigate("/plan", {
      state: {
        destination: to,

        start_date: date,

        travelers: travelerCount,

        budget: totalFlightCost,

        travel_style: to.toLowerCase() === "paris" ? "Cultural" : "Adventure",

        interests:
          to.toLowerCase() === "paris"
            ? ["Culture", "History", "Food"]
            : ["Adventure", "Shopping"],

        flight: {
          airline: flight.airline,
          type: flight.type,
          departure: flight.departure,
          arrival: flight.arrival,
          duration: flight.duration,
          from: from,
          to: to,
          date: date,
          travelers: travelerCount,
          pricePerTraveler: flight.price,
          totalPrice: totalFlightCost,
        },

        message:
          `I want to travel from ${from} to ${to} ` +
          `on ${date || "my selected date"} ` +
          `with ${travelerCount} travelers ` +
          `using ${flight.airline}.`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="bg-[#123D35] px-5 pb-20 pt-28 text-white sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            ✦ Travel Search ✦
          </p>

          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">
            Find Your
            <span className="block italic text-[#E5C873]">Perfect Flight</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Search and compare suitable flight options for your journey.
          </p>
        </div>
      </section>

      {/* ======================================================
          SEARCH DETAILS
      ======================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-9">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* FROM */}

            <Input
              label="From"
              value={from}
              onChange={setFrom}
              placeholder="Chennai"
            />

            {/* TO */}

            <Input label="To" value={to} onChange={setTo} placeholder="Dubai" />

            {/* DATE */}

            <div>
              <label className="text-sm font-semibold">Travel Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              />
            </div>

            {/* TRAVELERS */}

            <div>
              <label className="text-sm font-semibold">Travelers</label>

              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              />
            </div>
          </div>

          {/* DATE INFORMATION */}

          {date && (
            <div className="mt-6 rounded-xl bg-[#F7F3E8] px-5 py-4">
              <p className="text-xs text-[#183B32]/50">Selected Travel Date</p>

              <p className="mt-1 font-semibold text-[#183B32]">{date}</p>
            </div>
          )}
        </div>

        {/* ====================================================
            RESULTS
        ===================================================== */}

        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Available Options
          </p>

          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
            Flights from {from} to {to}
          </h2>

          <div className="mt-8 space-y-5">
            {flights.map((flight) => {
              const travelerCount = Number(travelers) || 1;

              const totalPrice = flight.price * travelerCount;

              return (
                <div
                  key={flight.airline}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="grid gap-7 md:grid-cols-[1fr_1.5fr_auto] md:items-center">
                    {/* ==================================================
                        AIRLINE
                    ================================================== */}

                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E8D5] text-[#B4883D]">
                        ✈
                      </div>

                      <h3 className="mt-4 font-serif text-xl font-bold">
                        {flight.airline}
                      </h3>

                      <p className="mt-1 text-xs text-[#B4883D]">
                        {flight.type}
                      </p>
                    </div>

                    {/* ==================================================
                        TIME
                    ================================================== */}

                    <div className="flex items-center gap-4 sm:gap-5">
                      <div>
                        <p className="font-serif text-2xl">
                          {flight.departure}
                        </p>

                        <p className="text-xs text-[#183B32]/45">{from}</p>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-xs text-[#183B32]/40">
                          {flight.duration}
                        </p>

                        <div className="mt-2 h-px bg-[#183B32]/15" />

                        <p className="mt-2 text-[10px] text-[#B4883D]">
                          {flight.type}
                        </p>
                      </div>

                      <div>
                        <p className="font-serif text-2xl">{flight.arrival}</p>

                        <p className="text-xs text-[#183B32]/45">{to}</p>
                      </div>
                    </div>

                    {/* ==================================================
                        PRICE
                    ================================================== */}

                    <div className="text-left md:text-right">
                      <p className="text-xs text-[#183B32]/40">
                        ₹{flight.price.toLocaleString("en-IN")} per traveler
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold">
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </p>

                      <p className="mt-1 text-[10px] text-[#183B32]/40">
                        Total for {travelerCount} travelers
                      </p>

                      {date && (
                        <p className="mt-1 text-[10px] text-[#B4883D]">
                          Travel date: {date}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePlanTrip(flight)}
                        className="mt-4 rounded-full bg-[#E5C873] px-5 py-3 text-xs font-bold text-[#183B32] transition hover:bg-[#D4AA55]"
                      >
                        Plan Trip →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="bg-[#102F29] py-10 text-center text-white">
        <img
          src="/way-to-paradise-logo.jpg"
          alt="Way To Paradise"
          className="mx-auto h-14 w-14 object-contain"
        />

        <p className="mt-4 font-serif text-xl font-bold">WAY TO PARADISE</p>

        <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>
      </footer>
    </main>
  );
}

// ============================================================
// INPUT COMPONENT
// ============================================================

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
      />
    </div>
  );
}

export default Flights;
