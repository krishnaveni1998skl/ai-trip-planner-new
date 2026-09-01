import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [message, setMessage] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // PLAN MY JOURNEY
  // =====================================================

  const handlePlan = () => {
    const text = message.trim();

    if (!text) {
      return;
    }

    setIsPlanning(true);

    setTimeout(() => {
      setIsPlanning(false);

      // Send the complete user message.
      // PlanTrip.jsx will extract the destination.
      navigate("/plan", {
        state: {
          message: text,
        },
      });
    }, 500);
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handlePlan();
    }
  };

  // =====================================================
  // FLIGHTS
  // =====================================================

  const handleFlightClick = () => {
    navigate("/flights");
  };

  // =====================================================
  // HOTELS
  // =====================================================

  const handleHotelClick = () => {
    navigate("/hotels");
  };

  // =====================================================
  // EXPERIENCES
  // =====================================================

  const handleExperienceClick = () => {
    navigate("/tours");
  };

  // =====================================================
  // SMART BUDGET
  // =====================================================

  const handleBudgetClick = () => {
    navigate("/budget");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F3E8] text-[#183B32]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-screen overflow-hidden bg-[#123D35]">
        {/* BACKGROUND IMAGE */}

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=2200&q=85')",
          }}
        />

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-[#073A33]/70" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#073A33]/95 via-[#073A33]/70 to-[#073A33]/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#073A33] via-transparent to-black/20" />

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-32 pt-32 sm:px-8">
          <div className="w-full max-w-5xl">
            {/* BADGE */}

            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#D1AA58]/50 bg-black/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-[#E5C873]">✦</span>

              <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#E5C873]">
                AI Travel Planning
              </span>
            </div>

            {/* HEADING */}

            <h1 className="max-w-5xl font-serif text-5xl font-medium leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Your Journey to
              <span className="block italic text-[#E5C873]">
                Paradise Begins Here.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-8 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Tell us where you dream of going. Our intelligent travel planner
              will create a personalized journey around your dates, preferences
              and budget.
            </p>

            {/* =================================================
                AI INPUT
            ================================================= */}

            <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* TEXT AREA */}

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell us about your dream trip..."
                rows={5}
                className="w-full resize-none bg-white px-6 py-6 text-sm text-[#183B32] outline-none placeholder:text-[#183B32]/35 sm:px-8 sm:py-8 sm:text-base"
              />

              {/* INPUT FOOTER */}

              <div className="flex flex-col gap-5 border-t border-[#183B32]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                {/* EXAMPLE */}

                <p className="text-xs leading-5 text-[#527A72]">
                  ✦ Try: "5 days in Dubai for 2 people under ₹1,50,000"
                </p>

                {/* PLAN BUTTON */}

                <button
                  type="button"
                  onClick={handlePlan}
                  disabled={isPlanning || !message.trim()}
                  className="rounded-xl bg-[#183B32] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#28594D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlanning ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873] [animation-delay:300ms]" />
                      <span>Planning...</span>
                    </span>
                  ) : (
                    "Plan My Journey →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            STEPS
        ===================================================== */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#123D35]/65 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
            <Step number="01" text="Tell us your dream" />

            <Step number="02" text="AI builds your plan" />

            <Step number="03" text="Review your journey" />

            <Step number="04" text="Travel your way" />
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Travel differently
            </p>

            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight text-[#183B32] sm:text-5xl">
              Every journey deserves
              <span className="italic"> its own story.</span>
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-8 text-[#183B32]/60 sm:text-base">
            WAY TO PARADISE TRAVELS combines intelligent planning, travel
            information and smart budgeting to help you create a journey that
            feels truly yours.
          </p>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="bg-[#EDE6D5] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
              Your journey, simplified
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#183B32] sm:text-5xl">
              Everything you need for paradise
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* FLIGHTS */}

            <ServiceCard
              icon="✈"
              title="Flights"
              text="Find suitable flight options around your travel dates and budget."
              onClick={handleFlightClick}
            />

            {/* HOTELS */}

            <ServiceCard
              icon="⌂"
              title="Hotels"
              text="Discover stays that fit your destination, preferences and budget."
              onClick={handleHotelClick}
            />

            {/* EXPERIENCES */}

            <ServiceCard
              icon="◎"
              title="Experiences"
              text="Explore attractions, restaurants and memorable local experiences."
              onClick={handleExperienceClick}
            />

            {/* SMART BUDGET */}

            <ServiceCard
              icon="₹"
              title="Smart Budget"
              text="Track estimated trip costs category by category."
              onClick={handleBudgetClick}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#123D35] px-5 py-24 text-center text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
            Ready to explore?
          </p>

          <h2 className="mt-5 font-serif text-4xl sm:text-6xl">
            Discover Your Paradise.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/55">
            Tell our AI travel planner what you have in mind and let us create
            your personalized journey.
          </p>

          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="mt-8 inline-block bg-[#D1AA58] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#183B32] transition hover:bg-[#E5C873]"
          >
            Start Planning →
          </button>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#102F29] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 sm:flex-row sm:px-8">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-wide">
              WAY TO PARADISE
            </h3>

            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/40">
              Travels • Explore • Remember
            </p>
          </div>

          <p className="self-center text-xs text-white/35">
            Your Journey to Paradise Begins Here.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =====================================================
   STEP
===================================================== */

function Step({ number, text }) {
  return (
    <div className="border-r border-white/10 px-4 py-5 last:border-r-0 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[#E5C873]">{number}</span>

        <span className="text-xs text-white/50">{text}</span>
      </div>
    </div>
  );
}

/* =====================================================
   SERVICE CARD
===================================================== */

function ServiceCard({ icon, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer rounded-xl bg-white p-7 text-left transition duration-500 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E8D5] text-lg text-[#B4883D] transition duration-500 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mt-6 font-serif text-2xl font-bold text-[#183B32]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#183B32]/50">{text}</p>

      <span className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.15em] text-[#B4883D]">
        {title === "Flights" || title === "Hotels" ? "Search →" : "Explore →"}
      </span>
    </button>
  );
}

export default Home;
