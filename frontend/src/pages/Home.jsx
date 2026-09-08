import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState("2 Adults");
  const [budget, setBudget] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // PLAN MY JOURNEY
  // =====================================================

  const handlePlan = () => {
    const place = destination.trim();
    const amount = budget.trim();

    if (!place) {
      return;
    }

    let message = `Plan a trip to ${place}`;

    if (travelDate) {
      message += ` on ${travelDate}`;
    }

    if (travelers) {
      message += ` for ${travelers}`;
    }

    if (amount) {
      message += ` with a budget of ₹${amount}`;
    }

    setIsPlanning(true);

    setTimeout(() => {
      setIsPlanning(false);

      navigate("/plan", {
        state: {
          message,
        },
      });
    }, 500);
  };

  // =====================================================
  // DESTINATION SELECT
  // =====================================================

  const selectDestination = (place) => {
    setDestination(place);
  };

  return (
    <main className="min-h-screen bg-[#F6EFE3] text-[#2F2118]">
      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#5A3015]">
        {/* =================================================
            HERO BACKGROUND
        ================================================= */}

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2200&q=85')] bg-cover bg-center" />

        {/* Dark overlay */}

        <div className="absolute inset-0 bg-[#3A1F0F]/55" />

        {/* Left teakwood overlay */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#3A1F0F]/95 via-[#5A3015]/65 to-transparent" />

        {/* Bottom overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-[#3A1F0F]/80 via-transparent to-black/10" />

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className="relative mx-auto max-w-[1450px] px-5 pb-8 pt-28 sm:px-8 lg:px-10">
          {/* =================================================
              HERO TOP AREA
          ================================================= */}

          <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-[34%_66%]">
            {/* =================================================
                LEFT TEAKWOOD PANEL
            ================================================= */}

            <div className="flex flex-col justify-center rounded-t-3xl bg-[#4A2713]/90 px-7 py-10 backdrop-blur-[2px] sm:px-10 lg:rounded-l-3xl lg:rounded-tr-none lg:px-12">
              {/* AI LABEL */}

              <div className="mb-7 flex items-center gap-3">
                <span className="text-xl text-[#E7C76B]">✦</span>

                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E7C76B]">
                  AI Travel Planning
                </span>

                <div className="h-px w-12 bg-[#E7C76B]/50" />
              </div>

              {/* =================================================
                  HEADING
              ================================================= */}

              <h1 className="font-serif text-4xl font-medium leading-[1.02] text-[#FFFDF8] sm:text-5xl lg:text-[48px]">
                Your Journey to
                <span className="mt-1 block italic text-[#E7C76B]">
                  Paradise
                </span>
                <span className="block">Begins Here.</span>
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-6 max-w-md text-sm leading-6 text-[#F6EFE3]/80 sm:text-base">
                Plan smarter. Travel better with Paradise AI.
              </p>
            </div>

            {/* =================================================
                RESORT IMAGE
            ================================================= */}

            <div className="relative min-h-[300px] overflow-hidden lg:min-h-0 lg:rounded-r-3xl">
              <img
                src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85"
                alt="Luxury tropical resort"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Image overlay */}

              <div className="absolute inset-0 bg-gradient-to-r from-[#4A2713]/20 via-transparent to-[#2F1A10]/20" />

              {/* =================================================
                  DECORATIVE QUOTE
              ================================================= */}

              <div className="absolute bottom-8 right-7 max-w-[220px] text-right sm:right-10">
                <div className="mb-2 text-3xl text-[#E7C76B]">✦</div>

                <p className="font-serif text-xl italic leading-tight text-white sm:text-2xl">
                  Collect
                  <br />
                  Moments
                  <br />
                  Not Things
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              SEARCH / PLANNING CARD
          ===================================================== */}

          <div className="relative z-20 -mt-1 rounded-3xl border border-[#D8B98A]/40 bg-[#FBF7EF] p-3 shadow-[0_20px_60px_rgba(47,26,16,0.35)] sm:p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_1.1fr_1.2fr]">
              {/* =================================================
                  WHERE TO
              ================================================= */}

              <div className="rounded-2xl border border-[#D8B98A]/30 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#7A4018]">●</span>

                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-bold text-[#2F2118]">
                      Where to?
                    </label>

                    <input
                      type="text"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      placeholder="e.g. Maldives, Dubai"
                      className="mt-1 w-full bg-transparent text-sm text-[#5A3A25] outline-none placeholder:text-[#8B7764]"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  TRAVEL DATE
              ================================================= */}

              <div className="rounded-2xl border border-[#D8B98A]/30 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#7A4018]">▣</span>

                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-bold text-[#2F2118]">
                      Travel Dates
                    </label>

                    <input
                      type="date"
                      value={travelDate}
                      onChange={(event) => setTravelDate(event.target.value)}
                      className="mt-1 w-full bg-transparent text-sm text-[#5A3A25] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  TRAVELERS
              ================================================= */}

              <div className="rounded-2xl border border-[#D8B98A]/30 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[#7A4018]">●●</span>

                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-bold text-[#2F2118]">
                      Travelers
                    </label>

                    <select
                      value={travelers}
                      onChange={(event) => setTravelers(event.target.value)}
                      className="mt-1 w-full cursor-pointer bg-transparent text-sm text-[#5A3A25] outline-none"
                    >
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>3 Adults</option>
                      <option>4 Adults</option>
                      <option>5 Adults</option>
                      <option>6 Adults</option>
                      <option>2 Adults + 1 Child</option>
                      <option>2 Adults + 2 Children</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* =================================================
                  BUDGET
              ================================================= */}

              <div className="rounded-2xl border border-[#D8B98A]/30 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#7A4018]">₹</span>

                  <div className="min-w-0 flex-1">
                    <label className="block text-xs font-bold text-[#2F2118]">
                      Budget (₹)
                    </label>

                    <input
                      type="number"
                      value={budget}
                      onChange={(event) => setBudget(event.target.value)}
                      placeholder="e.g. 2,00,000"
                      className="mt-1 w-full bg-transparent text-sm text-[#5A3A25] outline-none placeholder:text-[#8B7764]"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  PLAN BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handlePlan}
                disabled={isPlanning || !destination.trim()}
                className="min-h-[70px] rounded-2xl bg-[#7A4018] px-6 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#8D4B1B] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#E7C76B]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#E7C76B] [animation-delay:150ms]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#E7C76B] [animation-delay:300ms]" />

                    <span>Planning...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Plan My Journey
                    <span className="text-lg text-[#E7C76B]">→</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              DESTINATION CARDS
          ===================================================== */}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <DestinationCard
              name="Maldives"
              image="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Maldives")}
            />

            <DestinationCard
              name="Dubai"
              image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Dubai")}
            />

            <DestinationCard
              name="Singapore"
              image="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Singapore")}
            />

            <DestinationCard
              name="Bali"
              image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Bali")}
            />

            <DestinationCard
              name="Thailand"
              image="https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Thailand")}
            />

            <DestinationCard
              name="Europe"
              image="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
              onClick={() => selectDestination("Europe")}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY TRAVEL WITH US
      ===================================================== */}

      <section className="bg-[#F6EFE3] px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-3xl font-semibold text-[#4A2713] sm:text-4xl">
            Why Travel with Us?
          </h2>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <BenefitCard
              icon="✦"
              title="AI Powered Planning"
              description="Personalized itineraries"
            />

            <BenefitCard
              icon="▰"
              title="Best Travel Options"
              description="Flights, hotels, places & more"
            />

            <BenefitCard
              icon="₹"
              title="Budget Friendly"
              description="Travel within your budget"
            />

            <BenefitCard
              icon="★"
              title="Save & Manage Trips"
              description="Keep all your trips in one place"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="border-t border-[#D8B98A]/40 bg-[#FBF7EF] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          <StatCard
            icon="◎"
            number="50+"
            title="Destinations"
            subtitle="Across the world"
          />

          <StatCard
            icon="●"
            number="1,00,000+"
            title="Travelers"
            subtitle="Trusted us"
          />

          <StatCard
            icon="★"
            number="4.8/5"
            title="Rating"
            subtitle="From happy travelers"
          />

          <StatCard
            icon="◉"
            number="24/7"
            title="Support"
            subtitle="Always here for you"
          />
        </div>
      </section>

      {/* =====================================================
          QUOTE SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#E8D8C0] px-5 py-20 sm:px-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=80')] bg-cover bg-center opacity-30" />

        <div className="absolute inset-0 bg-[#F6EFE3]/65" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="font-serif text-5xl text-[#A66A35]">“</span>

          <blockquote className="font-serif text-2xl italic leading-relaxed text-[#4A2713] sm:text-4xl">
            Travel far enough, you meet yourself.
          </blockquote>

          <p className="mt-5 text-sm font-medium text-[#6B4226]">
            — David Mitchell
          </p>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#3A2114] px-5 py-8 text-[#F6EFE3] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          {/* BRAND */}

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-[#E7C76B]/60 bg-[#F6EFE3]">
              <img
                src="/way-to-paradise-logo.jpg"
                alt="Way To Paradise"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold">WAY TO PARADISE</h3>

              <p className="mt-1 text-[8px] tracking-[0.25em] text-[#E7C76B]">
                TRAVELS · EXPLORE · REMEMBER
              </p>
            </div>
          </div>

          {/* FOOTER LINKS */}

          <div className="flex items-center gap-5 text-sm text-[#F6EFE3]/80">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="transition hover:text-[#E7C76B]"
            >
              Home
            </button>

            <span className="text-[#E7C76B]/40">|</span>

            <button
              type="button"
              onClick={() => navigate("/my-trips")}
              className="transition hover:text-[#E7C76B]"
            >
              My Trips
            </button>

            <span className="text-[#E7C76B]/40">|</span>

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="transition hover:text-[#E7C76B]"
            >
              Plan a Trip
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({ name, image, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-28 overflow-hidden rounded-2xl border border-white/60 bg-[#4A2713] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-32"
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#2F1A0E]/85 via-[#2F1A0E]/20 to-transparent" />

      <span className="absolute bottom-3 left-4 font-serif text-lg font-bold text-white sm:text-xl">
        {name}
      </span>
    </button>
  );
}

/* =========================================================
   BENEFIT CARD
========================================================= */

function BenefitCard({ icon, title, description }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-[#D8B98A]/40 bg-[#FBF7EF] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#D8B98A]/50 bg-[#F6E8CF] text-2xl font-bold text-[#7A4018] shadow-sm">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#2F2118] sm:text-base">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#7A5A3A]">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, number, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 border-r border-[#D8B98A]/40 last:border-0">
      <span className="text-3xl text-[#8A4A1B]">{icon}</span>

      <div>
        <p className="text-sm font-bold text-[#2F2118] sm:text-base">
          {number} {title}
        </p>

        <p className="mt-1 text-xs text-[#7A5A3A]">{subtitle}</p>
      </div>
    </div>
  );
}

export default Home;
