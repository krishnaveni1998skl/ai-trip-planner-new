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

    # =====================================================
    # GEOAPIFY PLACES API
    # =====================================================

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
        f"radius={radius}m, "
        f"limit={limit}"
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

    features = data.get(
        "features",
        []
    )

    print(
        f"Geoapify returned "
        f"{len(features)} restaurant features"
    )

    # =====================================================
    # PARSE RESTAURANTS
    # =====================================================

    for feature in features:

        properties = feature.get(
            "properties",
            {}
        )

        coordinates = (
            feature
            .get("geometry", {})
            .get("coordinates", [])
        )

        # -------------------------------------------------
        # PLACE ID
        # -------------------------------------------------

        place_id = properties.get(
            "place_id"
        )

        # -------------------------------------------------
        # RESTAURANT IMAGE
        # -------------------------------------------------

        restaurant_image = None

        if place_id:

            details_url = (
                "https://api.geoapify.com/v2/place-details"
            )

            details_params = {
                "id": place_id,
                "lang": "en",
                "apiKey": api_key,
            }

            print(
                f"Checking image for: "
                f"{properties.get('name', 'Restaurant')}"
            )

            details_result = await safe_get(
                url=details_url,
                params=details_params,
                timeout=30,
                retries=1,
            )

            if details_result.get("success"):

                details_data = details_result.get(
                    "data",
                    {}
                )

                detail_features = (
                    details_data.get(
                        "features",
                        []
                    )
                )

                for detail_feature in detail_features:

                    detail_properties = (
                        detail_feature.get(
                            "properties",
                            {}
                        )
                    )

                    wiki_media = (
                        detail_properties.get(
                            "wiki_and_media",
                            {}
                        )
                    )

                    restaurant_image = (
                        wiki_media.get(
                            "image"
                        )
                    )

                    if restaurant_image:
                        print(
                            f"Image found for: "
                            f"{properties.get('name', 'Restaurant')}"
                        )
                        break

            if not restaurant_image:
                print(
                    f"No image found for: "
                    f"{properties.get('name', 'Restaurant')}"
                )

        # -------------------------------------------------
        # ADD RESTAURANT
        # -------------------------------------------------

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

                "place_id": place_id,

                "image": restaurant_image,
            }
        )

    # =====================================================
    # FINAL RESULT COUNT
    # =====================================================

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