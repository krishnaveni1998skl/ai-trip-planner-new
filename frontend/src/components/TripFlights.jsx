import React from "react";

const TripFlights = ({ tripData, tripResult }) => {
  // ------------------------------------------------------------
  // GET FLIGHT DATA FROM BACKEND
  // ------------------------------------------------------------

  const flights =
    tripResult?.flights ||
    tripResult?.trip_plan?.flights ||
    tripResult?.results ||
    [];

  const isArray = Array.isArray(flights);

  // ------------------------------------------------------------
  // TRIP DETAILS FROM CHAT CONTEXT
  // ------------------------------------------------------------

  const origin = tripData?.departure_city || "N/A";
  const destination = tripData?.destination || "N/A";
  const startDate = tripData?.start_date || "";
  const endDate = tripData?.end_date || "";
  const travelers = Number(tripData?.travelers) || 1;

  // ------------------------------------------------------------
  // FORMAT DATE
  // ------------------------------------------------------------

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ------------------------------------------------------------
  // FORMAT TIME
  // ------------------------------------------------------------

  const formatTime = (dateTime) => {
    if (!dateTime) return "N/A";

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return dateTime;
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // ------------------------------------------------------------
  // FORMAT CURRENCY
  // ------------------------------------------------------------

  const formatPrice = (price, currency = "INR") => {
    if (price === null || price === undefined || price === "") {
      return "Price unavailable";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return `${currency} ${price}`;
    }

    return `${currency.toUpperCase()} ${numericPrice.toLocaleString("en-IN")}`;
  };

  // ------------------------------------------------------------
  // FLIGHT DURATION
  // ------------------------------------------------------------

  const getDuration = (departure, arrival) => {
    if (!departure || !arrival) return null;

    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);

    if (
      Number.isNaN(departureTime.getTime()) ||
      Number.isNaN(arrivalTime.getTime())
    ) {
      return null;
    }

    const difference = arrivalTime.getTime() - departureTime.getTime();

    if (difference <= 0) return null;

    const minutes = Math.floor(difference / 60000);

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  // ------------------------------------------------------------
  // TRANSFER TEXT
  // ------------------------------------------------------------

  const getTransferText = (transfers) => {
    if (transfers === null || transfers === undefined) {
      return "Flight";
    }

    const count = Number(transfers);

    if (count === 0) {
      return "Direct";
    }

    if (count === 1) {
      return "1 Stop";
    }

    return `${count} Stops`;
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <section className="space-y-6">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a08448]">
          Travel
        </p>

        <h2 className="mt-1 font-serif text-4xl font-semibold text-[#24382c]">
          Flights
        </h2>

        <p className="mt-2 text-gray-600">Flight options for your journey</p>
      </div>

      {/* ======================================================
          SEARCH SUMMARY
      ======================================================= */}

      <div className="rounded-2xl border border-[#d9c9a5] bg-[#f5f0e4] p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">From</p>

            <p className="mt-1 font-semibold text-[#24382c]">{origin}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">To</p>

            <p className="mt-1 font-semibold text-[#24382c]">{destination}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Travel Date</p>

            <p className="mt-1 font-semibold text-[#24382c]">
              {formatDate(startDate)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Travelers</p>

            <p className="mt-1 font-semibold text-[#24382c]">{travelers}</p>
          </div>
        </div>

        {endDate && (
          <div className="mt-4 border-t border-[#d9c9a5] pt-4">
            <p className="text-xs text-gray-500">Return Date</p>

            <p className="mt-1 font-semibold text-[#24382c]">
              {formatDate(endDate)}
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          API SOURCE NOTICE
      ======================================================= */}

      <div className="rounded-xl border border-[#d9c9a5] bg-white px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">✈️</span>

          <div>
            <p className="text-sm font-semibold text-[#24382c]">
              Flight price information
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Results are provided through Travelpayouts / Aviasales Data API.
            </p>

            <p className="mt-1 text-xs font-medium text-[#a08448]">
              Cached flight data — not guaranteed live availability.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          FLIGHT RESULTS
      ======================================================= */}

      {isArray && flights.length > 0 ? (
        <div className="space-y-5">
          {flights.map((flight, index) => {
            const departureAt = flight.departure_at || flight.departure || null;

            const arrivalAt = flight.arrival_at || flight.arrival || null;

            const price = flight.price_per_person ?? flight.price ?? null;

            const totalPrice =
              flight.total_price ??
              (price !== null ? Number(price) * travelers : null);

            const currency = flight.currency || tripData?.currency || "INR";

            const airline = flight.airline || flight.name || "Flight";

            const transfers =
              flight.transfers ?? flight.number_of_changes ?? null;

            const duration =
              flight.duration || getDuration(departureAt, arrivalAt);

            return (
              <div
                key={`${airline}-${index}`}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid gap-7 md:grid-cols-[1fr_1.5fr_auto] md:items-center">
                  {/* ==================================================
                      AIRLINE
                  ================================================== */}

                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E8D5] text-[#B4883D]">
                      ✈
                    </div>

                    <h3 className="mt-4 font-serif text-xl font-bold text-[#24382c]">
                      {airline}
                    </h3>

                    <p className="mt-1 text-xs text-[#B4883D]">
                      {getTransferText(transfers)}
                    </p>

                    {flight.flight_number && (
                      <p className="mt-1 text-xs text-gray-400">
                        Flight {flight.flight_number}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      TIME
                  ================================================== */}

                  <div className="flex items-center gap-4 sm:gap-5">
                    <div>
                      <p className="font-serif text-2xl text-[#24382c]">
                        {formatTime(departureAt)}
                      </p>

                      <p className="text-xs text-[#183B32]/45">
                        {flight.origin || origin}
                      </p>
                    </div>

                    <div className="flex-1 text-center">
                      {duration && (
                        <p className="text-xs text-[#183B32]/40">{duration}</p>
                      )}

                      <div className="mt-2 h-px bg-[#183B32]/15" />

                      <p className="mt-2 text-[10px] text-[#B4883D]">
                        {getTransferText(transfers)}
                      </p>
                    </div>

                    <div>
                      <p className="font-serif text-2xl text-[#24382c]">
                        {formatTime(arrivalAt)}
                      </p>

                      <p className="text-xs text-[#183B32]/45">
                        {flight.destination || destination}
                      </p>
                    </div>
                  </div>

                  {/* ==================================================
                      PRICE
                  ================================================== */}

                  <div className="text-left md:text-right">
                    <p className="text-xs text-[#183B32]/40">
                      {formatPrice(price, currency)} per traveler
                    </p>

                    {totalPrice !== null && (
                      <p className="mt-2 font-serif text-2xl font-bold text-[#24382c]">
                        {formatPrice(totalPrice, currency)}
                      </p>
                    )}

                    <p className="mt-1 text-[10px] text-[#183B32]/40">
                      Total for {travelers} traveler
                      {travelers !== 1 ? "s" : ""}
                    </p>

                    <p className="mt-1 text-[10px] text-[#B4883D]">
                      {formatDate(startDate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================
            NO RESULTS
        ======================================================= */

        <div className="rounded-2xl border border-[#d9c9a5] bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">✈️</div>

          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#24382c]">
            No Flight Results
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            No flight price data was found for this route and travel date.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#f5f0e4] px-5 py-3 text-sm">
            <span>{origin}</span>

            <span>→</span>

            <span>{destination}</span>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Travel date: {formatDate(startDate)}
          </p>
        </div>
      )}
    </section>
  );
};

export default TripFlights;
