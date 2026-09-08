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

# mTLS endpoint - used for Hotel Availability
HOTELBEDS_BASE_URL = os.getenv(
    "HOTELBEDS_BASE_URL",
    "https://api-mtls.test.hotelbeds.com",
).rstrip("/")

# Normal test endpoint - used for Content API
HOTELBEDS_CONTENT_URL = os.getenv(
    "HOTELBEDS_CONTENT_URL",
    "https://api.test.hotelbeds.com",
).rstrip("/")

HOTELBEDS_CERT_PATH = os.getenv("HOTELBEDS_CERT_PATH")

HOTELBEDS_KEY_PATH = os.getenv("HOTELBEDS_KEY_PATH")

HOTELBEDS_KEY_PASSWORD = os.getenv("HOTELBEDS_KEY_PASSWORD")


# ============================================================
# BASIC VALIDATION
# ============================================================

if not HOTELBEDS_API_KEY:
    print("WARNING: HOTELBEDS_API_KEY is missing")

if not HOTELBEDS_SECRET:
    print("WARNING: HOTELBEDS_SECRET is missing")

if not HOTELBEDS_CERT_PATH:
    print("WARNING: HOTELBEDS_CERT_PATH is missing")

if not HOTELBEDS_KEY_PATH:
    print("WARNING: HOTELBEDS_KEY_PATH is missing")


# ============================================================
# DESTINATION CODE MAPPING
# ============================================================

DESTINATION_CODES = {
    "dubai": "DXB",
    "abu dhabi": "AUH",
    "maldives": "MLE",
    "male": "MLE",
    "singapore": "SIN",
    "bali": "DPS",
    "bangkok": "BKK",
    "paris": "PAR",
    "london": "LON",
    "new york": "NYC",
    "mumbai": "BOM",
    "chennai": "MAA",
    "delhi": "DEL",
    "hyderabad": "HYD",
    "goa": "GOI",
}


# ============================================================
# CREATE HOTELBEDS X-SIGNATURE
# ============================================================

def create_signature() -> str:
    """
    Hotelbeds authentication:

    SHA256(
        API_KEY + SECRET + current_unix_timestamp
    )
    """

    if not HOTELBEDS_API_KEY:
        raise ValueError("HOTELBEDS_API_KEY is missing")

    if not HOTELBEDS_SECRET:
        raise ValueError("HOTELBEDS_SECRET is missing")

    timestamp = str(int(time.time()))

    raw_string = (
        f"{HOTELBEDS_API_KEY}"
        f"{HOTELBEDS_SECRET}"
        f"{timestamp}"
    )

    signature = hashlib.sha256(
        raw_string.encode("utf-8")
    ).hexdigest()

    return signature


# ============================================================
# COMMON HEADERS
# ============================================================

def get_hotelbeds_headers() -> dict:
    return {
        "Accept": "application/json",
        "Api-key": HOTELBEDS_API_KEY,
        "X-Signature": create_signature(),
    }


# ============================================================
# DESTINATION CODE
# ============================================================

def get_destination_code(location: str) -> str:
    """
    Convert city name to Hotelbeds destination code.
    """

    if not location:
        return ""

    clean_location = location.strip().lower()

    # Already a known destination code
    for city, code in DESTINATION_CODES.items():
        if clean_location == code.lower():
            return code

    return DESTINATION_CODES.get(clean_location, "")


# ============================================================
# SSL / mTLS CLIENT
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

    if not os.path.exists(HOTELBEDS_CERT_PATH):
        raise FileNotFoundError(
            f"Certificate file not found: {HOTELBEDS_CERT_PATH}"
        )

    if not os.path.exists(HOTELBEDS_KEY_PATH):
        raise FileNotFoundError(
            f"Private key file not found: {HOTELBEDS_KEY_PATH}"
        )

    ssl_context = ssl.create_default_context()

    ssl_context.load_cert_chain(
        certfile=HOTELBEDS_CERT_PATH,
        keyfile=HOTELBEDS_KEY_PATH,
        password=HOTELBEDS_KEY_PASSWORD,
    )

    return ssl_context


# ============================================================
# HOTEL IMAGE URL
# ============================================================

def build_hotel_image(image_path: str | None) -> str:
    """
    Hotelbeds image path -> full image URL.

    Hotelbeds documentation:
    https://photos.hotelbeds.com/giata/ + image path
    """

    if not image_path:
        return ""

    image_path = str(image_path).lstrip("/")

    # Already a complete URL
    if image_path.startswith("http://"):
        return image_path

    if image_path.startswith("https://"):
        return image_path

    return (
        "https://photos.hotelbeds.com/giata/"
        + image_path
    )


# ============================================================
# CONTENT API
# ============================================================

async def get_hotel_content(
    destination_code: str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """
    Retrieve static hotel content.

    IMPORTANT:
    This uses Hotelbeds Content API.

    Endpoint:
    https://api.test.hotelbeds.com/
    hotel-content-api/1.0/hotels
    """

    url = (
        f"{HOTELBEDS_CONTENT_URL}"
        "/hotel-content-api/1.0/hotels"
    )

    params = {
        "fields": "all",
        "language": "ENG",
        "from": 1,
        "to": min(limit, 1000),
        "useSecondaryLanguage": "false",
    }

    headers = get_hotelbeds_headers()

    print()
    print("==============================================")
    print("       HOTELBEDS CONTENT REQUEST")
    print("==============================================")
    print("Content URL :", url)
    print("Destination :", destination_code)
    print("From        :", params["from"])
    print("To          :", params["to"])
    print("==============================================")

    try:

        async with httpx.AsyncClient(
            verify=True,
            timeout=30,
        ) as client:

            response = await client.get(
                url,
                params=params,
                headers=headers,
            )

        print(
            "Hotelbeds Content Status:",
            response.status_code,
        )

        if response.status_code != 200:

            print()
            print("==============================================")
            print("       HOTELBEDS CONTENT ERROR")
            print("==============================================")
            print("Status:", response.status_code)
            print("Response:", response.text)
            print("==============================================")

            return []

        data = response.json()

        hotels = data.get("hotels", [])

        print(
            "Hotelbeds content hotels:",
            len(hotels),
        )

        return hotels

    except Exception as exc:

        print()
        print("==============================================")
        print("       HOTELBEDS CONTENT EXCEPTION")
        print("==============================================")
        print("Error:", str(exc))
        print("==============================================")

        return []


# ============================================================
# HOTEL AVAILABILITY API
# ============================================================

async def get_hotel_availability(
    destination_code: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    hotel_codes: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Search real hotel availability and prices.

    Hotelbeds Booking API is the dynamic API.
    """

    url = (
        f"{HOTELBEDS_BASE_URL}"
        "/hotel-api/1.0/hotels"
    )

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json",
        "Api-key": HOTELBEDS_API_KEY,
        "X-Signature": create_signature(),
    }

    # --------------------------------------------------------
    # HOTEL CODE FILTER
    # --------------------------------------------------------

    hotels_object = {}

    if hotel_codes:
        hotels_object["hotel"] = [
            str(code)
            for code in hotel_codes
            if code
        ]

    # --------------------------------------------------------
    # REQUEST PAYLOAD
    # --------------------------------------------------------

    payload = {
        "stay": {
            "checkIn": check_in,
            "checkOut": check_out,
        },
        "occupancies": [
            {
                "rooms": 1,
                "adults": max(1, int(adults)),
                "children": 0,
            }
        ],
    }

    if hotels_object:
        payload["hotels"] = hotels_object

    print()
    print("==============================================")
    print("       HOTELBEDS AVAILABILITY REQUEST")
    print("==============================================")
    print("Availability URL :", url)
    print("Destination      :", destination_code)
    print("Check-in         :", check_in)
    print("Check-out        :", check_out)
    print("Adults           :", adults)
    print("Hotel codes      :", hotel_codes)
    print("==============================================")

    try:

        ssl_context = create_ssl_context()

        async with httpx.AsyncClient(
            verify=ssl_context,
            timeout=45,
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
            print("==============================================")
            print("    HOTELBEDS AVAILABILITY ERROR")
            print("==============================================")
            print("Status:", response.status_code)
            print("Response:", response.text)
            print("==============================================")

            return []

        data = response.json()

        hotels = data.get("hotels", {})

        if isinstance(hotels, dict):
            hotel_list = hotels.get("hotels", [])
        elif isinstance(hotels, list):
            hotel_list = hotels
        else:
            hotel_list = []

        print(
            "Hotelbeds availability hotels:",
            len(hotel_list),
        )

        return hotel_list

    except Exception as exc:

        print()
        print("==============================================")
        print("   HOTELBEDS AVAILABILITY EXCEPTION")
        print("==============================================")
        print("Error:", str(exc))
        print("==============================================")

        return []


# ============================================================
# NORMALIZE HOTEL
# ============================================================

def normalize_hotel(
    hotel: dict[str, Any],
    content_map: dict[str, dict[str, Any]],
    check_in: str,
    check_out: str,
) -> dict[str, Any]:

    hotel_code = str(
        hotel.get("code")
        or hotel.get("hotelCode")
        or ""
    )

    content = content_map.get(
        hotel_code,
        {},
    )

    # --------------------------------------------------------
    # HOTEL NAME
    # --------------------------------------------------------

    name = (
        hotel.get("name")
        or content.get("name")
        or "Hotel"
    )

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    category = (
        hotel.get("categoryName")
        or hotel.get("category")
        or content.get("categoryName")
        or content.get("category")
        or ""
    )

    # --------------------------------------------------------
    # ADDRESS
    # --------------------------------------------------------

    address = (
        hotel.get("address")
        or content.get("address")
        or ""
    )

    # --------------------------------------------------------
    # CITY
    # --------------------------------------------------------

    city = (
        hotel.get("city")
        or content.get("city")
        or ""
    )

    # --------------------------------------------------------
    # DESCRIPTION
    # --------------------------------------------------------

    description = (
        hotel.get("description")
        or content.get("description")
        or ""
    )

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    image = ""

    content_images = content.get("images") or []

    if isinstance(content_images, list):

        for img in content_images:

            if not isinstance(img, dict):
                continue

            image_path = (
                img.get("path")
                or img.get("imagePath")
                or img.get("url")
            )

            if image_path:
                image = build_hotel_image(
                    image_path
                )
                break

    # Try availability response images
    if not image:

        hotel_images = hotel.get("images") or []

        if isinstance(hotel_images, list):

            for img in hotel_images:

                if isinstance(img, dict):

                    image_path = (
                        img.get("path")
                        or img.get("imagePath")
                        or img.get("url")
                    )

                    if image_path:
                        image = build_hotel_image(
                            image_path
                        )
                        break

                elif isinstance(img, str):

                    image = build_hotel_image(img)
                    break

    # --------------------------------------------------------
    # PRICE
    # --------------------------------------------------------

    total_price = None
    nightly_price = None
    currency = "EUR"

    rooms = hotel.get("rooms") or []

    if isinstance(rooms, list) and rooms:

        first_room = rooms[0]

        if isinstance(first_room, dict):

            rates = first_room.get("rates") or []

            if isinstance(rates, list) and rates:

                first_rate = rates[0]

                if isinstance(first_rate, dict):

                    total_price = (
                        first_rate.get("net")
                        or first_rate.get("sellingRate")
                        or first_rate.get("price")
                    )

                    currency = (
                        first_rate.get("currency")
                        or currency
                    )

    # Some responses may expose net directly
    if total_price is None:

        total_price = (
            hotel.get("totalPrice")
            or hotel.get("net")
            or hotel.get("price")
        )

    # --------------------------------------------------------
    # NIGHTS
    # --------------------------------------------------------

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
            (end - start).days,
        )

    except Exception:

        nights = 1

    # --------------------------------------------------------
    # NIGHTLY PRICE
    # --------------------------------------------------------

    if total_price is not None:

        try:
            nightly_price = (
                float(total_price) / nights
            )
        except Exception:
            nightly_price = None

    # --------------------------------------------------------
    # FINAL OBJECT
    # --------------------------------------------------------

    return {
        "hotel_id": hotel_code,
        "code": hotel_code,
        "name": name,
        "category": category,
        "city": city,
        "address": address,
        "description": description,
        "image": image,
        "image_url": image,
        "total_price": total_price,
        "nightly_price": nightly_price,
        "currency": currency,
        "nights": nights,
        "check_in": check_in,
        "check_out": check_out,
    }


# ============================================================
# MAIN HOTEL SEARCH FUNCTION
# ============================================================

async def search_hotels(
    location: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    limit: int = 5,
) -> list[dict[str, Any]]:

    destination_code = get_destination_code(location)

    print()
    print("==============================================")
    print("          HOTELBEDS HOTEL SEARCH")
    print("==============================================")
    print("Location    :", location)
    print("Destination :", destination_code)
    print("Check-in    :", check_in)
    print("Check-out   :", check_out)
    print("Adults      :", adults)
    print("Limit       :", limit)
    print("==============================================")

    if not destination_code:

        print(
            "No Hotelbeds destination code found for:",
            location,
        )

        return []

    # --------------------------------------------------------
    # STEP 1
    # GET HOTEL CONTENT
    # --------------------------------------------------------

    content_hotels = await get_hotel_content(
        destination_code=destination_code,
        limit=20,
    )

    # --------------------------------------------------------
    # CONTENT MAP
    # --------------------------------------------------------

    content_map = {}

    for hotel in content_hotels:

        if not isinstance(hotel, dict):
            continue

        code = (
            hotel.get("code")
            or hotel.get("hotelCode")
        )

        if code:
            content_map[str(code)] = hotel

    print(
        "Content map hotels:",
        len(content_map),
    )

    # --------------------------------------------------------
    # STEP 2
    # AVAILABILITY
    # --------------------------------------------------------

    hotel_codes = list(
        content_map.keys()
    )[:20]

    availability_hotels = await get_hotel_availability(
        destination_code=destination_code,
        check_in=check_in,
        check_out=check_out,
        adults=adults,
        hotel_codes=hotel_codes,
    )

    # --------------------------------------------------------
    # IF AVAILABILITY RETURNS DATA
    # --------------------------------------------------------

    final_hotels = []

    for hotel in availability_hotels:

        if not isinstance(hotel, dict):
            continue

        normalized = normalize_hotel(
            hotel=hotel,
            content_map=content_map,
            check_in=check_in,
            check_out=check_out,
        )

        final_hotels.append(normalized)

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------
    # If availability returns nothing, use content hotels
    # so the frontend can still display hotel information.

    if not final_hotels:

        print(
            "No availability results."
            " Using content hotels as fallback."
        )

        for hotel in content_hotels:

            if not isinstance(hotel, dict):
                continue

            normalized = normalize_hotel(
                hotel=hotel,
                content_map=content_map,
                check_in=check_in,
                check_out=check_out,
            )

            final_hotels.append(normalized)

    # --------------------------------------------------------
    # REMOVE DUPLICATES
    # --------------------------------------------------------

    unique_hotels = []

    seen_codes = set()

    for hotel in final_hotels:

        code = str(
            hotel.get("hotel_id")
            or hotel.get("code")
            or ""
        )

        if code in seen_codes:
            continue

        seen_codes.add(code)

        unique_hotels.append(hotel)

    # --------------------------------------------------------
    # MAX 5 HOTELS
    # --------------------------------------------------------

    unique_hotels = unique_hotels[
        :max(1, min(limit, 5))
    ]

    print()
    print("==============================================")
    print("          FINAL HOTEL RESULTS")
    print("==============================================")
    print(
        "Hotels returned:",
        len(unique_hotels),
    )

    for hotel in unique_hotels:

        print(
            "-",
            hotel.get("name"),
            "|",
            hotel.get("code"),
            "|",
            hotel.get("image"),
        )

    print("==============================================")

    return {
    "success": True,
    "hotels": unique_hotels,
    "error_type": None,
    "message": "Hotels fetched successfully",
    "is_live": True,
}

# ============================================================
# OPTIONAL ALIAS
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