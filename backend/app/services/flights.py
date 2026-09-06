import os
import httpx
from dotenv import load_dotenv

from app.utils.api_helpers import safe_get

load_dotenv()


# =========================================================
# CITY → IATA CODE
# =========================================================

CITY_IATA = {
    "chennai": "MAA",
    "dubai": "DXB",
    "paris": "PAR",
    "london": "LON",
    "singapore": "SIN",
    "bangkok": "BKK",
    "bali": "DPS",
    "maldives": "MLE",
    "japan": "TYO",
    "delhi": "DEL",
    "mumbai": "BOM",
    "kerala": "COK",
    "rajasthan": "JAI",
    "switzerland": "ZRH",
    "canada": "YTO",
    "italy": "ROM",
}


def normalize_city(city: str) -> str:
    return CITY_IATA.get(
        city.strip().lower(),
        city.strip().upper(),
    )


# =========================================================
# SERPAPI GOOGLE FLIGHTS
# =========================================================

async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
):

    # =====================================================
    # CHECK API KEY
    # =====================================================

    api_key = os.getenv("SERPAPI_API_KEY")

    if not api_key:
        return {
            "success": False,
            "flights": [],
            "error_type": "configuration_error",
            "message": "Flight API is not configured.",
            "is_live": False,
        }

    origin_code = normalize_city(origin)
    destination_code = normalize_city(destination)

    print(
        f"SerpApi Flight Search: "
        f"{origin} ({origin_code}) "
        f"-> "
        f"{destination} ({destination_code}) "
        f"on {departure_date}"
    )

    # =====================================================
    # GOOGLE FLIGHTS API
    # =====================================================

    url = "https://serpapi.com/search"

    params = {
        "engine": "google_flights",
        "api_key": api_key,

        # Route
        "departure_id": origin_code,
        "arrival_id": destination_code,

        # Exact travel date
        "outbound_date": departure_date,

        # One-way
        "type": "2",

        # Passenger count
        "adults": adults,

        # Economy
        "travel_class": "1",

        # India + English
        "gl": "in",
        "hl": "en",

        # Currency
        "currency": "INR",

        # More complete Google Flights results
        "deep_search": "true",
    }

    # =====================================================
    # SAFE API REQUEST
    # =====================================================

    result = await safe_get(
        url=url,
        params=params,
        timeout=60,
        retries=1,
    )

    # =====================================================
    # HANDLE API ERROR
    # =====================================================

    if not result.get("success"):

        error_type = result.get(
            "error_type",
            "unknown",
        )

        message = result.get(
            "message",
            "Flight service unavailable",
        )

        print(
            f"Flight API error: "
            f"{error_type} - {message}"
        )

        return {
            "success": False,
            "flights": [],
            "error_type": error_type,
            "message": message,
            "is_live": False,
        }

    # =====================================================
    # READ RESPONSE
    # =====================================================

    data = result.get("data", {})

    # =====================================================
    # CHECK SERPAPI ERROR
    # =====================================================

    if data.get("error"):

        message = data.get(
            "error",
            "SerpApi flight search failed",
        )

        print(
            f"SerpApi error: {message}"
        )

        return {
            "success": False,
            "flights": [],
            "error_type": "serpapi_error",
            "message": message,
            "is_live": False,
        }

    # =====================================================
    # READ FLIGHT RESULTS
    # =====================================================

    raw_flights = []

    raw_flights.extend(
        data.get("best_flights", [])
    )

    raw_flights.extend(
        data.get("other_flights", [])
    )

    print(
        f"SerpApi results found: "
        f"{len(raw_flights)}"
    )

    # =====================================================
    # NO FLIGHTS FOUND
    # =====================================================

    if not raw_flights:

        return {
            "success": True,
            "flights": [],
            "error_type": "no_results",
            "message": (
                "No flights found for the "
                "selected route and date."
            ),
            "is_live": True,
        }

    flights = []

    # =====================================================
    # CONVERT SERPAPI RESPONSE
    # TO OUR FRONTEND FORMAT
    # =====================================================

    for item in raw_flights:

        segments = item.get(
            "flights",
            []
        )

        if not segments:
            continue

        first_segment = segments[0]
        last_segment = segments[-1]

        departure_airport = first_segment.get(
            "departure_airport",
            {}
        )

        arrival_airport = last_segment.get(
            "arrival_airport",
            {}
        )

        airline = first_segment.get(
            "airline"
        )

        flight_number = first_segment.get(
            "flight_number"
        )

        departure_time = departure_airport.get(
            "time"
        )

        arrival_time = arrival_airport.get(
            "time"
        )

        transfers = max(
            len(segments) - 1,
            0
        )

        flights.append(
            {
                "airline": airline,

                "flight_number": flight_number,

                "origin": departure_airport.get(
                    "id",
                    origin_code,
                ),

                "destination": arrival_airport.get(
                    "id",
                    destination_code,
                ),

                "departure_at": departure_time,

                "arrival_at": arrival_time,

                "price": item.get(
                    "price"
                ),

                "currency": "INR",

                "transfers": transfers,

                "duration": item.get(
                    "total_duration"
                ),

                "link": None,

                "is_fallback": False,

                "searched_date": departure_date,

                "actual_departure_date": departure_date,
            }
        )

    # =====================================================
    # SORT BY PRICE
    # =====================================================

    flights.sort(
        key=lambda x: (
            x["price"]
            if x["price"] is not None
            else float("inf")
        )
    )

    return {
        "success": True,
        "flights": flights[:10],
        "error_type": None,
        "message": "Flights fetched successfully",
        "is_live": True,
    }