# ============================================================
# FLIGHT SERVICE - FLIGHTAPI.IO
# ============================================================

import os
from typing import Optional

from dotenv import load_dotenv

from app.utils.api_helpers import safe_get


load_dotenv()


# ============================================================
# CITY → IATA CODE
# ============================================================

CITY_IATA = {
    "chennai": "MAA",
    "dubai": "DXB",
    "paris": "PAR",
    "london": "LON",
    "singapore": "SIN",
    "bangkok": "BKK",
    "bali": "DPS",
    "maldives": "MLE",
    "male": "MLE",
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
    """
    Convert city name to IATA code.

    If the value is already an IATA code,
    it will simply be converted to uppercase.
    """

    return CITY_IATA.get(
        city.strip().lower(),
        city.strip().upper(),
    )


# ============================================================
# FLIGHTAPI.IO
# ============================================================

async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
):
    """
    Search flights using FlightAPI.io.

    Returns normalized flight data compatible with
    the existing Trip Planner frontend and budget system.
    """

    # ========================================================
    # VALIDATION
    # ========================================================

    if not origin or not origin.strip():

        return {
            "success": False,
            "flights": [],
            "error_type": "validation_error",
            "message": "Origin is required.",
            "is_live": False,
        }

    if not destination or not destination.strip():

        return {
            "success": False,
            "flights": [],
            "error_type": "validation_error",
            "message": "Destination is required.",
            "is_live": False,
        }

    if not departure_date:

        return {
            "success": False,
            "flights": [],
            "error_type": "validation_error",
            "message": "Departure date is required.",
            "is_live": False,
        }

    if adults < 1:

        return {
            "success": False,
            "flights": [],
            "error_type": "validation_error",
            "message": "Travelers must be at least 1.",
            "is_live": False,
        }

    # ========================================================
    # API KEY
    # ========================================================

    api_key = os.getenv("FLIGHTAPI_KEY")

    if not api_key:

        return {
            "success": False,
            "flights": [],
            "error_type": "configuration_error",
            "message": "FlightAPI is not configured.",
            "is_live": False,
        }

    # ========================================================
    # NORMALIZE ROUTE
    # ========================================================

    origin_code = normalize_city(origin)

    destination_code = normalize_city(destination)

    print(
        f"FlightAPI Search: "
        f"{origin} ({origin_code}) -> "
        f"{destination} ({destination_code}) "
        f"on {departure_date}"
    )

    # ========================================================
    # FLIGHTAPI URL
    # ========================================================

    url = (
        "https://api.flightapi.io/onewaytrip/"
        f"{api_key}/"
        f"{origin_code}/"
        f"{destination_code}/"
        f"{departure_date}/"
        f"{adults}/"
        "0/"
        "0/"
        "Economy/"
        "INR"
    )

    # ========================================================
    # API REQUEST
    # ========================================================

    result = await safe_get(
        url=url,
        timeout=60,
        retries=1,
    )

    # ========================================================
    # HANDLE HTTP/API ERROR
    # ========================================================

    if not result.get("success"):

        error_type = result.get(
            "error_type",
            "flight_api_error",
        )

        message = result.get(
            "message",
            "Flight service is currently unavailable.",
        )

        print(
            f"FlightAPI error: "
            f"{error_type} - {message}"
        )

        return {
            "success": False,
            "flights": [],
            "error_type": error_type,
            "message": message,
            "is_live": False,
        }

    # ========================================================
    # READ RESPONSE
    # ========================================================

    data = result.get("data", {})

    if not isinstance(data, dict):

        return {
            "success": False,
            "flights": [],
            "error_type": "invalid_response",
            "message": "FlightAPI returned an invalid response.",
            "is_live": False,
        }

    # ========================================================
    # CHECK PROVIDER ERROR
    # ========================================================

    if data.get("error"):

        message = data.get(
            "error",
            "FlightAPI returned an error.",
        )

        return {
            "success": False,
            "flights": [],
            "error_type": "provider_error",
            "message": message,
            "is_live": False,
        }

    # ========================================================
    # READ FLIGHT COLLECTIONS
    # ========================================================

    itineraries = data.get(
        "itineraries",
        [],
    )

    legs = data.get(
        "legs",
        [],
    )

    segments = data.get(
        "segments",
        [],
    )

    carriers = data.get(
        "carriers",
        [],
    )

    if not isinstance(itineraries, list):
        itineraries = []

    if not isinstance(legs, list):
        legs = []

    if not isinstance(segments, list):
        segments = []

    if not isinstance(carriers, list):
        carriers = []

    print(
        f"FlightAPI results: "
        f"{len(itineraries)} itineraries, "
        f"{len(legs)} legs, "
        f"{len(segments)} segments"
    )

    # ========================================================
    # NO RESULTS
    # ========================================================

    if not itineraries:

        return {
            "success": True,
            "flights": [],
            "error_type": "no_results",
            "message": (
                "No flights found for the selected "
                "route and date."
            ),
            "is_live": True,
        }

    # ========================================================
    # CREATE LOOKUP MAPS
    # ========================================================

    carrier_map = {}

    for carrier in carriers:

        if not isinstance(carrier, dict):
            continue

        carrier_id = carrier.get("id")

        if carrier_id is not None:

            carrier_map[str(carrier_id)] = carrier

    segment_map = {}

    for segment in segments:

        if not isinstance(segment, dict):
            continue

        segment_id = segment.get("id")

        if segment_id:

            segment_map[str(segment_id)] = segment

    leg_map = {}

    for leg in legs:

        if not isinstance(leg, dict):
            continue

        leg_id = leg.get("id")

        if leg_id:

            leg_map[str(leg_id)] = leg

    # ========================================================
    # NORMALIZE FLIGHT RESULTS
    # ========================================================

    flights = []

    for itinerary in itineraries:

        if not isinstance(itinerary, dict):
            continue

        # ----------------------------------------------------
        # PRICING
        # ----------------------------------------------------

        price = None

        pricing_options = itinerary.get(
            "pricing_options",
            [],
        )

        if isinstance(pricing_options, list) and pricing_options:

            first_pricing = pricing_options[0]

            if isinstance(first_pricing, dict):

                price_data = first_pricing.get(
                    "price",
                    {},
                )

                if isinstance(price_data, dict):

                    price = price_data.get(
                        "amount"
                    )

        # ----------------------------------------------------
        # FALLBACK PRICE FIELDS
        # ----------------------------------------------------

        if price is None:

            price = itinerary.get(
                "price"
            )

        if price is None:

            price = itinerary.get(
                "total_price"
            )

        # ----------------------------------------------------
        # CONVERT PRICE TO NUMBER
        # ----------------------------------------------------

        if price is not None:

            try:

                price = float(price)

            except (TypeError, ValueError):

                price = None

        # ----------------------------------------------------
        # GET FIRST LEG
        # ----------------------------------------------------

        leg_ids = itinerary.get(
            "leg_ids",
            [],
        )

        if not isinstance(leg_ids, list):

            leg_ids = []

        if not leg_ids:

            continue

        first_leg = leg_map.get(
            str(leg_ids[0])
        )

        if not first_leg:

            continue

        # ----------------------------------------------------
        # ROUTE
        # ----------------------------------------------------

        origin_airport = (
            first_leg.get("origin", {})
        )

        destination_airport = (
            first_leg.get("destination", {})
        )

        if not isinstance(origin_airport, dict):

            origin_airport = {}

        if not isinstance(destination_airport, dict):

            destination_airport = {}

        flight_origin = (
            origin_airport.get("id")
            or origin_code
        )

        flight_destination = (
            destination_airport.get("id")
            or destination_code
        )

        # ----------------------------------------------------
        # DEPARTURE / ARRIVAL
        # ----------------------------------------------------

        departure_at = first_leg.get(
            "departure"
        )

        arrival_at = first_leg.get(
            "arrival"
        )

        # ----------------------------------------------------
        # DURATION
        # ----------------------------------------------------

        duration = first_leg.get(
            "duration"
        )

        try:

            duration = int(duration)

        except (TypeError, ValueError):

            duration = None

        # ----------------------------------------------------
        # STOPS
        # ----------------------------------------------------

        transfers = first_leg.get(
            "stop_count",
            0,
        )

        try:

            transfers = int(transfers)

        except (TypeError, ValueError):

            transfers = 0

        # ----------------------------------------------------
        # SEGMENTS
        # ----------------------------------------------------

        segment_ids = first_leg.get(
            "segment_ids",
            [],
        )

        if not isinstance(segment_ids, list):

            segment_ids = []

        first_segment = None

        if segment_ids:

            first_segment = segment_map.get(
                str(segment_ids[0])
            )

        # ----------------------------------------------------
        # AIRLINE / FLIGHT NUMBER
        # ----------------------------------------------------

        airline = None

        flight_number = None

        if first_segment:

            marketing_carrier_id = (
                first_segment.get(
                    "marketing_carrier_id"
                )
            )

            carrier = carrier_map.get(
                str(marketing_carrier_id)
            )

            if carrier:

                airline = (
                    carrier.get("name")
                    or carrier.get("code")
                )

            flight_number = (
                first_segment.get(
                    "marketing_flight_number"
                )
            )

        # ----------------------------------------------------
        # BOOKING LINK
        # ----------------------------------------------------

        link = None

        if pricing_options:

            first_pricing = pricing_options[0]

            if isinstance(first_pricing, dict):

                items = first_pricing.get(
                    "items",
                    [],
                )

                if isinstance(items, list) and items:

                    first_item = items[0]

                    if isinstance(first_item, dict):

                        link = first_item.get(
                            "url"
                        )

        # ----------------------------------------------------
        # NORMALIZED RESULT
        # ----------------------------------------------------

        flights.append(
            {
                "airline": airline,

                "flight_number": flight_number,

                "origin": flight_origin,

                "destination": flight_destination,

                "departure_at": departure_at,

                "arrival_at": arrival_at,

                "price": price,

                "currency": "INR",

                "transfers": transfers,

                "duration": duration,

                "link": link,

                "is_fallback": False,

                "searched_date": departure_date,

                "actual_departure_date": departure_date,
            }
        )

    # ========================================================
    # REMOVE INVALID PRICE RESULTS
    # ========================================================

    flights = [
        flight
        for flight in flights
        if flight.get("price") is not None
    ]

    # ========================================================
    # SORT BY PRICE
    # ========================================================

    flights.sort(
        key=lambda flight: (
            flight.get("price")
            if flight.get("price") is not None
            else float("inf")
        )
    )

    # ========================================================
    # NO NORMALIZED RESULTS
    # ========================================================

    if not flights:

        return {
            "success": True,
            "flights": [],
            "error_type": "no_results",
            "message": (
                "FlightAPI returned flight data, "
                "but no usable priced flights were found."
            ),
            "is_live": True,
        }

    # ========================================================
    # SUCCESS
    # ========================================================

    return {
        "success": True,
        "flights": flights[:10],
        "error_type": None,
        "message": "Flights fetched successfully.",
        "is_live": True,
    }