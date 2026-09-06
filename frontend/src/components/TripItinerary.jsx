import React from "react";

const TripItinerary = ({ tripData, tripResult }) => {
  const days = Number(tripData?.duration_days || 0);

  
  const itinerary =
    tripResult?.itinerary || tripResult?.trip_plan?.itinerary || [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Your Journey
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Itinerary
        </h2>

        <p className="mt-2 text-gray-600">
          {days > 0
            ? `${days}-day personalized itinerary`
            : "Your day-by-day itinerary"}
        </p>
      </div>

      {/* Structured itinerary */}
      {Array.isArray(itinerary) && itinerary.length > 0 ? (
        <div className="space-y-5">
          {itinerary.map((day, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#24382c] px-4 py-2 text-sm font-semibold text-white">
                  Day {day.day || index + 1}
                </span>

                <h3 className="font-serif text-xl font-semibold text-[#24382c]">
                  {day.title || `Day ${index + 1}`}
                </h3>
              </div>

              {day.activities && (
                <div className="mt-5 space-y-3">
                  {day.activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="rounded-xl bg-[#f5f0e4] p-4"
                    >
                      <p className="font-medium text-[#35463b]">
                        {typeof activity === "string"
                          ? activity
                          : activity.name || activity.activity}
                      </p>

                      {typeof activity === "object" && activity.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Temporary fallback */
        <div className="space-y-5">
          {Array.from({ length: days || 1 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-[#24382c] px-4 py-2 text-sm font-semibold text-white">
                  Day {index + 1}
                </span>

                <h3 className="font-serif text-xl font-semibold text-[#24382c]">
                  Day {index + 1} Adventure
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-[#f5f0e4] p-4">
                  <p className="text-xs font-semibold uppercase text-[#a08448]">
                    Morning
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Activities will be added from the AI travel plan.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f5f0e4] p-4">
                  <p className="text-xs font-semibold uppercase text-[#a08448]">
                    Afternoon
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Places and attractions will appear here.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f5f0e4] p-4">
                  <p className="text-xs font-semibold uppercase text-[#a08448]">
                    Evening
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Evening activities and food recommendations will appear
                    here.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TripItinerary;
