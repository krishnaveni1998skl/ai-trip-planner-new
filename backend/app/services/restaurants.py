import os
from dotenv import load_dotenv

from app.utils.api_helpers import safe_get

load_dotenv()


async def search_restaurants(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    limit: int = 10,
):
    # =====================================================
    # API KEY
    # =====================================================

    api_key = os.getenv("GEOAPIFY_API_KEY")

    if not api_key:
        return {
            "success": False,
            "restaurants": [],
            "error_type": "configuration_error",
            "message": "Restaurant API is not configured.",
            "is_live": False,
        }

    # =====================================================
    # INPUT VALIDATION
    # =====================================================

    if radius <= 0:
        return {
            "success": False,
            "restaurants": [],
            "error_type": "validation_error",
            "message": "Radius must be greater than 0.",
            "is_live": False,
        }

    if limit <= 0:
        return {
            "success": False,
            "restaurants": [],
            "error_type": "validation_error",
            "message": "Limit must be greater than 0.",
            "is_live": False,
        }

    url = "https://api.geoapify.com/v2/places"

    params = {
        "categories": "catering.restaurant",
        "filter": f"circle:{longitude},{latitude},{radius}",
        "bias": f"proximity:{longitude},{latitude}",
        "limit": limit,
        "lang": "en",
        "apiKey": api_key,
    }

    print(
        f"Restaurant search: "
        f"lat={latitude}, "
        f"lon={longitude}, "
        f"radius={radius}m"
    )

    # =====================================================
    # SAFE API REQUEST
    # =====================================================

    result = await safe_get(
        url=url,
        params=params,
        timeout=30,
        retries=1,
    )

    # =====================================================
    # HANDLE API ERROR
    # =====================================================

    if not result.get("success"):

        error_type = result.get(
            "error_type",
            "restaurant_api_error",
        )

        message = result.get(
            "message",
            "Restaurant service unavailable",
        )

        print(
            f"Restaurant API error: "
            f"{error_type} - {message}"
        )

        return {
            "success": False,
            "restaurants": [],
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

    restaurants = []

    # =====================================================
    # PARSE RESTAURANTS
    # =====================================================

    for feature in data.get(
        "features",
        []
    ):

        properties = feature.get(
            "properties",
            {}
        )

        coordinates = (
            feature
            .get("geometry", {})
            .get("coordinates", [])
        )

        restaurants.append(
            {
                "name": properties.get(
                    "name",
                    "Restaurant"
                ),

                "address": properties.get(
                    "formatted"
                ),

                "city": properties.get(
                    "city"
                ),

                "country": properties.get(
                    "country"
                ),

                "latitude": (
                    coordinates[1]
                    if len(coordinates) >= 2
                    else None
                ),

                "longitude": (
                    coordinates[0]
                    if len(coordinates) >= 2
                    else None
                ),

                "category": properties.get(
                    "categories",
                    []
                ),

                "distance": properties.get(
                    "distance"
                ),

                "website": properties.get(
                    "website"
                ),

                "phone": properties.get(
                    "contact",
                    {}
                ).get("phone"),

                "place_id": properties.get(
                    "place_id"
                ),
            }
        )

    print(
        f"Restaurants found: "
        f"{len(restaurants)}"
    )

    # =====================================================
    # NO RESULTS
    # =====================================================

    if not restaurants:

        return {
            "success": True,
            "restaurants": [],
            "error_type": "no_results",
            "message": (
                "No restaurants found "
                "for this location."
            ),
            "is_live": True,
        }

    # =====================================================
    # SUCCESS
    # =====================================================

    return {
        "success": True,
        "restaurants": restaurants,
        "error_type": None,
        "message": "Restaurants fetched successfully",
        "is_live": True,
    }