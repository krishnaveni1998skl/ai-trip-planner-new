import os
from datetime import datetime

from dotenv import load_dotenv

from app.utils.api_helpers import safe_get

load_dotenv()

STAYAPI_URL = "https://api.stayapi.com/v1/google_hotels/search"


def get_number(value):
    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        try:
            return float(
                value.replace(",", "")
                .replace("₹", "")
                .replace("$", "")
                .strip()
            )
        except ValueError:
            return None

    return None


async def search_hotels(
    location: str,
    check_in: str,
    check_out: str,
    adults: int = 2,
    platforms: list[str] | None = None,
    limit: int = 10,
):
    # =====================================================
    # API KEY
    # =====================================================

    api_key = os.getenv("STAYAPI_API_KEY")

    if not api_key:
        return {
            "success": False,
            "hotels": [],
            "error_type": "configuration_error",
            "message": "Hotel API is not configured.",
            "is_live": False,
        }

    # =====================================================
    # INPUT VALIDATION
    # =====================================================

    if not location:
        return {
            "success": False,
            "hotels": [],
            "error_type": "validation_error",
            "message": "Hotel location is required.",
            "is_live": False,
        }

    if not check_in or not check_out:
        return {
            "success": False,
            "hotels": [],
            "error_type": "validation_error",
            "message": "Check-in and check-out dates are required.",
            "is_live": False,
        }

    # =====================================================
    # DATE VALIDATION
    # =====================================================

    try:
        start_date = datetime.strptime(
            check_in,
            "%Y-%m-%d"
        )

        end_date = datetime.strptime(
            check_out,
            "%Y-%m-%d"
        )

        nights = (
            end_date - start_date
        ).days

    except ValueError:
        return {
            "success": False,
            "hotels": [],
            "error_type": "validation_error",
            "message": "Dates must be in YYYY-MM-DD format.",
            "is_live": False,
        }

    if nights <= 0:
        return {
            "success": False,
            "hotels": [],
            "error_type": "validation_error",
            "message": "Check-out date must be after check-in date.",
            "is_live": False,
        }

    # =====================================================
    # ADULT VALIDATION
    # =====================================================

    if adults < 1:
        adults = 1

    if adults > 10:
        adults = 10

    # =====================================================
    # LOCATION
    # =====================================================

    search_location = location.strip()

    # Maldives → Male
    if search_location.lower() == "maldives":
        search_location = "Male, Maldives"

    # =====================================================
    # REQUEST PARAMETERS
    # =====================================================

    params = {
        "location": search_location,
        "check_in": check_in,
        "check_out": check_out,
        "adults": adults,
        "currency": "INR",
    }

    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json",
    }

    print("\n========================================")
    print("STAYAPI HOTEL SEARCH")
    print("========================================")
    print(f"Location : {search_location}")
    print(f"Check-in : {check_in}")
    print(f"Check-out: {check_out}")
    print(f"Adults   : {adults}")
    print(f"Nights   : {nights}")
    print("========================================")

    # =====================================================
    # SAFE API REQUEST
    # =====================================================

    result = await safe_get(
        url=STAYAPI_URL,
        params=params,
        headers=headers,
        timeout=60,
        retries=1,
    )

    # =====================================================
    # HANDLE API ERROR
    # =====================================================

    if not result.get("success"):

        error_type = result.get(
            "error_type",
            "hotel_api_error"
        )

        message = result.get(
            "message",
            "Hotel service unavailable"
        )

        print(
            f"StayAPI error: "
            f"{error_type} - {message}"
        )

        return {
            "success": False,
            "hotels": [],
            "error_type": error_type,
            "message": message,
            "is_live": False,
        }

    # =====================================================
    # READ RESPONSE
    # =====================================================

    data = result.get(
        "data",
        {}
    )

    hotels_data = data.get(
        "hotels",
        []
    )

    print(
        "StayAPI hotels found:",
        len(hotels_data)
    )

    # =====================================================
    # NO RESULTS
    # =====================================================

    if not hotels_data:

        return {
            "success": True,
            "hotels": [],
            "error_type": "no_results",
            "message": (
                "No hotels found for the "
                "selected location and dates."
            ),
            "is_live": True,
        }

    hotels = []

    # =====================================================
    # PARSE HOTELS
    # =====================================================

    for index, hotel in enumerate(
        hotels_data[:limit],
        start=1
    ):

        if not isinstance(
            hotel,
            dict
        ):
            continue

        # -----------------------------------------------
        # BASIC DETAILS
        # -----------------------------------------------

        hotel_id = hotel.get(
            "hotel_id"
        )

        name = hotel.get(
            "name",
            "Unknown Hotel"
        )

        description = hotel.get(
            "description"
        )

        # -----------------------------------------------
        # LOCATION
        # -----------------------------------------------

        location_data = hotel.get(
            "location",
            {}
        )

        if not isinstance(
            location_data,
            dict
        ):
            location_data = {}

        address = location_data.get(
            "address"
        )

        latitude = location_data.get(
            "latitude"
        )

        longitude = location_data.get(
            "longitude"
        )

        # -----------------------------------------------
        # PRICE
        # -----------------------------------------------

        price_data = hotel.get(
            "price",
            {}
        )

        if not isinstance(
            price_data,
            dict
        ):
            price_data = {}

        price_per_night = get_number(
            price_data.get(
                "price_per_night"
            )
        )

        current_price = get_number(
            price_data.get(
                "current"
            )
        )

        if price_per_night is None:
            price_per_night = current_price

        total_price = None

        if price_per_night is not None:
            total_price = (
                price_per_night * nights
            )

        currency = (
            price_data.get(
                "currency"
            )
            or "INR"
        )

        # -----------------------------------------------
        # RATING
        # -----------------------------------------------

        rating_data = hotel.get(
            "rating",
            {}
        )

        if not isinstance(
            rating_data,
            dict
        ):
            rating_data = {}

        rating = get_number(
            rating_data.get(
                "value"
            )
        )

        rating_votes = rating_data.get(
            "votes"
        )

        # -----------------------------------------------
        # AMENITIES
        # -----------------------------------------------

        amenities = hotel.get(
            "amenities",
            []
        )

        if not isinstance(
            amenities,
            list
        ):
            amenities = []

        # -----------------------------------------------
        # IMAGES
        # -----------------------------------------------

        images = hotel.get(
            "images",
            []
        )

        if not isinstance(
            images,
            list
        ):
            images = []

        image = (
            images[0]
            if images
            and isinstance(
                images[0],
                str
            )
            else None
        )

        # -----------------------------------------------
        # RESULT
        # -----------------------------------------------

        hotel_result = {
            "id": f"stayapi-hotel-{index}",

            "hotel_id": hotel_id,

            "name": name,

            "type": "hotel",

            "description": description,

            "address": address,

            "location": search_location,

            "latitude": latitude,

            "longitude": longitude,

            "rating": rating,

            "rating_votes": rating_votes,

            "stars": hotel.get(
                "stars"
            ),

            "price_per_night": (
                price_per_night
            ),

            "total_price": (
                total_price
            ),

            "currency": currency,

            "nights": nights,

            "check_in": check_in,

            "check_out": check_out,

            "image": image,

            "images": images,

            "amenities": amenities,

            "check_in_time": hotel.get(
                "check_in_time"
            ),

            "check_out_time": hotel.get(
                "check_out_time"
            ),

            "is_paid": hotel.get(
                "is_paid",
                False
            ),

            "source": (
                "StayAPI - Google Hotels"
            ),

            "is_live": True,
        }

        hotels.append(
            hotel_result
        )

    print(
        "Parsed hotels:",
        len(hotels)
    )

    return {
        "success": True,
        "hotels": hotels,
        "error_type": None,
        "message": "Hotels fetched successfully",
        "is_live": True,
    }