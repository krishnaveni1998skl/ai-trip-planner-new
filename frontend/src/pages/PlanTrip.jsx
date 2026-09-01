import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function PlanTrip() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================================
  // GET DATA FROM OTHER PAGES
  // ==========================================================

  const incomingState = location.state || {};

  // Home sends message
  // Flights sends destination + start_date + travelers
  const incomingMessage = incomingState.message || "";

  // ==========================================================
  // EXTRACT DESTINATION FROM HOME MESSAGE
  // ==========================================================

  const extractDestination = (text) => {
    if (!text) {
      return "";
    }

    const value = text.trim();

    // Example:
    // "5 days in Dubai for 2 people"
    const inMatch = value.match(
      /\bin\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+for\s+|\s+under\s+|\s*$)/i,
    );

    if (inMatch && inMatch[1]) {
      return inMatch[1].trim();
    }

    // Example:
    // "I want to go to Dubai"
    const toMatch = value.match(
      /\bto\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+for\s+|\s+under\s+|\s*$)/i,
    );

    if (toMatch && toMatch[1]) {
      return toMatch[1].trim();
    }

    // If user entered only "Dubai"
    if (
      value.split(/\s+/).length <= 3 &&
      !/\b(days?|people|person|under|budget)\b/i.test(value)
    ) {
      return value;
    }

    return "";
  };

  const initialDestination =
    incomingState.destination || extractDestination(incomingMessage) || "";

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    destination: initialDestination,

    start_date: incomingState.start_date || "",

    end_date: incomingState.end_date || "",

    travelers: incomingState.travelers || 2,

    budget: incomingState.budget || "",

    travel_style: "Adventure",

    interests: [],

    currency: "INR",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // INTERESTS
  // ==========================================================

  const interestsList = [
    "Adventure",
    "Beach",
    "Culture",
    "Food",
    "Shopping",
    "Nature",
    "History",
    "Relaxation",
  ];

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ==========================================================
  // INTEREST SELECT
  // ==========================================================

  const handleInterest = (interest) => {
    setForm((previous) => {
      const exists = previous.interests.includes(interest);

      return {
        ...previous,

        interests: exists
          ? previous.interests.filter((item) => item !== interest)
          : [...previous.interests, interest],
      };
    });

    setError("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!form.destination.trim()) {
      return "Please enter your destination.";
    }

    if (!form.start_date) {
      return "Please select your start date.";
    }

    if (!form.end_date) {
      return "Please select your end date.";
    }

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      return "End date must be after start date.";
    }

    if (!form.travelers || Number(form.travelers) < 1) {
      return "Travelers must be at least 1.";
    }

    if (!form.budget || Number(form.budget) <= 0) {
      return "Please enter a valid budget.";
    }

    return "";
  };

  // ==========================================================
  // PLAN TRIP
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/plan-trip`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          destination: form.destination.trim(),

          start_date: form.start_date,

          end_date: form.end_date,

          travelers: Number(form.travelers),

          budget: Number(form.budget),

          travel_style: form.travel_style,

          interests: form.interests,

          currency: form.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let message = "Unable to generate your trip.";

        if (data?.detail?.message) {
          message = data.detail.message;
        } else if (typeof data?.detail === "string") {
          message = data.detail;
        }

        throw new Error(message);
      }

      if (!data.success) {
        throw new Error("Travel plan could not be generated.");
      }

      // ======================================================
      // RESULT PAGE
      // ======================================================

      navigate("/plan-result", {
        state: {
          tripRequest: data.trip_request,
          travelPlan: data.travel_plan,
        },
      });
    } catch (error) {
      console.error("Plan trip error:", error);

      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    setForm({
      destination: "",
      start_date: "",
      end_date: "",
      travelers: 2,
      budget: "",
      travel_style: "Adventure",
      interests: [],
      currency: "INR",
    });

    setError("");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-[#123D35] px-5 pb-20 pt-20 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            ✦ AI Travel Planner
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">
            Plan Your
            <span className="block italic text-[#E5C873]">
              Perfect Journey.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Tell us where you want to go, when you want to travel and what you
            love. Our AI will create a personalized journey for you.
          </p>
        </div>
      </section>

      {/* =====================================================
          FORM
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl sm:p-10"
        >
          {/* DESTINATION */}

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Destination
            </label>

            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Where do you want to go?"
              className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none transition focus:border-[#B4883D]"
            />
          </div>

          {/* DATES */}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
                Start Date
              </label>

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none focus:border-[#B4883D]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
                End Date
              </label>

              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none focus:border-[#B4883D]"
              />
            </div>
          </div>

          {/* TRAVELERS + BUDGET */}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
                Travelers
              </label>

              <input
                type="number"
                name="travelers"
                min="1"
                value={form.travelers}
                onChange={handleChange}
                className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none focus:border-[#B4883D]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
                Total Budget (₹)
              </label>

              <input
                type="number"
                name="budget"
                min="1"
                value={form.budget}
                onChange={handleChange}
                placeholder="Example: 150000"
                className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none focus:border-[#B4883D]"
              />
            </div>
          </div>

          {/* TRAVEL STYLE */}

          <div className="mt-7">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Travel Style
            </label>

            <select
              name="travel_style"
              value={form.travel_style}
              onChange={handleChange}
              className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none focus:border-[#B4883D]"
            >
              <option value="Adventure">Adventure</option>

              <option value="Luxury">Luxury</option>

              <option value="Budget">Budget</option>

              <option value="Relaxation">Relaxation</option>

              <option value="Family">Family</option>

              <option value="Romantic">Romantic</option>

              <option value="Cultural">Cultural</option>
            </select>
          </div>

          {/* INTERESTS */}

          <div className="mt-8">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              What are you interested in?
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              {interestsList.map((interest) => {
                const selected = form.interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterest(interest)}
                    className={`rounded-full border px-5 py-3 text-sm transition ${
                      selected
                        ? "border-[#183B32] bg-[#183B32] text-white"
                        : "border-[#183B32]/15 bg-[#FCFBF7] text-[#183B32] hover:border-[#B4883D]"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <strong>Unable to plan trip:</strong> {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-xl border border-[#183B32]/20 px-7 py-4 text-sm font-semibold transition hover:bg-[#F7F3E8] disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#183B32] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#28594D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873]" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873] [animation-delay:150ms]" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#E5C873] [animation-delay:300ms]" />

                  <span>Creating Your Journey...</span>
                </span>
              ) : (
                <>
                  Plan My Journey
                  <span className="ml-2">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#102F29] py-10 text-center text-white">
        <img
          src="/way-to-paradise-logo.jpg"
          alt="Way To Paradise"
          className="mx-auto h-14 w-14 object-contain"
        />

        <p className="mt-4 font-serif text-xl font-bold tracking-wide">
          WAY TO PARADISE
        </p>

        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>
      </footer>
    </main>
  );
}

export default PlanTrip;
