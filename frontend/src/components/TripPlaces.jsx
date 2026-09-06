import React from "react";

const TripPlaces = ({ tripData, tripResult }) => {
  const places =
    tripResult?.places ||
    tripResult?.attractions ||
    tripResult?.trip_plan?.places ||
    tripResult?.trip_plan?.attractions ||
    [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Explore
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Places
        </h2>

        <p className="mt-2 text-gray-600">Attractions and places to explore</p>
      </div>

      {Array.isArray(places) && places.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {places.map((place, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a08448]">
                    Attraction
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24382c]">
                    {place.name ||
                      place.place_name ||
                      place.attraction_name ||
                      "Place to Visit"}
                  </h3>
                </div>

                <span className="text-3xl">📍</span>
              </div>

              {place.location && (
                <p className="mt-3 text-sm text-gray-600">
                  📍 {place.location}
                </p>
              )}

              {place.address && (
                <p className="mt-2 text-sm text-gray-500">{place.address}</p>
              )}

              {place.category && (
                <div className="mt-4">
                  <span className="rounded-full bg-[#eee6d4] px-3 py-1 text-xs font-medium text-[#35463b]">
                    {place.category}
                  </span>
                </div>
              )}

              {place.rating && (
                <p className="mt-4 text-sm text-gray-600">⭐ {place.rating}</p>
              )}

              {place.description && (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {place.description}
                </p>
              )}

              {place.estimated_cost && (
                <p className="mt-4 text-sm font-medium text-[#24382c]">
                  Estimated Cost: {tripData?.currency || "INR"}{" "}
                  {Number(place.estimated_cost).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#d9c9a5] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">📍</div>

          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#24382c]">
            Places & Attractions
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Places and attractions will appear here once the places API is
            connected.
          </p>

          {tripData?.destination && (
            <div className="mt-5 inline-flex rounded-xl bg-[#f5f0e4] px-5 py-3 text-sm font-medium text-[#35463b]">
              📍 {tripData.destination}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TripPlaces;
