import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Budget() {
  const navigate = useNavigate();

  // ============================================================
  // DESTINATION + TRAVELERS + BUDGET
  // ============================================================

  const [destination, setDestination] = useState("Dubai");

  const [travelers, setTravelers] = useState(2);

  const [budget, setBudget] = useState("");

  // ============================================================
  // EXPENSES
  // ============================================================

  const [expenses, setExpenses] = useState({
    accommodation: 0,
    transportation: 0,
    food: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  });

  const [saved, setSaved] = useState(false);

  // ============================================================
  // DESTINATION CHANGE
  // ============================================================

  const handleDestinationChange = (event) => {
    setDestination(event.target.value);
    setSaved(false);
  };

  // ============================================================
  // TRAVELERS CHANGE
  // ============================================================

  const handleTravelersChange = (event) => {
    const value = event.target.value;

    setTravelers(value === "" ? "" : Number(value));

    setSaved(false);
  };

  // ============================================================
  // BUDGET CHANGE
  // ============================================================

  const handleBudgetChange = (event) => {
    const value = event.target.value.replace(/[^\d]/g, "");

    setBudget(value === "" ? "" : Number(value));

    setSaved(false);
  };

  // ============================================================
  // EXPENSE CHANGE
  // ============================================================

  const handleExpenseChange = (category, value) => {
    const cleanValue = value.replace(/[^\d]/g, "");

    setExpenses((previous) => ({
      ...previous,

      [category]: cleanValue === "" ? 0 : Number(cleanValue),
    }));

    setSaved(false);
  };

  // ============================================================
  // TOTAL ESTIMATED
  // ============================================================

  const totalEstimated = useMemo(() => {
    return Object.values(expenses).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    );
  }, [expenses]);

  // ============================================================
  // REMAINING
  // ============================================================

  const numericBudget = Number(budget) || 0;

  const remaining = numericBudget - totalEstimated;

  // ============================================================
  // OVER BUDGET
  // ============================================================

  const isOverBudget = totalEstimated > numericBudget && numericBudget > 0;

  const overAmount = isOverBudget ? totalEstimated - numericBudget : 0;

  // ============================================================
  // PERCENTAGE
  // ============================================================

  const percentage =
    numericBudget > 0 ? Math.round((totalEstimated / numericBudget) * 100) : 0;

  const progressWidth =
    numericBudget > 0
      ? Math.min((totalEstimated / numericBudget) * 100, 100)
      : 0;

  // ============================================================
  // SAVE BUDGET
  // ============================================================

  const handleSaveBudget = () => {
    if (!destination) {
      alert("Please select a destination.");
      return;
    }

    if (!numericBudget || numericBudget <= 0) {
      alert("Please enter a valid total budget.");
      return;
    }

    if (!travelers || Number(travelers) < 1) {
      alert("Travelers must be at least 1.");
      return;
    }

    const budgetData = {
      destination,
      travelers: Number(travelers),
      budget: numericBudget,
      expenses,
      totalEstimated,
      remaining,
      isOverBudget,
      overAmount,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("wayToParadiseBudget", JSON.stringify(budgetData));

    setSaved(true);
  };

  // ============================================================
  // PLAN MY TRIP
  // ============================================================

  const handlePlanTrip = () => {
    if (!destination) {
      alert("Please select a destination.");
      return;
    }

    if (!numericBudget || numericBudget <= 0) {
      alert("Please enter your total budget first.");
      return;
    }

    navigate("/plan", {
      state: {
        destination: destination,

        budget: numericBudget,

        travelers: Number(travelers) || 2,

        travel_style: destination === "Paris" ? "Cultural" : "Adventure",

        interests:
          destination === "Paris"
            ? ["Culture", "History", "Food"]
            : ["Adventure", "Shopping"],

        message:
          `Plan a trip to ${destination} ` +
          `for ${travelers} travelers ` +
          `with a budget of ₹${numericBudget}.`,
      },
    });
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setDestination("Dubai");
    setTravelers(2);
    setBudget("");

    setExpenses({
      accommodation: 0,
      transportation: 0,
      food: 0,
      activities: 0,
      shopping: 0,
      other: 0,
    });

    setSaved(false);
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  // ============================================================
  // EXPENSE FIELDS
  // ============================================================

  const expenseFields = [
    {
      key: "accommodation",
      label: "Accommodation",
      icon: "⌂",
    },
    {
      key: "transportation",
      label: "Transportation",
      icon: "✈",
    },
    {
      key: "food",
      label: "Food",
      icon: "◉",
    },
    {
      key: "activities",
      label: "Activities",
      icon: "✦",
    },
    {
      key: "shopping",
      label: "Shopping",
      icon: "◇",
    },
    {
      key: "other",
      label: "Other",
      icon: "＋",
    },
  ];

  // ============================================================
  // SUGGESTIONS
  // ============================================================

  const reductionSuggestions = [];

  if (expenses.accommodation > 0) {
    reductionSuggestions.push(
      "Consider a more affordable hotel or accommodation.",
    );
  }

  if (expenses.transportation > 0) {
    reductionSuggestions.push("Use public transportation where practical.");
  }

  if (expenses.food > 0) {
    reductionSuggestions.push(
      "Mix restaurants with local and budget-friendly food.",
    );
  }

  if (expenses.activities > 0) {
    reductionSuggestions.push("Choose free or lower-cost attractions.");
  }

  if (expenses.shopping > 0) {
    reductionSuggestions.push("Reduce your shopping allocation.");
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-[#F7F3E8] px-4 pb-20 pt-28 text-[#183B32] sm:px-6 lg:px-8">
      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-[#123D35] px-7 py-12 text-white sm:px-10 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            ✦ Smart Travel Budget
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">
            Plan your trip
            <span className="block italic text-[#E5C873]">
              without overspending.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Set your travel budget and estimate your expenses before creating
            your personalized journey.
          </p>
        </div>
      </section>

      {/* ======================================================
          TRIP DETAILS
      ======================================================= */}

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
          Trip Details
        </p>

        <h2 className="mt-3 font-serif text-4xl">Start with your budget</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* DESTINATION */}

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#68817B]">
              Destination
            </label>

            <select
              value={destination}
              onChange={handleDestinationChange}
              className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none transition focus:border-[#B4883D]"
            >
              <option value="Dubai">Dubai</option>

              <option value="Paris">Paris</option>
            </select>
          </div>

          {/* TRAVELERS */}

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#68817B]">
              Travelers
            </label>

            <input
              type="number"
              min="1"
              value={travelers}
              onChange={handleTravelersChange}
              className="mt-3 w-full rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 outline-none transition focus:border-[#B4883D]"
            />
          </div>

          {/* TOTAL BUDGET */}

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#68817B]">
              Total Budget
            </label>

            <div className="mt-3 flex items-center rounded-xl border border-[#183B32]/15 bg-[#FCFBF7] px-5">
              <span className="text-[#B4883D]">₹</span>

              <input
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={handleBudgetChange}
                placeholder="Example: 150000"
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          SUMMARY CARDS
      ======================================================= */}

      <section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
        <SummaryCard
          label="Total Budget"
          value={formatCurrency(numericBudget)}
        />

        <SummaryCard
          label="Estimated Cost"
          value={formatCurrency(totalEstimated)}
          danger={isOverBudget}
        />

        <SummaryCard
          label={isOverBudget ? "Over Budget" : "Remaining"}
          value={
            isOverBudget
              ? formatCurrency(overAmount)
              : formatCurrency(remaining)
          }
          danger={isOverBudget}
        />
      </section>

      {/* ======================================================
          BUDGET USAGE
      ======================================================= */}

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl bg-[#123D35] p-7 text-white sm:p-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E5C873]">
              Budget Usage
            </p>

            <h2 className="mt-3 font-serif text-3xl">{percentage}% used</h2>
          </div>

          {isOverBudget ? (
            <div className="rounded-full bg-red-500/15 px-5 py-2 text-sm font-bold text-red-300">
              ⚠ Over Budget
            </div>
          ) : (
            <div className="rounded-full bg-[#E5C873]/10 px-5 py-2 text-sm font-bold text-[#E5C873]">
              ✓ Within Budget
            </div>
          )}
        </div>

        <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? "bg-red-500" : "bg-[#E5C873]"
            }`}
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>

        <div className="mt-5 flex justify-between text-xs text-white/50">
          <span>Estimated: {formatCurrency(totalEstimated)}</span>

          <span>Budget: {formatCurrency(numericBudget)}</span>
        </div>
      </section>

      {/* ======================================================
          EXPENSE BREAKDOWN
      ======================================================= */}

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
          Expense Breakdown
        </p>

        <h2 className="mt-3 font-serif text-4xl">Where will you spend?</h2>

        <p className="mt-3 text-sm leading-7 text-[#78908B]">
          Enter an estimated amount for each category.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {expenseFields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-[#E0DDD4] bg-[#FCFBF7] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E8D5] text-[#B4883D]">
                  {field.icon}
                </div>

                <label className="text-sm font-semibold">{field.label}</label>
              </div>

              <div className="mt-4 flex items-center rounded-xl border border-[#183B32]/10 bg-white px-4">
                <span className="text-[#B4883D]">₹</span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={expenses[field.key] === 0 ? "" : expenses[field.key]}
                  onChange={(event) =>
                    handleExpenseChange(field.key, event.target.value)
                  }
                  placeholder="0"
                  className="w-full bg-transparent px-3 py-4 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================
          SUMMARY
      ======================================================= */}

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl bg-[#EDE6D5] p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B4883D]">
          Budget Summary
        </p>

        <h2 className="mt-3 font-serif text-4xl">
          {destination} spending plan
        </h2>

        <div className="mt-8 space-y-4">
          {expenseFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between border-b border-[#D8D0BD] pb-4"
            >
              <span className="text-sm text-[#68817B]">{field.label}</span>

              <span className="font-semibold">
                {formatCurrency(expenses[field.key])}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span className="font-bold">Total Estimated</span>

          <span
            className={`font-serif text-3xl font-bold ${
              isOverBudget ? "text-red-600" : "text-[#B4883D]"
            }`}
          >
            {formatCurrency(totalEstimated)}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-bold">Total Budget</span>

          <span className="font-semibold">{formatCurrency(numericBudget)}</span>
        </div>

        <div
          className={`mt-6 rounded-2xl p-5 ${
            isOverBudget ? "bg-red-50" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">
              {isOverBudget ? "Over Budget" : "Remaining"}
            </span>

            <span
              className={`font-serif text-2xl font-bold ${
                isOverBudget ? "text-red-600" : "text-[#183B32]"
              }`}
            >
              {isOverBudget
                ? `-${formatCurrency(overAmount)}`
                : formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================
          OVER BUDGET ALERT
      ======================================================= */}

      {isOverBudget && (
        <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-red-200 bg-red-50 p-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            ⚠ Budget Alert
          </p>

          <h3 className="mt-3 font-serif text-3xl text-[#183B32]">
            Your estimated cost is too high.
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#55706A]">
            You need to reduce <strong>{formatCurrency(overAmount)}</strong> to
            stay within your budget.
          </p>

          {reductionSuggestions.length > 0 && (
            <div className="mt-6 space-y-3">
              {reductionSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white p-4 text-sm text-[#55706A]"
                >
                  <span className="mr-2 font-bold text-[#B4883D]">
                    {index + 1}.
                  </span>

                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ======================================================
          ACTION BUTTONS
      ======================================================= */}

      <section className="mx-auto mt-8 max-w-6xl rounded-3xl bg-[#123D35] p-7 text-center text-white sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
          {destination}
        </p>

        <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
          Ready to plan your journey?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60">
          Your selected destination and budget will be transferred to the AI
          travel planner.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          {/* SAVE */}

          <button
            type="button"
            onClick={handleSaveBudget}
            className="rounded-full border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#E5C873] hover:text-[#E5C873]"
          >
            {saved ? "✓ Budget Saved" : "Save Budget"}
          </button>

          {/* PLAN */}

          <button
            type="button"
            onClick={handlePlanTrip}
            className="rounded-full bg-[#E5C873] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#183B32] transition hover:bg-[#D4AA55]"
          >
            Plan My Trip →
          </button>
        </div>

        {/* RESET */}

        <button
          type="button"
          onClick={handleReset}
          className="mt-5 text-xs font-semibold text-white/45 underline-offset-4 transition hover:text-white hover:underline"
        >
          Reset Budget
        </button>
      </section>

      {/* ======================================================
          TIPS
      ======================================================= */}

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-3">
        <TipCard
          icon="✦"
          title="Track Everything"
          text="Include accommodation, transportation, food, activities and shopping."
        />

        <TipCard
          icon="◇"
          title="Keep a Buffer"
          text="Leave some money available for unexpected travel expenses."
        />

        <TipCard
          icon="₹"
          title="Travel Smarter"
          text="Check your estimated total before generating your final AI travel plan."
        />
      </section>
    </main>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ label, value, danger = false }) {
  return (
    <div className="rounded-3xl border border-[#E0DDD4] bg-white p-7 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#82958F]">
        {label}
      </p>

      <p
        className={`mt-5 font-serif text-3xl font-bold sm:text-4xl ${
          danger ? "text-red-600" : "text-[#B4883D]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// TIP CARD
// ============================================================

function TipCard({ icon, title, text }) {
  return (
    <div className="rounded-3xl bg-[#F3ECDD] p-7">
      <span className="text-2xl text-[#C9A45C]">{icon}</span>

      <h3 className="mt-5 font-serif text-2xl">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-[#78908B]">{text}</p>
    </div>
  );
}

export default Budget;
