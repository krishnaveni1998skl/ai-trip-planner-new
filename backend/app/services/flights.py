# ============================================================
# FLIGHT SERVICE - TRAVELPAYOUTS / AVIASALES DATA API
# ============================================================

import os
from typing import Optional

import httpx
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# CITY → IATA CODE
# ============================================================

CITY_IATA = {
    "chennai": "MAA",
    "madras": "MAA",

    "dubai": "DXB",

    "paris": "PAR",

    "london": "LON",

    "singapore": "SIN",

    "bangkok": "BKK",

    "bali": "DPS",

    "maldives": "MLE",
    "male": "MLE",

    "japan": "TYO",
    "tokyo": "TYO",

    "delhi": "DEL",
    "new delhi": "DEL",

    "mumbai": "BOM",
    "bombay": "BOM",

    "kerala": "COK",
    "kochi": "COK",

    "rajasthan": "JAI",
    "jaipur": "JAI",

    "switzerland": "ZRH",
    "zurich": "ZRH",

    "canada": "YTO",
    "toronto": "YTO",

    "italy": "ROM",
    "rome": "ROM",

    "usa": "NYC",
    "new york": "NYC",

    "singapore city": "SIN",
}


# ============================================================
# AIRLINE CODE → AIRLINE NAME
# ============================================================

AIRLINE_NAMES = {
    "6E": "IndiGo",
    "AI": "Air India",
    "IX": "Air India Express",
    "UK": "Vistara",
    "SG": "SpiceJet",
    "QP": "Akasa Air",

    "EK": "Emirates",
    "FZ": "flydubai",
    "G9": "Air Arabia",

    "QR": "Qatar Airways",
    "EY": "Etihad Airways",
    "SV": "Saudia",

    "SQ": "Singapore Airlines",
    "TG": "Thai Airways",

    "BA": "British Airways",
    "LH": "Lufthansa",
    "AF": "Air France",
    "KL": "KLM",

    "TK": "Turkish Airlines",

    "WY": "Oman Air",
    "GF": "Gulf Air",

    "CX": "Cathay Pacific",
    "JL": "Japan Airlines",
    "NH": "ANA",

    "MH": "Malaysia Airlines",

    "AK": "AirAsia",
}


# ============================================================
# NORMALIZE CITY
# ============================================================

def normalize_city(city: str) -> str:
    """
    Convert city name to IATA code.

    If the value is already an IATA code,
    it will simply be converted to uppercase.
    """

    if not city:
        return ""

    city_value = city.strip().lower()

    return CITY_IATA.get(
        city_value,
        city.strip().upper(),
    )


# ============================================================
# FORMAT DURATION
# ============================================================

def format_duration(minutes) -> str:
    """
    Convert minutes into readable format.

    Example:
    180 -> 3h
    195 -> 3h 15m
    """

    try:
        minutes = int(minutes)
    except (TypeError, ValueError):
        return "N/A"

    if minutes < 0:
        return "N/A"

    hours = minutes // 60
    mins = minutes % 60

    if hours == 0:
        return f"{mins}m"

    if mins == 0:
        return f"{hours}h"

    return f"{hours}h {mins}m"


# ============================================================
# FORMAT DATE / TIME
# ============================================================

def format_datetime(value: Optional[str]) -> Optional[str]:
    """
    Keep ISO datetime string compatible with frontend.
    """

    if not value:
        return None

    return value


# ============================================================
# CREATE FLIGHT LINK
# ============================================================

def create_flight_link(
    link: Optional[str],
) -> Optional[str]:
    """
    Convert relative Aviasales link
    into complete URL.
    """

    if not link:
        return None

    if link.startswith("http://"):
        return link

    if link.startswith("https://"):
        return link

    if link.startswith("/"):
        return f"https://www.aviasales.com{link}"

    return f"https://www.aviasales.com/{link}"


# ============================================================
# NORMALIZE SINGLE FLIGHT
# ============================================================

def normalize_flight(
    flight: dict,
    origin_code: str,
    destination_code: str,
    departure_date: str,
    currency: str = "INR",
):
    """
    Convert Travelpayouts flight response
    into existing frontend-compatible format.
    """

    if not isinstance(flight, dict):
        return None

    # --------------------------------------------------------
    # PRICE
    # --------------------------------------------------------

    price = flight.get("price")

    try:
        if price is not None:
            price = float(price)
    except (TypeError, ValueError):
        price = None

    if price is None:
        return None

    # --------------------------------------------------------
    # AIRLINE
    # --------------------------------------------------------

    airline_code = (
        flight.get("airline")
        or flight.get("airline_code")
        or ""
    )

    airline_code = str(
        airline_code
    ).upper()

    airline_name = AIRLINE_NAMES.get(
        airline_code,
        airline_code or "Airline",
    )

    # --------------------------------------------------------
    # FLIGHT NUMBER
    # --------------------------------------------------------

    flight_number = flight.get(
        "flight_number"
    )

    if flight_number is not None:
        flight_number = str(
            flight_number
        )

    # --------------------------------------------------------
    # AIRPORTS
    # --------------------------------------------------------

    origin_airport = (
        flight.get("origin_airport")
        or flight.get("origin")
        or origin_code
    )

    destination_airport = (
        flight.get("destination_airport")
        or flight.get("destination")
        or destination_code
    )

    # --------------------------------------------------------
    # DEPARTURE
    # --------------------------------------------------------

    departure_at = format_datetime(
        flight.get("departure_at")
    )

    # --------------------------------------------------------
    # ARRIVAL
    # --------------------------------------------------------

    arrival_at = format_datetime(
        flight.get("arrival_at")
        or flight.get("arrival")
    )

    # --------------------------------------------------------
    # TRANSFERS / STOPS
    # --------------------------------------------------------

    transfers = flight.get(
        "transfers"
    )

    if transfers is None:
        transfers = flight.get(
            "number_of_changes"
        )

    try:
        transfers = int(
            transfers
        )
    except (TypeError, ValueError):
        transfers = 0

    # --------------------------------------------------------
    # DURATION
    # --------------------------------------------------------

    duration = flight.get(
        "duration"
    )

    if duration is None:
        duration = flight.get(
            "duration_to"
        )

    try:
        duration = int(
            duration
        )
    except (TypeError, ValueError):
        duration = None

    duration_text = format_duration(
        duration
    )

    # --------------------------------------------------------
    # BOOKING LINK
    # --------------------------------------------------------

    link = create_flight_link(
        flight.get("link")
    )

    # --------------------------------------------------------
    # NORMALIZED RESULT
    # --------------------------------------------------------

    return {
        "id": (
            f"{airline_code}-"
            f"{flight_number or 'flight'}-"
            f"{departure_at or departure_date}"
        ),

        "airline": airline_name,

        "airline_code": airline_code,

        "flight_number": flight_number,

        "origin": origin_airport,

        "origin_airport": origin_airport,

        "origin_city": origin_code,

        "destination": destination_airport,

        "destination_airport": destination_airport,

        "destination_city": destination_code,

        "departure_at": departure_at,

        "arrival_at": arrival_at,

        "departure_time": departure_at,

        "arrival_time": arrival_at,

        "price": price,

        "currency": currency,

        "transfers": transfers,

        "stops": transfers,

        "duration": duration,

        "duration_text": duration_text,

        "link": link,

        "is_fallback": False,

        "is_live": False,

        "searched_date": departure_date,

        "actual_departure_date": (
            departure_date
        ),
    }


# ============================================================
# EXTRACT RAW FLIGHTS
# ============================================================

def extract_raw_flights(data):
    """
    Safely extract flight records from
    Travelpayouts response.
    """

    if not isinstance(data, dict):
        return []

    raw_data = data.get(
        "data",
        [],
    )

    if raw_data is None:
        return []

    # --------------------------------------------------------
    # LIST RESPONSE
    # --------------------------------------------------------

    if isinstance(
        raw_data,
        list,
    ):
        return [
            item
            for item in raw_data
            if isinstance(item, dict)
        ]

    # --------------------------------------------------------
    # DICT RESPONSE
    # --------------------------------------------------------

    if isinstance(
        raw_data,
        dict,
    ):

        results = []

        for value in raw_data.values():

            if isinstance(
                value,
                dict,
            ):

                # Direct flight object
                if (
                    "price" in value
                    or "airline" in value
                    or "flight_number" in value
                ):
                    results.append(
                        value
                    )

                # Nested objects
                else:

                    for nested in value.values():

                        if isinstance(
                            nested,
                            dict,
                        ):
                            results.append(
                                nested
                            )

        return results

    return []


# ============================================================
# CALL TRAVELPOUTS API
# ============================================================

async def call_travelpayouts(
    url: str,
    params: dict,
    headers: dict,
):
    """
    Make Travelpayouts API request.
    """

    try:

        async with httpx.AsyncClient(
            timeout=60.0,
            follow_redirects=True,
        ) as client:

            response = await client.get(
                url,
                params=params,
                headers=headers,
            )

    except httpx.TimeoutException:

        print(
            "Travelpayouts error: timeout"
        )

        return {
            "success": False,
            "status_code": None,
            "data": None,
            "error_type": "timeout",
            "message": (
                "Flight service request timed out."
            ),
        }

    except httpx.RequestError as exc:

        print(
            f"Travelpayouts request error: {exc}"
        )

        return {
            "success": False,
            "status_code": None,
            "data": None,
            "error_type": "request_error",
            "message": (
                "Unable to connect to "
                "Travelpayouts."
            ),
        }

    print(
        f"Travelpayouts Status : "
        f"{response.status_code}"
    )

    # --------------------------------------------------------
    # HTTP ERROR
    # --------------------------------------------------------

    if response.status_code != 200:

        try:
            error_data = response.json()
        except Exception:
            error_data = {}

        print(
            "TRAVELPOUTS API ERROR"
        )

        print(
            f"Response : {error_data}"
        )

        if response.status_code == 401:

            error_type = (
                "authentication_error"
            )

            message = (
                "Travelpayouts API token "
                "is invalid or not authorized."
            )

        elif response.status_code == 403:

            error_type = (
                "access_denied"
            )

            message = (
                "Travelpayouts API access "
                "is not available for this account."
            )

        elif response.status_code == 429:

            error_type = (
                "rate_limit"
            )

            message = (
                "Travelpayouts API rate limit "
                "has been reached."
            )

        else:

            error_type = (
                "flight_api_error"
            )

            message = (
                error_data.get("error")
                or error_data.get("message")
                or "Travelpayouts API error."
            )

        return {
            "success": False,
            "status_code": response.status_code,
            "data": None,
            "error_type": error_type,
            "message": message,
        }

    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    try:

        data = response.json()

    except Exception:

        return {
            "success": False,
            "status_code": 200,
            "data": None,
            "error_type": (
                "invalid_response"
            ),
            "message": (
                "Travelpayouts returned "
                "invalid JSON."
            ),
        }

    return {
        "success": True,
        "status_code": 200,
        "data": data,
        "error_type": None,
        "message": None,
    }


# ============================================================
# MAIN FLIGHT SEARCH
# ============================================================

async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
):
    """
    Search flights using Travelpayouts.

    Strategy:

    1. Search exact date.
    2. If no data, search same month.
    3. Normalize results.
    4. Sort by price.
    5. Return maximum 5 flights.
    """

    # ========================================================
    # VALIDATION
    # ========================================================

    if not origin or not origin.strip():

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "validation_error"
            ),
            "message": (
                "Origin is required."
            ),
            "is_live": False,
        }

    if (
        not destination
        or not destination.strip()
    ):

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "validation_error"
            ),
            "message": (
                "Destination is required."
            ),
            "is_live": False,
        }

    if not departure_date:

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "validation_error"
            ),
            "message": (
                "Departure date is required."
            ),
            "is_live": False,
        }

    if adults < 1:

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "validation_error"
            ),
            "message": (
                "Travelers must be at least 1."
            ),
            "is_live": False,
        }

    # ========================================================
    # API TOKEN
    # ========================================================

    api_token = os.getenv(
        "TRAVELPAYOUTS_API_TOKEN"
    )

    if not api_token:

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "configuration_error"
            ),
            "message": (
                "Travelpayouts API token "
                "is not configured."
            ),
            "is_live": False,
        }

    # ========================================================
    # IATA
    # ========================================================

    origin_code = normalize_city(
        origin
    )

    destination_code = normalize_city(
        destination
    )

    print(
        "\n"
        "========================================\n"
        "TRAVELPOUTS FLIGHT SEARCH\n"
        "========================================"
    )

    print(
        f"Origin      : "
        f"{origin} ({origin_code})"
    )

    print(
        f"Destination : "
        f"{destination} ({destination_code})"
    )

    print(
        f"Departure   : "
        f"{departure_date}"
    )

    print(
        f"Adults      : "
        f"{adults}"
    )

    # ========================================================
    # API
    # ========================================================

    url = (
        "https://api.travelpayouts.com/"
        "aviasales/v3/prices_for_dates"
    )

    headers = {
        "X-Access-Token": api_token,
        "Accept": "application/json",
        "Accept-Encoding": (
            "gzip, deflate"
        ),
        "User-Agent": (
            "AI-Trip-Planner/1.0"
        ),
    }

    # ========================================================
    # EXACT DATE SEARCH
    # ========================================================

    exact_params = {
        "origin": origin_code,
        "destination": destination_code,

        "departure_at": departure_date,

        "one_way": "true",

        "direct": "false",

        "sorting": "price",

        "limit": "30",

        "page": "1",

        "currency": "INR",

        "unique": "false",
    }

    print(
        "\n"
        "EXACT DATE REQUEST"
    )

    print(
        f"URL    : {url}"
    )

    print(
        f"Params : {exact_params}"
    )

    exact_result = await call_travelpayouts(
        url,
        exact_params,
        headers,
    )

    # --------------------------------------------------------
    # REQUEST ERROR
    # --------------------------------------------------------

    if not exact_result.get(
        "success"
    ):

        return {
            "success": False,
            "flights": [],
            "error_type": exact_result.get(
                "error_type"
            ),
            "message": exact_result.get(
                "message"
            ),
            "is_live": False,
        }

    exact_data = exact_result.get(
        "data"
    )

    # --------------------------------------------------------
    # CHECK PROVIDER SUCCESS
    # --------------------------------------------------------

    if not isinstance(
        exact_data,
        dict,
    ):

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "invalid_response"
            ),
            "message": (
                "Travelpayouts returned "
                "an invalid response."
            ),
            "is_live": False,
        }

    if not exact_data.get(
        "success",
        False,
    ):

        message = (
            exact_data.get("error")
            or "Travelpayouts returned an error."
        )

        print(
            f"Provider error: {message}"
        )

        return {
            "success": False,
            "flights": [],
            "error_type": (
                "provider_error"
            ),
            "message": message,
            "is_live": False,
        }

    raw_flights = extract_raw_flights(
        exact_data
    )

    print(
        f"Exact-date raw flights: "
        f"{len(raw_flights)}"
    )

    # ========================================================
    # MONTH FALLBACK
    # ========================================================

    used_month_fallback = False

    if not raw_flights:

        print(
            "\n"
            "========================================"
        )

        print(
            "NO EXACT-DATE DATA"
        )

        print(
            "Trying same-month Travelpayouts data..."
        )

        print(
            "========================================"
        )

        month = departure_date[:7]

        month_params = {
            "origin": origin_code,
            "destination": destination_code,

            # YYYY-MM
            "departure_at": month,

            "one_way": "true",

            "direct": "false",

            "sorting": "price",

            "limit": "30",

            "page": "1",

            "currency": "INR",

            "unique": "false",
        }

        print(
            f"Month : {month}"
        )

        print(
            f"Params: {month_params}"
        )

        month_result = await call_travelpayouts(
            url,
            month_params,
            headers,
        )

        if month_result.get(
            "success"
        ):

            month_data = month_result.get(
                "data"
            )

            if (
                isinstance(
                    month_data,
                    dict,
                )
                and month_data.get(
                    "success",
                    False,
                )
            ):

                raw_flights = extract_raw_flights(
                    month_data
                )

                if raw_flights:

                    used_month_fallback = True

        print(
            f"Monthly raw flights: "
            f"{len(raw_flights)}"
        )

    # ========================================================
    # NO DATA
    # ========================================================

    if not raw_flights:

        print(
            "\n"
            "No Travelpayouts flight data "
            "available."
        )

        return {
            "success": True,
            "flights": [],
            "error_type": (
                "no_results"
            ),
            "message": (
                "No flight prices are currently "
                "available for this route."
            ),
            "is_live": False,
        }

    # ========================================================
    # NORMALIZE
    # ========================================================

    flights = []

    for raw_flight in raw_flights:

        normalized = normalize_flight(
            raw_flight,
            origin_code,
            destination_code,
            departure_date,
            "INR",
        )

        if normalized:

            # Mark monthly fallback
            if used_month_fallback:

                normalized[
                    "is_fallback"
                ] = True

            flights.append(
                normalized
            )

    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    unique_flights = []

    seen = set()

    for flight in flights:

        unique_key = (
            flight.get(
                "airline_code"
            ),

            flight.get(
                "flight_number"
            ),

            flight.get(
                "departure_at"
            ),

            flight.get(
                "price"
            ),
        )

        if unique_key in seen:
            continue

        seen.add(
            unique_key
        )

        unique_flights.append(
            flight
        )

    flights = unique_flights

    # ========================================================
    # SORT BY PRICE
    # ========================================================

    flights.sort(
        key=lambda flight: (
            flight.get("price")
            if flight.get("price")
            is not None
            else float("inf")
        )
    )

    # ========================================================
    # MAXIMUM 5
    # ========================================================

    flights = flights[:5]

    # ========================================================
    # LOG RESULTS
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "FINAL FLIGHT RESULTS"
    )

    print(
        "========================================"
    )

    print(
        f"Flights returned: "
        f"{len(flights)}"
    )

    for index, flight in enumerate(
        flights,
        start=1,
    ):

        print(
            f"{index}. "
            f"{flight.get('airline')} "
            f"{flight.get('flight_number')} | "
            f"{flight.get('origin')} -> "
            f"{flight.get('destination')} | "
            f"INR {flight.get('price')} | "
            f"{flight.get('duration_text')} | "
            f"{flight.get('transfers')} stops | "
            f"Fallback: "
            f"{flight.get('is_fallback')}"
        )

    # ========================================================
    # NO USABLE RESULTS
    # ========================================================

    if not flights:

        return {
            "success": True,
            "flights": [],
            "error_type": (
                "no_results"
            ),
            "message": (
                "Travelpayouts returned data, "
                "but no usable priced flights "
                "were found."
            ),
            "is_live": False,
        }

    # ========================================================
    # SUCCESS
    # ========================================================

    return {
        "success": True,

        "flights": flights,

        "error_type": None,

        "message": (
            "Flights fetched successfully."
        ),

        "is_live": False,

        "used_month_fallback": (
            used_month_fallback
        ),
    }