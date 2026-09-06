import React from "react";

const TripBudget = ({ tripData, tripResult }) => {
  const budget = Number(tripData?.budget || 0);
  const currency = tripData?.currency || "INR";

  const result = tripResult?.budget || tripResult?.trip_plan?.budget || null;

  const breakdown = result?.breakdown || {};

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Finance
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Budget
        </h2>

        <p className="mt-2 text-gray-600">
          Your estimated trip budget breakdown
        </p>
      </div>

      {/* Total Budget */}

      <div className="rounded-2xl bg-[#24382c] p-6 text-white shadow-sm">
        <p className="text-sm text-[#d9c9a5]">Total Trip Budget</p>

        <h3 className="mt-2 text-4xl font-bold">
          {currency} {budget.toLocaleString()}
        </h3>

        {tripData?.travelers && (
          <p className="mt-2 text-sm text-gray-300">
            {tripData.travelers} traveler
            {tripData.travelers > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Breakdown */}

      {Object.keys(breakdown).length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(breakdown).map(([category, amount]) => (
            <div
              key={category}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8b7442]">
                {category.replace(/_/g, " ")}
              </p>

              <p className="mt-3 text-2xl font-bold text-[#24382c]">
                {currency} {Number(amount || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BudgetCard
            title="Flights"
            amount={budget * 0.35}
            currency={currency}
          />

          <BudgetCard
            title="Hotels"
            amount={budget * 0.3}
            currency={currency}
          />

          <BudgetCard title="Food" amount={budget * 0.15} currency={currency} />

          <BudgetCard
            title="Transport"
            amount={budget * 0.1}
            currency={currency}
          />

          <BudgetCard
            title="Activities"
            amount={budget * 0.07}
            currency={currency}
          />

          <BudgetCard
            title="Emergency / Other"
            amount={budget * 0.03}
            currency={currency}
          />
        </div>
      )}

      {/* Remaining */}

      {result?.remaining !== undefined && (
        <div className="rounded-2xl border border-[#d9c9a5] bg-[#eee6d4] p-5">
          <p className="text-sm text-gray-600">Remaining Budget</p>

          <p className="mt-1 text-2xl font-bold text-[#24382c]">
            {currency} {Number(result.remaining).toLocaleString()}
          </p>
        </div>
      )}
    </section>
  );
};

function BudgetCard({ title, amount, currency }) {
  return (
    <div className="rounded-2xl border border-[#d9c9a5] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b7442]">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-[#24382c]">
        {currency} {Math.round(amount).toLocaleString()}
      </p>
    </div>
  );
}

export default TripBudget;
