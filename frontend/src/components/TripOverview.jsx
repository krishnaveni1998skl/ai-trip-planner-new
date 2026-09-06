import React from "react";

const TripOverview = ({ tripData, tripPlan }) => {
  return (
    <section className="space-y-6">
      {/* TITLE */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Your Journey
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Trip Overview
        </h2>

        <p className="mt-2 text-gray-600">
          Your personalized travel plan at a glance.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard icon="📍" label="Destination" value={tripData?.destination} />

        <InfoCard
          icon="🗓️"
          label="Duration"
          value={
            tripData?.duration_days ? `${tripData.duration_days} Days` : ""
          }
        />

        <InfoCard icon="👥" label="Travelers" value={tripData?.travelers} />

        <InfoCard
          icon="💰"
          label="Budget"
          value={
            tripData?.budget
              ? `${tripData.currency || "INR"} ${Number(
                  tripData.budget,
                ).toLocaleString()}`
              : ""
          }
        />

        <InfoCard
          icon="✈️"
          label="Departure"
          value={tripData?.departure_city}
        />

        <InfoCard
          icon="🌴"
          label="Travel Style"
          value={tripData?.travel_style}
        />
      </div>

      {/* DATES */}
      <div className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm">
        <h3 className="font-serif text-2xl font-semibold text-[#24382c]">
          Travel Dates
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-[#f5f0e4] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Start Date
            </p>

            <p className="mt-2 font-semibold text-[#24382c]">
              {tripData?.start_date || "Not selected"}
            </p>
          </div>

          <div className="rounded-xl bg-[#f5f0e4] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">
              End Date
            </p>

            <p className="mt-2 font-semibold text-[#24382c]">
              {tripData?.end_date || "Not selected"}
            </p>
          </div>
        </div>
      </div>

      {/* INTERESTS */}
      <div className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm">
        <h3 className="font-serif text-2xl font-semibold text-[#24382c]">
          Interests
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {tripData?.interests?.length > 0 ? (
            tripData.interests.map((interest, index) => (
              <span
                key={index}
                className="rounded-full bg-[#eee6d4] px-4 py-2 text-sm font-medium text-[#35463b]"
              >
                {interest}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-500">No interests selected yet.</p>
          )}
        </div>
      </div>

      {/* AI SUMMARY */}
      {tripPlan && (
        <div className="rounded-2xl border border-[#d9c9a5] bg-[#eee6d4] p-6">
          <h3 className="font-serif text-2xl font-semibold text-[#24382c]">
            AI Trip Summary
          </h3>

          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#35463b]">
            {typeof tripPlan === "string"
              ? tripPlan
              : tripPlan?.trip_summary ||
                "Your personalized trip summary is ready."}
          </div>
        </div>
      )}
    </section>
  );
};

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#d9c9a5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#8b7442]">
          {label}
        </p>

        <span className="text-xl">{icon}</span>
      </div>

      <p className="mt-3 text-lg font-semibold text-[#24382c]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default TripOverview;
