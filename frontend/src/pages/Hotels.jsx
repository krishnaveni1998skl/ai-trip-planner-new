import { useState } from "react";
import { useNavigate } from "react-router-dom";

const hotels = [
  {
    name: "Demo Grand Hotel",
    location: "Downtown Dubai",
    destination: "Dubai",
    rating: "4.5",
    room: "Deluxe Room",
    price: 12000,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Paradise Stay",
    location: "Dubai Marina",
    destination: "Dubai",
    rating: "4.2",
    room: "Standard Room",
    price: 8500,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Budget Comfort",
    location: "Bur Dubai",
    destination: "Dubai",
    rating: "3.8",
    room: "Standard Room",
    price: 5500,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Paris Grand Stay",
    location: "Central Paris",
    destination: "Paris",
    rating: "4.6",
    room: "Deluxe Room",
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Eiffel Paradise Hotel",
    location: "Near Eiffel Tower",
    destination: "Paris",
    rating: "4.4",
    room: "Premium Room",
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Paris Budget Comfort",
    location: "Montmartre",
    destination: "Paris",
    rating: "4.0",
    room: "Standard Room",
    price: 9000,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85",
  },
];

function Hotels() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("Dubai");
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState("4");
  const [guests, setGuests] = useState("2");

  const [searchDestination, setSearchDestination] = useState("Dubai");

  // ============================================================
  // SEARCH HOTELS
  // ============================================================

  const searchHotels = () => {
    setSearchDestination(destination);
  };

  // ============================================================
  // FILTER HOTELS
  // ============================================================

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.destination.toLowerCase() === searchDestination.toLowerCase(),
  );

  // ============================================================
  // PLAN TRIP WITH HOTEL
  // ============================================================

  const handlePlanTrip = (hotel) => {
    const total = hotel.price * Number(nights || 1);

    navigate("/plan", {
      state: {
        destination: destination,

        start_date: checkIn,

        travelers: Number(guests) || 2,

        budget: total,

        travel_style: destination === "Paris" ? "Cultural" : "Adventure",

        interests:
          destination === "Paris"
            ? ["Culture", "History", "Food"]
            : ["Adventure", "Shopping"],

        hotel: {
          name: hotel.name,
          location: hotel.location,
          room: hotel.room,
          rating: hotel.rating,
          pricePerNight: hotel.price,
          nights: Number(nights) || 1,
          guests: Number(guests) || 2,
          totalPrice: total,
        },

        message: `I want to stay at ${hotel.name} in ${destination}.`,
      },
    });
  };

  // ============================================================
  // PLAN JOURNEY WITHOUT HOTEL
  // ============================================================

  const handlePlanJourney = () => {
    navigate("/plan", {
      state: {
        destination: destination,

        start_date: checkIn,

        travelers: Number(guests) || 2,

        travel_style: destination === "Paris" ? "Cultural" : "Adventure",

        interests:
          destination === "Paris"
            ? ["Culture", "History", "Food"]
            : ["Adventure", "Shopping"],

        message: `Plan a trip to ${destination}.`,
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
            ✦ Stay in Paradise ✦
          </p>

          <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">
            Find Your
            <span className="block italic text-[#E5C873]">Perfect Stay</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Discover comfortable hotels that match your destination, travel
            dates and budget.
          </p>
        </div>
      </section>

      {/* ======================================================
          SEARCH
      ======================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-9">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* DESTINATION */}

            <div>
              <label className="text-sm font-semibold">Destination</label>

              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              >
                <option value="Dubai">Dubai</option>

                <option value="Paris">Paris</option>
              </select>
            </div>

            {/* CHECK IN */}

            <div>
              <label className="text-sm font-semibold">Check-in</label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              />
            </div>

            {/* NIGHTS */}

            <div>
              <label className="text-sm font-semibold">Nights</label>

              <input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              />
            </div>

            {/* GUESTS */}

            <div>
              <label className="text-sm font-semibold">Guests</label>

              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#B4883D]"
              />
            </div>
          </div>

          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={searchHotels}
            className="mt-6 rounded-xl bg-[#183B32] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#28594D]"
          >
            Search Hotels →
          </button>
        </div>

        {/* ====================================================
            HOTEL RESULTS
        ===================================================== */}

        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Recommended Stays
          </p>

          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
            Hotels in {searchDestination}
          </h2>

          {filteredHotels.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center">
              <p className="font-serif text-2xl">No hotels found</p>

              <p className="mt-3 text-sm text-[#183B32]/50">
                Try another destination.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => {
                const total = hotel.price * Number(nights || 1);

                return (
                  <article
                    key={hotel.name}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* IMAGE */}

                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                      <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#183B32]">
                        ★ {hotel.rating}
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#B4883D]">
                        {hotel.location}
                      </p>

                      <h3 className="mt-2 font-serif text-2xl font-bold">
                        {hotel.name}
                      </h3>

                      <p className="mt-2 text-sm text-[#183B32]/50">
                        {hotel.room}
                      </p>

                      <div className="mt-5 border-t border-[#183B32]/10 pt-5">
                        <p className="text-xs text-[#183B32]/40">
                          ₹{hotel.price.toLocaleString("en-IN")} / night
                        </p>

                        <div className="mt-1 flex items-end justify-between gap-3">
                          <div>
                            <p className="font-serif text-2xl font-bold">
                              ₹{total.toLocaleString("en-IN")}
                            </p>

                            <p className="text-[10px] text-[#183B32]/40">
                              {nights} nights · {guests} guests
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlanTrip(hotel)}
                            className="rounded-full bg-[#183B32] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#28594D]"
                          >
                            Plan Trip →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CTA
      ======================================================= */}

      <section className="bg-[#EDE6D5] px-6 py-20 text-center">
        <img
          src="/way-to-paradise-logo.jpg"
          alt="Way To Paradise"
          className="mx-auto h-16 w-16 object-contain"
        />

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
          Complete Your Journey
        </p>

        <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
          Found your perfect stay?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#183B32]/55">
          Continue to the AI planner and create your personalized journey.
        </p>

        <button
          type="button"
          onClick={handlePlanJourney}
          className="mt-7 rounded-full bg-[#183B32] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#E5C873] transition hover:bg-[#28594D]"
        >
          Plan My Journey →
        </button>
      </section>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <footer className="bg-[#102F29] py-10 text-center text-white">
        <p className="font-serif text-xl font-bold">WAY TO PARADISE</p>

        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>

        <p className="mt-4 text-xs text-white/30">
          Your Journey to Paradise Begins Here.
        </p>
      </footer>
    </main>
  );
}

export default Hotels;
