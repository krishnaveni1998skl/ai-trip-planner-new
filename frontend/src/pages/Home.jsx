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

      // Send the complete message to PlanTrip.jsx
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

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 sm:px-8">
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
      </section>
    </main>
  );
}

export default Home;
