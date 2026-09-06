import React from "react";

const TripHotels = ({ tripData, tripResult }) => {
  const hotels = tripResult?.hotels || tripResult?.trip_plan?.hotels || [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Stay
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Hotels
        </h2>

        <p className="mt-2 text-gray-600">
          Accommodation options for your trip
        </p>
      </div>

      {Array.isArray(hotels) && hotels.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#d9c9a5] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a08448]">
                    Accommodation
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24382c]">
                    {hotel.name || hotel.hotel_name || "Hotel"}
                  </h3>
                </div>

                <span className="text-3xl">🏨</span>
              </div>

              {hotel.location && (
                <p className="mt-3 text-sm text-gray-600">
                  📍 {hotel.location}
                </p>
              )}

              {hotel.address && (
                <p className="mt-2 text-sm text-gray-500">{hotel.address}</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f5f0e4] p-3">
                  <p className="text-xs text-gray-500">Check-in</p>

                  <p className="mt-1 text-sm font-semibold text-[#24382c]">
                    {hotel.check_in || tripData?.start_date || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f5f0e4] p-3">
                  <p className="text-xs text-gray-500">Check-out</p>

                  <p className="mt-1 text-sm font-semibold text-[#24382c]">
                    {hotel.check_out || tripData?.end_date || "N/A"}
                  </p>
                </div>
              </div>

              {hotel.price && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">Estimated Price</p>

                  <p className="mt-1 text-xl font-bold text-[#24382c]">
                    {hotel.currency || tripData?.currency || "INR"}{" "}
                    {Number(hotel.price).toLocaleString()}
                  </p>
                </div>
              )}

              {hotel.rating && (
                <p className="mt-3 text-sm text-gray-600">⭐ {hotel.rating}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#d9c9a5] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🏨</div>

          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#24382c]">
            Hotel Options
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Live hotel options will appear here once the hotel API is connected.
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

export default TripHotels;
