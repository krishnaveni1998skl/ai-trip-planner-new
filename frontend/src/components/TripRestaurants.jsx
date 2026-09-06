import React from "react";

const TripRestaurants = ({ tripData, tripResult }) => {
  const restaurants =
    tripResult?.restaurants || tripResult?.trip_plan?.restaurants || [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Taste
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Restaurants
        </h2>

        <p className="mt-2 text-gray-600">
          Food and restaurant recommendations for your trip
        </p>
      </div>

      {Array.isArray(restaurants) && restaurants.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a08448]">
                    Restaurant
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24382c]">
                    {restaurant.name ||
                      restaurant.restaurant_name ||
                      "Restaurant"}
                  </h3>
                </div>

                <span className="text-3xl">🍽️</span>
              </div>

              {restaurant.location && (
                <p className="mt-3 text-sm text-gray-600">
                  📍 {restaurant.location}
                </p>
              )}

              {restaurant.address && (
                <p className="mt-2 text-sm text-gray-500">
                  {restaurant.address}
                </p>
              )}

              {restaurant.cuisine && (
                <div className="mt-4">
                  <span className="rounded-full bg-[#eee6d4] px-3 py-1 text-xs font-medium text-[#35463b]">
                    {restaurant.cuisine}
                  </span>
                </div>
              )}

              {restaurant.rating && (
                <p className="mt-4 text-sm text-gray-600">
                  ⭐ {restaurant.rating}
                </p>
              )}

              {restaurant.price_level && (
                <p className="mt-2 text-sm text-gray-600">
                  Price: {restaurant.price_level}
                </p>
              )}

              {restaurant.description && (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {restaurant.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#d9c9a5] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🍽️</div>

          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#24382c]">
            Restaurant Recommendations
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Live restaurant recommendations will appear here once the restaurant
            API is connected.
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

export default TripRestaurants;
