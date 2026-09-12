import os
import time
import hashlib
import ssl
from datetime import datetime
from typing import Any

import httpx
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# HOTELBEDS CONFIGURATION
# ============================================================

HOTELBEDS_API_KEY = os.getenv("HOTELBEDS_API_KEY")
HOTELBEDS_SECRET = os.getenv("HOTELBEDS_SECRET")

# Live Hotel Availability / Prices
HOTELBEDS_BASE_URL = os.getenv(
    "HOTELBEDS_BASE_URL",
    "https://api-mtls.test.hotelbeds.com",
).rstrip("/")

# Hotelbeds Content API
HOTELBEDS_CONTENT_URL = os.getenv(
    "HOTELBEDS_CONTENT_URL",
    "https://api.test.hotelbeds.com",
).rstrip("/")

# mTLS certificate
HOTELBEDS_CERT_PATH = os.getenv(
    "HOTELBEDS_CERT_PATH"
)

HOTELBEDS_KEY_PATH = os.getenv(
    "HOTELBEDS_KEY_PATH"
)

HOTELBEDS_KEY_PASSWORD = os.getenv(
    "HOTELBEDS_KEY_PASSWORD"
)


# ============================================================
# BASIC VALIDATION
# ============================================================

if not HOTELBEDS_API_KEY:
    print(
        "WARNING: HOTELBEDS_API_KEY is missing"
    )

if not HOTELBEDS_SECRET:
    print(
        "WARNING: HOTELBEDS_SECRET is missing"
    )

if not HOTELBEDS_CERT_PATH:
    print(
        "WARNING: HOTELBEDS_CERT_PATH is missing"
    )

if not HOTELBEDS_KEY_PATH:
    print(
        "WARNING: HOTELBEDS_KEY_PATH is missing"
    )




# ============================================================
# HOTELBEDS X-SIGNATURE
# ============================================================

def create_signature() -> str:
    """
    Hotelbeds authentication.

    SHA256(
        API_KEY + SECRET + current_unix_timestamp
    )
    """

    if not HOTELBEDS_API_KEY:
        raise ValueError(
            "HOTELBEDS_API_KEY is missing"
        )

    if not HOTELBEDS_SECRET:
        raise ValueError(
            "HOTELBEDS_SECRET is missing"
        )

    timestamp = str(
        int(time.time())
    )

    raw_string = (
        f"{HOTELBEDS_API_KEY}"
        f"{HOTELBEDS_SECRET}"
        f"{timestamp}"
    )

    return hashlib.sha256(
        raw_string.encode("utf-8")
    ).hexdigest()


# ============================================================
# COMMON HOTELBEDS HEADERS
# ============================================================

def get_hotelbeds_headers() -> dict[str, str]:
    return {
        "Accept": "application/json",
        "Api-key": HOTELBEDS_API_KEY or "",
        "X-Signature": create_signature(),
    }


# ============================================================
# SAFE FALLBACK DESTINATION CODES
# ============================================================
# These are used only when Hotelbeds destination lookup does not
# return the city. The hotel portfolio is still country-validated
# before results are returned, so a wrong destination cannot leak
# unrelated hotels.
FALLBACK_DESTINATION_CODES = {
    "paris": "PAR",
    "dubai": "DXB",
    "abu dhabi": "AUH",
    "singapore": "SIN",
    "bali": "DPS",
    "denpasar": "DPS",
    "bangkok": "BKK",
    "tokyo": "TYO",
    "kuala lumpur": "KUL",
    "hong kong": "HKG",
    "london": "LON",
    "rome": "ROM",
    "milan": "MIL",
    "barcelona": "BCN",
    "madrid": "MAD",
    "amsterdam": "AMS",
    "frankfurt": "FRA",
    "berlin": "BER",
    "zurich": "ZRH",
    "istanbul": "IST",
    "mumbai": "BOM",
    "chennai": "MAA",
    "delhi": "DEL",
    "new delhi": "DEL",
    "hyderabad": "HYD",
    "goa": "GOI",
    "new york": "NYC",
    "sydney": "SYD",
    "melbourne": "MEL",
    "cape town": "CPT",
    "johannesburg": "JNB",
    # Do NOT use MLE as an automatic fallback for "Maldives".
    # The Hotelbeds test portfolio previously mapped MLE to unrelated
    # French content, so an invalid destination must return no hotels.
}

# ============================================================
# DYNAMIC HOTELBEDS DESTINATION CODE
# ============================================================

async def get_destination_code(location: str) -> str:
    """
    Resolve a user location to a Hotelbeds destination code.

    Important:
    - Use validated local fallback codes first for common cities.
    - Do NOT call the Hotelbeds Destination API repeatedly.
    - For destinations without a safe city code (for example Maldives),
      search_hotels() will use the geocoded country code instead.
    """

    if not location:
        return ""

    raw_location = str(location).strip()
    clean_location = raw_location.lower()
    city_name = clean_location.split(",")[0].strip()

    if not hasattr(get_destination_code, "_cache"):
        get_destination_code._cache = {}

    if not hasattr(get_destination_code, "_country_cache"):
        get_destination_code._country_cache = {}

    cache = get_destination_code._cache
    country_cache = get_destination_code._country_cache

    if city_name in cache:
        cached_code = cache[city_name]
        print(f"Using cached Hotelbeds destination: {city_name} -> {cached_code}")
        return cached_code

    print()
    print("==============================================")
    print("     HOTELBEDS DESTINATION LOOKUP")
    print("==============================================")
    print("User location :", raw_location)

    # ------------------------------------------------------------
    # STEP 1: Resolve country using Open-Meteo.
    # ------------------------------------------------------------
    country_code = ""

    try:
        geocode_url = "https://geocoding-api.open-meteo.com/v1/search"
        geocode_params = {
            "name": raw_location,
            "count": 10,
            "language": "en",
            "format": "json",
        }

        async with httpx.AsyncClient(verify=True, timeout=20) as client:
            geo_response = await client.get(
                geocode_url,
                params=geocode_params,
            )

        print("Open-Meteo Geocoding Status:", geo_response.status_code)

        if geo_response.status_code == 200:
            geo_data = geo_response.json()
            geo_results = geo_data.get("results", [])

            if isinstance(geo_results, list):
                selected_geo = None

                for result in geo_results:
                    if not isinstance(result, dict):
                        continue

                    result_name = str(
                        result.get("name", "")
                    ).strip().lower()

                    if result_name == city_name:
                        selected_geo = result
                        break

                if selected_geo is None and geo_results:
                    selected_geo = geo_results[0]

                if isinstance(selected_geo, dict):
                    country_code = str(
                        selected_geo.get("country_code", "")
                    ).strip().upper()

                    print("Geocoded location :", selected_geo.get("name", ""))
                    print("Country           :", selected_geo.get("country", ""))
                    print("Country code      :", country_code)

                    country_cache[city_name] = country_code

    except Exception as exc:
        print("Open-Meteo geocoding error:", str(exc))

    # ------------------------------------------------------------
    # STEP 2: SAFE CITY FALLBACK FIRST.
    #
    # This prevents consuming Hotelbeds Destination API quota for
    # cities whose destination codes are already validated.
    # ------------------------------------------------------------
    fallback_code = FALLBACK_DESTINATION_CODES.get(city_name, "")

    if fallback_code:
        print(
            "Using validated Hotelbeds city fallback:",
            city_name,
            "->",
            fallback_code,
        )
        cache[city_name] = fallback_code
        return fallback_code

    # ------------------------------------------------------------
    # STEP 3: Do NOT scan 10 Hotelbeds destination pages.
    #
    # The caller can use country_code to search hotel content when
    # there is no safe city destination code.
    # ------------------------------------------------------------
    print(
        "No safe city destination code for:",
        raw_location,
        "| country:",
        country_code or "unknown",
    )

    cache[city_name] = ""
    return ""


# ============================================================
# CREATE SSL CONTEXT
# ============================================================

def create_ssl_context() -> ssl.SSLContext:
    """
    Create SSL context for Hotelbeds mTLS API.
    """

    if not HOTELBEDS_CERT_PATH:

        raise ValueError(
            "HOTELBEDS_CERT_PATH is missing in .env"
        )

    if not HOTELBEDS_KEY_PATH:

        raise ValueError(
            "HOTELBEDS_KEY_PATH is missing in .env"
        )

    if not os.path.exists(
        HOTELBEDS_CERT_PATH
    ):

        raise FileNotFoundError(
            "Certificate file not found: "
            f"{HOTELBEDS_CERT_PATH}"
        )

    if not os.path.exists(
        HOTELBEDS_KEY_PATH
    ):

        raise FileNotFoundError(
            "Private key file not found: "
            f"{HOTELBEDS_KEY_PATH}"
        )

    ssl_context = (
        ssl.create_default_context()
    )

    ssl_context.load_cert_chain(
        certfile=HOTELBEDS_CERT_PATH,
        keyfile=HOTELBEDS_KEY_PATH,
        password=HOTELBEDS_KEY_PASSWORD,
    )

    return ssl_context


# ============================================================
# HOTEL IMAGE URL
# ============================================================

def build_hotel_image(
    image_path: str | None,
) -> str:
    """
    Convert Hotelbeds image path
    into a real Hotelbeds image URL.

    Example:

        image_path:
        00/006808/006808a_hb_f_001.jpg

    Result:

        https://photos.hotelbeds.com/giata/
        00/006808/006808a_hb_f_001.jpg
    """

    if not image_path:
        return ""

    image_path = (
        str(image_path)
        .strip()
        .lstrip("/")
    )

    if not image_path:
        return ""

    # Already a complete URL
    if image_path.startswith(
        "http://"
    ):
        return image_path

    if image_path.startswith(
        "https://"
    ):
        return image_path

    return (
        "https://photos.hotelbeds.com/giata/"
        + image_path
    )


# ============================================================
# IMAGE TYPE
# ============================================================

def get_image_type(
    image: dict[str, Any],
) -> str:
    """
    Hotelbeds image types:

        GEN = General hotel image
        HAB = Room image
        RES = Restaurant image
    """

    # Hotelbeds Content API uses imageTypeCode (e.g. GEN/HAB/RES).
    # Keep support for the older type/typeCode shapes too.
    image_type = image.get(
        "imageTypeCode"
    )

    if isinstance(image_type, dict):
        return str(
            image_type.get("code")
            or image_type.get("content")
            or ""
        ).strip().upper()

    if image_type:
        return str(image_type).strip().upper()

    image_type = image.get(
        "type"
    )

    # Example:
    #
    # "type": {
    #     "code": "GEN"
    # }
    #

    if isinstance(
        image_type,
        dict,
    ):

        return str(
            image_type.get("code")
            or ""
        ).upper()

    # Example:
    #
    # "type": "GEN"
    #

    if isinstance(
        image_type,
        str,
    ):

        return image_type.upper()

    # Alternative field
    return str(
        image.get("typeCode")
        or ""
    ).upper()


# ============================================================
# VISUAL ORDER
# ============================================================

def get_visual_order(
    image: dict[str, Any],
) -> int:

    value = (
        image.get("visualOrder")
        or image.get("visual_order")
        or image.get("order")
        or 999999
    )

    try:

        return int(value)

    except Exception:

        return 999999


# ============================================================
# IMAGE PATH
# ============================================================

def get_image_path(
    image: dict[str, Any],
) -> str:

    return str(
        image.get("path")
        or image.get("imagePath")
        or image.get("url")
        or ""
    ).strip()


# ============================================================
# COLLECT HOTEL IMAGES
# ============================================================

def collect_hotel_images(
    value: Any,
) -> list[dict[str, Any]]:
    """
    Recursively find Hotelbeds image objects.

    Supports normal and nested JSON structures.
    """

    found: list[
        dict[str, Any]
    ] = []

    # --------------------------------------------------------
    # List
    # --------------------------------------------------------

    if isinstance(
        value,
        list,
    ):

        for item in value:

            found.extend(
                collect_hotel_images(
                    item
                )
            )

        return found

    # --------------------------------------------------------
    # Dictionary
    # --------------------------------------------------------

    if not isinstance(
        value,
        dict,
    ):

        return found

    # --------------------------------------------------------
    # Check current object
    # --------------------------------------------------------

    path = get_image_path(
        value
    )

    if path:

        image_type = get_image_type(
            value
        )

        # Only hotel / room images
        if image_type in {
            "GEN",
            "HAB",
        }:

            found.append(
                {
                    "type": image_type,
                    "visual_order": (
                        get_visual_order(
                            value
                        )
                    ),
                    "path": path,
                }
            )

    # --------------------------------------------------------
    # Search nested values
    # --------------------------------------------------------

    for nested_value in (
        value.values()
    ):

        if isinstance(
            nested_value,
            (
                dict,
                list,
            ),
        ):

            found.extend(
                collect_hotel_images(
                    nested_value
                )
            )

    return found


# ============================================================
# CHOOSE HOTEL IMAGE
# ============================================================

def choose_hotel_image(
    images: Any,
) -> str:
    """
    Select a real Hotelbeds hotel image.

    Priority:

        1. GEN + visualOrder 0
        2. GEN
        3. HAB + visualOrder 0
        4. HAB

    RES / restaurant images
    are never selected.
    """

    candidates = (
        collect_hotel_images(
            images
        )
    )

    if not candidates:

        print(
            "Hotelbeds: "
            "no GEN/HAB image found"
        )

        return ""

    # --------------------------------------------------------
    # Remove duplicate paths
    # --------------------------------------------------------

    unique_images = []

    seen_paths = set()

    for image in candidates:

        path = image.get(
            "path"
        )

        if not path:
            continue

        if path in seen_paths:
            continue

        seen_paths.add(
            path
        )

        unique_images.append(
            image
        )

    # --------------------------------------------------------
    # GENERAL HOTEL IMAGES
    # --------------------------------------------------------

    general_images = [
        image
        for image in unique_images
        if image.get("type")
        == "GEN"
    ]

    if general_images:

        general_images.sort(
            key=lambda item:
                item.get(
                    "visual_order",
                    999999,
                )
        )

        selected = (
            general_images[0]
        )

        image_url = (
            build_hotel_image(
                selected["path"]
            )
        )

        print()
        print(
            "=============================================="
        )
        print(
            "       HOTELBEDS HOTEL IMAGE"
        )
        print(
            "=============================================="
        )
        print(
            "Type        :",
            selected["type"],
        )
        print(
            "VisualOrder :",
            selected[
                "visual_order"
            ],
        )
        print(
            "Image path  :",
            selected["path"],
        )
        print(
            "Image URL   :",
            image_url,
        )
        print(
            "=============================================="
        )

        return image_url

    # --------------------------------------------------------
    # ROOM IMAGES
    # --------------------------------------------------------

    room_images = [
        image
        for image in unique_images
        if image.get("type")
        == "HAB"
    ]

    if room_images:

        room_images.sort(
            key=lambda item:
                item.get(
                    "visual_order",
                    999999,
                )
        )

        selected = (
            room_images[0]
        )

        image_url = (
            build_hotel_image(
                selected["path"]
            )
        )

        print()
        print(
            "=============================================="
        )
        print(
            "       HOTELBEDS ROOM IMAGE"
        )
        print(
            "=============================================="
        )
        print(
            "Type        :",
            selected["type"],
        )
        print(
            "VisualOrder :",
            selected[
                "visual_order"
            ],
        )
        print(
            "Image path  :",
            selected["path"],
        )
        print(
            "Image URL   :",
            image_url,
        )
        print(
            "=============================================="
        )

        return image_url

    return ""


# ============================================================
# EXTRACT HOTEL LIST
# ============================================================

def extract_hotels_from_response(
    data: Any,
) -> list[dict[str, Any]]:
    """
    Hotelbeds can return hotels
    in different JSON structures.

    Supports:

        {
            "hotels": {
                "hotels": [...]
            }
        }

    OR:

        {
            "hotels": [...]
        }

    OR:

        [...]
    """

    # --------------------------------------------------------
    # Direct list
    # --------------------------------------------------------

    if isinstance(
        data,
        list,
    ):

        return [
            item
            for item in data
            if isinstance(
                item,
                dict,
            )
        ]

    # --------------------------------------------------------
    # Must be dictionary
    # --------------------------------------------------------

    if not isinstance(
        data,
        dict,
    ):

        return []

    hotels = data.get(
        "hotels"
    )

    # --------------------------------------------------------
    # hotels = [...]
    # --------------------------------------------------------

    if isinstance(
        hotels,
        list,
    ):

        return [
            item
            for item in hotels
            if isinstance(
                item,
                dict,
            )
        ]

    # --------------------------------------------------------
    # hotels = {"hotels": [...]}
    # --------------------------------------------------------

    if isinstance(
        hotels,
        dict,
    ):

        nested = hotels.get(
            "hotels"
        )

        if isinstance(
            nested,
            list,
        ):

            return [
                item
                for item in nested
                if isinstance(
                    item,
                    dict,
                )
            ]

    return []


# ============================================================
# HOTEL CONTENT / PORTFOLIO
# ============================================================

async def get_hotel_content(
    destination_code: str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """
    Get Hotelbeds hotel portfolio
    for one destination.

    Uses Hotelbeds Content API.
    """

    url = (
        f"{HOTELBEDS_CONTENT_URL}"
        "/hotel-content-api/1.0/hotels"
    )

    params = {
        "fields": "all",
        "language": "ENG",
        "destinationCode": destination_code,
        "from": 1,
        "to": min(
            limit,
            1000,
        ),
        "useSecondaryLanguage": "false",
    }

    headers = (
        get_hotelbeds_headers()
    )

    print()
    print(
        "=============================================="
    )
    print(
        "       HOTELBEDS HOTEL PORTFOLIO"
    )
    print(
        "=============================================="
    )
    print(
        "Portfolio URL :",
        url,
    )
    print(
        "Destination   :",
        destination_code,
    )
    print(
        "From          :",
        params["from"],
    )
    print(
        "To            :",
        params["to"],
    )
    print(
        "=============================================="
    )

    try:

        async with httpx.AsyncClient(
            verify=True,
            timeout=45,
        ) as client:

            response = await client.get(
                url,
                params=params,
                headers=headers,
            )

        print(
            "Hotelbeds Portfolio Status:",
            response.status_code,
        )

        if response.status_code != 200:

            print()
            print(
                "=============================================="
            )
            print(
                "       HOTELBEDS PORTFOLIO ERROR"
            )
            print(
                "=============================================="
            )
            print(
                "Status   :",
                response.status_code,
            )
            print(
                "Response :",
                response.text[:3000],
            )
            print(
                "=============================================="
            )

            return []

        data = response.json()

        hotels = (
            extract_hotels_from_response(
                data
            )
        )

        print(
            "Hotels received:",
            len(hotels),
        )

        # ----------------------------------------------------
        # STRICT DESTINATION FILTER
        # ----------------------------------------------------

        filtered_hotels = []

        for hotel in hotels:

            api_destination = str(
                hotel.get(
                    "destinationCode"
                )
                or hotel.get(
                    "destination_code"
                )
                or ""
            ).upper()

            # If API provides destination,
            # it MUST match requested destination.
            if destination_code and api_destination:

             if api_destination != destination_code.upper():
               continue

            filtered_hotels.append(
                hotel
            )

        print(
            "Destination filtered hotels:",
            len(
                filtered_hotels
            ),
        )

        # ----------------------------------------------------
        # DEBUG HOTEL DATA
        # ----------------------------------------------------

        for hotel in (
            filtered_hotels[:10]
        ):

            code = (
                hotel.get("code")
                or hotel.get(
                    "hotelCode"
                )
                or ""
            )

            name = (
                hotel.get("name")
                or "Unknown hotel"
            )

            city = (
                hotel.get("city")
                or hotel.get(
                    "destinationName"
                )
                or ""
            )

            api_destination = (
                hotel.get(
                    "destinationCode"
                )
                or ""
            )

            print(
                "-",
                code,
                "|",
                name,
                "| destination:",
                api_destination,
                "| city:",
                city,
            )

        print(
            "=============================================="
        )

        return filtered_hotels

    except Exception as exc:

        print()
        print(
            "=============================================="
        )
        print(
            "     HOTELBEDS PORTFOLIO EXCEPTION"
        )
        print(
            "=============================================="
        )
        print(
            "Error:",
            str(exc),
        )
        print(
            "=============================================="
        )

        return []


async def get_hotel_content_by_country(
    country_code: str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """
    Get Hotelbeds hotel portfolio by country.

    Used when a reliable city/destination code is not available.
    This is especially useful for destinations such as Maldives
    where the test destination catalogue may expose an incorrect
    city mapping.

    The returned hotels are still filtered by country in search_hotels().
    """

    if not country_code:
        return []

    url = (
        f"{HOTELBEDS_CONTENT_URL}"
        "/hotel-content-api/1.0/hotels"
    )

    params = {
        "fields": "all",
        "language": "ENG",
        "countryCode": country_code.upper(),
        "from": 1,
        "to": min(max(int(limit), 1), 1000),
        "useSecondaryLanguage": "false",
    }

    headers = get_hotelbeds_headers()

    print()
    print("==============================================")
    print("   HOTELBEDS COUNTRY HOTEL PORTFOLIO")
    print("==============================================")
    print("Country       :", country_code.upper())
    print("From          :", params["from"])
    print("To            :", params["to"])
    print("==============================================")

    try:
        async with httpx.AsyncClient(
            verify=True,
            timeout=45,
        ) as client:
            response = await client.get(
                url,
                params=params,
                headers=headers,
            )

        print("Hotelbeds Country Portfolio Status:", response.status_code)

        if response.status_code != 200:
            print("Country Portfolio Response:", response.text[:3000])
            return []

        data = response.json()
        hotels = extract_hotels_from_response(data)

        print("Country portfolio hotels:", len(hotels))

        # Strict country check.
        filtered = []
        for hotel in hotels:
            hotel_country = str(
                hotel.get("countryCode")
                or hotel.get("country_code")
                or ""
            ).strip().upper()

            if hotel_country == country_code.upper():
                filtered.append(hotel)

        print(
            "Country filtered hotels:",
            len(filtered),
            f"(expected={country_code.upper()})",
        )

        return filtered

    except Exception as exc:
        print("Country portfolio exception:", str(exc))
        return []


# ============================================================
# LIVE HOTEL AVAILABILITY
# ============================================================

async def get_hotel_availability(
    destination_code: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    hotel_codes: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Get LIVE Hotelbeds hotel availability
    and prices.
    """

    url = (
        f"{HOTELBEDS_BASE_URL}"
        "/hotel-api/1.0/hotels"
    )

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json",
        "Api-key": HOTELBEDS_API_KEY or "",
        "X-Signature": create_signature(),
    }

    payload = {

        "stay": {

            "checkIn": check_in,
            "checkOut": check_out,

        },

        "occupancies": [

            {

                "rooms": 1,

                "adults": max(
                    1,
                    int(adults),
                ),

                "children": 0,

            }

        ],
    }

    # ========================================================
    # HOTEL CODE FILTER
    # ========================================================

    clean_codes = []

    if hotel_codes:

        for code in hotel_codes:

            if code is None:
                continue

            code_string = str(
                code
            ).strip()

            if (
                code_string
                and code_string
                not in clean_codes
            ):

                clean_codes.append(
                    code_string
                )

    if clean_codes:

        payload["hotels"] = {
            "hotel": clean_codes
        }

    # ========================================================
    # LOG REQUEST
    # ========================================================

    print()
    print(
        "=============================================="
    )
    print(
        "       HOTELBEDS AVAILABILITY REQUEST"
    )
    print(
        "=============================================="
    )
    print(
        "Availability URL :",
        url,
    )
    print(
        "Destination      :",
        destination_code,
    )
    print(
        "Check-in         :",
        check_in,
    )
    print(
        "Check-out        :",
        check_out,
    )
    print(
        "Adults           :",
        adults,
    )
    print(
        "Hotel codes      :",
        clean_codes,
    )
    print(
        "=============================================="
    )

    try:

        ssl_context = (
            create_ssl_context()
        )

        async with httpx.AsyncClient(
            verify=ssl_context,
            timeout=60,
        ) as client:

            response = await client.post(
                url,
                json=payload,
                headers=headers,
            )

        print(
            "Hotelbeds Availability Status:",
            response.status_code,
        )

        if response.status_code != 200:

            print()
            print(
                "=============================================="
            )
            print(
                "    HOTELBEDS AVAILABILITY ERROR"
            )
            print(
                "=============================================="
            )
            print(
                "Status:",
                response.status_code,
            )
            print(
                "Response:",
                response.text[:5000],
            )
            print(
                "=============================================="
            )

            return []

        data = response.json()

        hotel_list = (
            extract_hotels_from_response(
                data
            )
        )

        print(
            "Hotelbeds availability hotels:",
            len(hotel_list),
        )

        # ====================================================
        # STRICT DESTINATION FILTER
        # ====================================================

        filtered_hotels = []

        for hotel in hotel_list:

            api_destination = str(
                hotel.get(
                    "destinationCode"
                )
                or hotel.get(
                    "destination_code"
                )
                or ""
            ).upper()

            if api_destination:

                if (
                    api_destination
                    != destination_code.upper()
                ):

                    continue

            filtered_hotels.append(
                hotel
            )

        print(
            "Availability destination filtered:",
            len(
                filtered_hotels
            ),
        )

        return filtered_hotels

    except Exception as exc:

        print()
        print(
            "=============================================="
        )
        print(
            "   HOTELBEDS AVAILABILITY EXCEPTION"
        )
        print(
            "=============================================="
        )
        print(
            "Error:",
            str(exc),
        )
        print(
            "=============================================="
        )

        return []


# ============================================================
# NORMALIZE HOTEL
# ============================================================

def normalize_hotel(
    hotel: dict[str, Any],
    content_map: dict[
        str,
        dict[str, Any]
    ],
    check_in: str,
    check_out: str,
    requested_location: str,
    destination_code: str,
) -> dict[str, Any]:

    # ========================================================
    # HOTEL CODE
    # ========================================================

    hotel_code = str(
        hotel.get("code")
        or hotel.get("hotelCode")
        or ""
    )

    content = (
        content_map.get(
            hotel_code,
            {},
        )
    )

    # ========================================================
    # HOTEL NAME
    # ========================================================

    name = (
        hotel.get("name")
        or content.get("name")
        or "Hotel"
    )

    # ========================================================
    # CATEGORY
    # ========================================================

    category = (
        hotel.get("categoryName")
        or hotel.get("category")
        or content.get(
            "categoryName"
        )
        or content.get(
            "category"
        )
        or ""
    )

    # ========================================================
    # ADDRESS
    # ========================================================

    address = (
        hotel.get("address")
        or content.get("address")
        or ""
    )

    # ========================================================
    # CITY
    # ========================================================

    city = (
        hotel.get("city")
        or content.get("city")
        or hotel.get(
            "destinationName"
        )
        or content.get(
            "destinationName"
        )
        or requested_location
        or ""
    )

    # ========================================================
    # DESTINATION CODE
    # ========================================================

    hotel_destination_code = (
        hotel.get(
            "destinationCode"
        )
        or content.get(
            "destinationCode"
        )
        or destination_code
        or ""
    )

    # ========================================================
    # DESTINATION NAME
    # ========================================================

    hotel_destination_name = (
        hotel.get(
            "destinationName"
        )
        or content.get(
            "destinationName"
        )
        or city
        or requested_location
        or ""
    )

    # ========================================================
    # DESCRIPTION
    # ========================================================

    description = (
        hotel.get("description")
        or content.get(
            "description"
        )
        or ""
    )

    # ========================================================
    # HOTEL IMAGE
    # ========================================================

    image = ""

    # --------------------------------------------------------
    # FIRST: Hotelbeds Content API
    # --------------------------------------------------------
    content_images = content.get("images") or []

    print()
    print("==============================================")
    print("HOTEL IMAGE DEBUG")
    print("Hotel:", name)
    print("Hotel code:", hotel_code)
    print("Images type:", type(content_images))
    print("Images count:",
      len(content_images)
      if isinstance(content_images, list)
      else "NOT LIST")
    print("Images data:")
    print(content_images)
    print("==============================================")

    image = choose_hotel_image(content_images)

    print("FINAL IMAGE URL:", image)
   

    print()
    print(
        "Hotel:",
        name,
    )

    print(
        "Content images:",
        len(content_images)
        if isinstance(
            content_images,
            list,
        )
        else type(
            content_images
        ).__name__,
    )

    image = choose_hotel_image(
        content_images
    )

    # --------------------------------------------------------
    # SECOND: Availability API images
    # --------------------------------------------------------

    if not image:

        hotel_images = (
            hotel.get("images")
            or []
        )

        print(
            "Availability images:",
            len(hotel_images)
            if isinstance(
                hotel_images,
                list,
            )
            else type(
                hotel_images
            ).__name__,
        )

        image = choose_hotel_image(
            hotel_images
        )

    # ========================================================
    # PRICE
    # ========================================================

    total_price = None

    nightly_price = None

    currency = "EUR"

    rooms = (
        hotel.get("rooms")
        or []
    )

    if (
        isinstance(
            rooms,
            list,
        )
        and rooms
    ):

        selected_rate = None

        # ----------------------------------------------------
        # Find first valid rate
        # ----------------------------------------------------

        for room in rooms:

            if not isinstance(
                room,
                dict,
            ):
                continue

            rates = (
                room.get("rates")
                or []
            )

            if not isinstance(
                rates,
                list,
            ):
                continue

            for rate in rates:

                if not isinstance(
                    rate,
                    dict,
                ):
                    continue

                possible_price = (
                    rate.get("net")
                    or rate.get(
                        "sellingRate"
                    )
                    or rate.get(
                        "price"
                    )
                )

                if (
                    possible_price
                    is not None
                ):

                    selected_rate = rate

                    break

            if selected_rate:

                break

        # ----------------------------------------------------
        # Get price
        # ----------------------------------------------------

        if selected_rate:

            total_price = (
                selected_rate.get(
                    "net"
                )
                or selected_rate.get(
                    "sellingRate"
                )
                or selected_rate.get(
                    "price"
                )
            )

            currency = (
                selected_rate.get(
                    "currency"
                )
                or currency
            )

    # --------------------------------------------------------
    # Direct hotel price fallback
    # --------------------------------------------------------

    if total_price is None:

        total_price = (
            hotel.get(
                "totalPrice"
            )
            or hotel.get(
                "net"
            )
            or hotel.get(
                "price"
            )
        )

    # ========================================================
    # NIGHTS
    # ========================================================

    try:

        start = datetime.strptime(
            check_in,
            "%Y-%m-%d",
        )

        end = datetime.strptime(
            check_out,
            "%Y-%m-%d",
        )

        nights = max(
            1,
            (
                end - start
            ).days,
        )

    except Exception:

        nights = 1

    # ========================================================
    # NIGHTLY PRICE
    # ========================================================

    if total_price is not None:

        try:

            nightly_price = (
                float(
                    total_price
                )
                / nights
            )

        except Exception:

            nightly_price = None

    # ========================================================
    # FINAL HOTEL OBJECT
    # ========================================================

    return {

        "hotel_id": hotel_code,

        "code": hotel_code,

        "name": name,

        "category": category,

        "city": city,

        "destination_name":
            hotel_destination_name,

        "destination_code":
            hotel_destination_code,

        "address": address,

        "description": description,

        # Real Hotelbeds image
        "image": image,

        "image_url": image,

        # Live price
        "total_price":
            total_price,

        "nightly_price":
            nightly_price,

        "currency": currency,

        "nights": nights,

        "check_in": check_in,

        "check_out": check_out,

        "source": "Hotelbeds",

        "is_live": True,
    }


# ============================================================
# MAIN HOTEL SEARCH
# ============================================================

async def search_hotels(
    location: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    limit: int = 5,
) -> dict[str, Any]:

    # ========================================================
    # GET DESTINATION CODE
    # ========================================================

    destination_code = (
    await get_destination_code(
        location
    )
)

    print()
    print(
        "=============================================="
    )
    print(
        "          HOTELBEDS HOTEL SEARCH"
    )
    print(
        "=============================================="
    )
    print(
        "Location    :",
        location,
    )
    print(
        "Destination :",
        destination_code,
    )
    print(
        "Check-in    :",
        check_in,
    )
    print(
        "Check-out   :",
        check_out,
    )
    print(
        "Adults      :",
        adults,
    )
    print(
        "Limit       :",
        limit,
    )
    print(
        "=============================================="
    )

    # ========================================================
    # MAXIMUM 5
    # ========================================================

    requested_limit = max(
        1,
        min(
            int(limit),
            5,
        ),
    )

    # ========================================================
    # STEP 1
    # HOTEL CONTENT
    # ========================================================

    expected_country = getattr(
        get_destination_code,
        "_country_cache",
        {},
    ).get(
        str(location).strip().lower().split(",")[0].strip(),
        "",
    )

    if destination_code:
        # Normal city search.
        content_hotels = await get_hotel_content(
            destination_code=destination_code,
            limit=20,
        )
    elif expected_country:
        # No reliable city code. Search by country instead.
        # This avoids the broken MLE -> French portfolio mapping
        # seen in the Hotelbeds test environment.
        print(
            "Using country-level Hotelbeds search:",
            expected_country,
        )
        content_hotels = await get_hotel_content_by_country(
            country_code=expected_country,
            limit=20,
        )
    else:
        return {
            "success": False,
            "hotels": [],
            "error_type": "DESTINATION_NOT_SUPPORTED",
            "message": (
                "Could not resolve a Hotelbeds destination or country "
                f"for '{location}'"
            ),
            "is_live": False,
        }

    # --------------------------------------------------------
    # COUNTRY VALIDATION
    # --------------------------------------------------------
    if expected_country:
        country_filtered = []

        for hotel in content_hotels:
            hotel_country = str(
                hotel.get("countryCode")
                or hotel.get("country_code")
                or ""
            ).strip().upper()

            if hotel_country == expected_country:
                country_filtered.append(hotel)

        print(
            "Country validated hotels:",
            len(country_filtered),
            f"/ {len(content_hotels)}",
            f"(expected={expected_country})",
        )

        content_hotels = country_filtered

    if not content_hotels:

        return {

            "success": False,

            "hotels": [],

            "error_type":
                "NO_DESTINATION_HOTELS",

            "message": (
                "No Hotelbeds hotels "
                "found for "
                f"{location}"
                + (
                    f" ({destination_code})"
                    if destination_code
                    else ""
                )
            ),

            "is_live": True,
        }

    # ========================================================
    # STEP 2
    # CONTENT MAP
    # ========================================================

    content_map: dict[
        str,
        dict[str, Any]
    ] = {}

    for hotel in content_hotels:

        if not isinstance(
            hotel,
            dict,
        ):
            continue

        code = (
            hotel.get("code")
            or hotel.get(
                "hotelCode"
            )
        )

        if code:

            content_map[
                str(code)
            ] = hotel

    print(
        "Destination content map:",
        len(content_map),
    )

    # ========================================================
    # STEP 3
    # HOTEL CODES
    # ========================================================

    hotel_codes = list(
        content_map.keys()
    )

    final_hotels = []

    # Hotelbeds allows batch requests.
    batch_size = 20

    # ========================================================
    # CHECK LIVE AVAILABILITY
    # ========================================================

    for start_index in range(
        0,
        len(hotel_codes),
        batch_size,
    ):

        if (
            len(final_hotels)
            >= requested_limit
        ):

            break

        batch_codes = hotel_codes[
            start_index:
            start_index
            + batch_size
        ]

        print()
        print(
            "Checking availability batch:",
            start_index,
            "-",
            start_index
            + len(batch_codes),
        )

        availability_hotels = (
            await get_hotel_availability(

                destination_code=(
                    destination_code
                ),

                check_in=check_in,

                check_out=check_out,

                adults=adults,

                hotel_codes=batch_codes,
            )
        )

        # ====================================================
        # NORMALIZE LIVE RESULTS
        # ====================================================

        for hotel in (
            availability_hotels
        ):

            if not isinstance(
                hotel,
                dict,
            ):
                continue

            # ------------------------------------------------
            # STRICT DESTINATION CHECK
            # ------------------------------------------------

            api_destination = str(
                hotel.get(
                    "destinationCode"
                )
                or hotel.get(
                    "destination_code"
                )
                or ""
            ).upper()

            if api_destination:

                if (
                    api_destination
                    != destination_code.upper()
                ):

                    print(
                        "Skipping wrong destination:",
                        hotel.get(
                            "name"
                        ),
                        api_destination,
                    )

                    continue

            # ------------------------------------------------
            # NORMALIZE
            # ------------------------------------------------

            normalized = (
                normalize_hotel(

                    hotel=hotel,

                    content_map=(
                        content_map
                    ),

                    check_in=check_in,

                    check_out=check_out,

                    requested_location=(
                        location
                    ),

                    destination_code=(
                        destination_code
                    ),
                )
            )

            # ------------------------------------------------
            # ONLY LIVE PRICED HOTELS
            # ------------------------------------------------

            if (
                normalized.get(
                    "total_price"
                )
                is None
            ):

                print(
                    "Skipping hotel "
                    "without live price:",
                    normalized.get(
                        "name"
                    ),
                )

                continue

            final_hotels.append(
                normalized
            )

            if (
                len(final_hotels)
                >= requested_limit
            ):

                break

    # ========================================================
    # STEP 4
    # REMOVE DUPLICATES
    # ========================================================

    unique_hotels = []

    seen_codes = set()

    for hotel in final_hotels:

        code = str(
            hotel.get(
                "hotel_id"
            )
            or hotel.get(
                "code"
            )
            or ""
        )

        if not code:
            continue

        if code in seen_codes:
            continue

        seen_codes.add(
            code
        )

        unique_hotels.append(
            hotel
        )

    # ========================================================
    # MAXIMUM 5
    # ========================================================

    unique_hotels = (
        unique_hotels[
            :requested_limit
        ]
    )

    # ========================================================
    # FINAL LOG
    # ========================================================

    print()
    print(
        "=============================================="
    )
    print(
        "          FINAL HOTEL RESULTS"
    )
    print(
        "=============================================="
    )
    print(
        "Hotels returned:",
        len(unique_hotels),
    )

    for hotel in unique_hotels:

        print(
            "-",
            hotel.get("name"),
            "| code:",
            hotel.get("code"),
            "| city:",
            hotel.get("city"),
            "| destination:",
            hotel.get(
                "destination_code"
            ),
            "| price:",
            hotel.get(
                "total_price"
            ),
            hotel.get(
                "currency"
            ),
            "| image:",
            bool(
                hotel.get(
                    "image"
                )
            ),
        )

    print(
        "=============================================="
    )

    # ========================================================
    # NO LIVE RESULTS
    # ========================================================

    if not unique_hotels:

        return {

            "success": True,

            "hotels": [],

            "error_type":
                "NO_LIVE_AVAILABILITY",

            "message": (
                "No live Hotelbeds "
                "hotel availability "
                f"found for {location} "
                "for the selected dates."
            ),

            "is_live": True,
        }

    # ========================================================
    # SUCCESS
    # ========================================================

    return {

        "success": True,

        "hotels": unique_hotels,

        "error_type": None,

        "message": (
            "Live Hotelbeds hotels "
            f"fetched for {location}"
        ),

        "is_live": True,
    }


# ============================================================
# COMPATIBILITY ALIAS
# ============================================================

async def get_hotels(
    location: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    limit: int = 5,
):
    """
    Compatibility wrapper.
    """

    return await search_hotels(

        location=location,

        check_in=check_in,

        check_out=check_out,

        adults=adults,

        limit=limit,
    )