import os
import httpx

from dotenv import load_dotenv

load_dotenv()


# =====================================================
# GEOAPIFY RESTAURANT SEARCH
# =====================================================

async def search_restaurants(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    limit: int = 5,
):
    """
    Search nearby restaurants using Geoapify.

    Maximum 5 restaurants are returned.
    Restaurant images are fetched using
    Geoapify Place Details API when available.
    """

    # =====================================================
    # API KEY
    # =====================================================

    api_key = os.getenv(
        "GEOAPIFY_API_KEY"
    )

    if not api_key:
        print(
            "ERROR: GEOAPIFY_API_KEY is missing."
        )

        return {
            "success": False,
            "restaurants": [],
            "error_type": "configuration_error",
            "message": (
                "Restaurant API is not configured."
            ),
            "is_live": False,
        }

    # =====================================================
    # VALIDATION
    # =====================================================

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):

        return {
            "success": False,
            "restaurants": [],
            "error_type": "validation_error",
            "message": (
                "Invalid latitude or longitude."
            ),
            "is_live": False,
        }

    if radius <= 0:

        return {
            "success": False,
            "restaurants": [],
            "error_type": "validation_error",
            "message": (
                "Radius must be greater than 0."
            ),
            "is_live": False,
        }

    # -----------------------------------------------------
    # FORCE MAXIMUM 5
    # -----------------------------------------------------

    limit = min(
        max(int(limit), 1),
        5,
    )

    print(
        "\n"
        "========================================"
    )

    print(
        "GEOAPIFY RESTAURANT SEARCH"
    )

    print(
        "========================================"
    )

    print(
        f"Latitude  : {latitude}"
    )

    print(
        f"Longitude : {longitude}"
    )

    print(
        f"Radius    : {radius}m"
    )

    print(
        f"Limit     : {limit}"
    )

    # =====================================================
    # GEOAPIFY PLACES API
    # =====================================================

    places_url = (
        "https://api.geoapify.com/v2/places"
    )

    places_params = {
        "categories": (
            "catering.restaurant"
        ),

        "filter": (
            f"circle:"
            f"{longitude},"
            f"{latitude},"
            f"{radius}"
        ),

        "bias": (
            f"proximity:"
            f"{longitude},"
            f"{latitude}"
        ),

        "limit": limit,

        "lang": "en",

        "apiKey": api_key,
    }

    print(
        "\nCalling Geoapify Places API..."
    )

    # =====================================================
    # DIRECT HTTPX REQUEST
    # =====================================================

    try:

        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
        ) as client:

            response = await client.get(
                places_url,
                params=places_params,
            )

        print(
            "Geoapify Places Status:",
            response.status_code,
        )

    except httpx.TimeoutException:

        print(
            "Geoapify request timed out."
        )

        return {
            "success": False,
            "restaurants": [],
            "error_type": "timeout",
            "message": (
                "Restaurant service timed out."
            ),
            "is_live": False,
        }

    except httpx.RequestError as exc:

        print(
            "Geoapify connection error:",
            str(exc),
        )

        return {
            "success": False,
            "restaurants": [],
            "error_type": "request_error",
            "message": (
                "Unable to connect to "
                "Geoapify restaurant service."
            ),
            "is_live": False,
        }

    # =====================================================
    # HTTP ERROR
    # =====================================================

    if response.status_code != 200:

        try:
            error_data = response.json()
        except Exception:
            error_data = {}

        print(
            "Geoapify API ERROR:"
        )

        print(
            error_data
        )

        if response.status_code == 401:

            message = (
                "Geoapify API key is invalid."
            )

            error_type = (
                "authentication_error"
            )

        elif response.status_code == 403:

            message = (
                "Geoapify API access denied."
            )

            error_type = (
                "access_denied"
            )

        elif response.status_code == 429:

            message = (
                "Geoapify API quota exceeded."
            )

            error_type = (
                "rate_limit"
            )

        else:

            message = (
                error_data.get(
                    "message"
                )
                or error_data.get(
                    "error"
                )
                or (
                    "Geoapify restaurant "
                    "API request failed."
                )
            )

            error_type = (
                "restaurant_api_error"
            )

        return {
            "success": False,
            "restaurants": [],
            "error_type": error_type,
            "message": message,
            "is_live": False,
        }

    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        data = response.json()

    except Exception as exc:

        print(
            "Geoapify JSON error:",
            str(exc),
        )

        return {
            "success": False,
            "restaurants": [],
            "error_type": (
                "invalid_response"
            ),
            "message": (
                "Geoapify returned invalid data."
            ),
            "is_live": False,
        }

    # =====================================================
    # FEATURES
    # =====================================================

    features = data.get(
        "features",
        [],
    )

    if not isinstance(
        features,
        list,
    ):
        features = []

    print(
        f"Geoapify returned "
        f"{len(features)} restaurant features."
    )

    # =====================================================
    # RESTAURANT LIST
    # =====================================================

    restaurants = []

    # Only process maximum 5
    features = features[:5]

    # =====================================================
    # PROCESS EACH RESTAURANT
    # =====================================================

    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
    ) as client:

        for index, feature in enumerate(
            features,
            start=1,
        ):

            properties = feature.get(
                "properties",
                {},
            )

            geometry = feature.get(
                "geometry",
                {},
            )

            coordinates = geometry.get(
                "coordinates",
                [],
            )

            # -------------------------------------------------
            # NAME
            # -------------------------------------------------

            name = properties.get(
                "name"
            )

            if not name:

                name = (
                    "Restaurant "
                    f"{index}"
                )

            # -------------------------------------------------
            # PLACE ID
            # -------------------------------------------------

            place_id = properties.get(
                "place_id"
            )

            # -------------------------------------------------
            # COORDINATES
            # -------------------------------------------------

            restaurant_longitude = None
            restaurant_latitude = None

            if (
                isinstance(
                    coordinates,
                    list,
                )
                and len(coordinates) >= 2
            ):

                restaurant_longitude = (
                    coordinates[0]
                )

                restaurant_latitude = (
                    coordinates[1]
                )

            # -------------------------------------------------
            # BASIC IMAGE
            # -------------------------------------------------

            restaurant_image = None

            # Some responses can contain
            # wiki/media information directly.
            wiki_and_media = properties.get(
                "wiki_and_media",
                {},
            )

            if isinstance(
                wiki_and_media,
                dict,
            ):

                restaurant_image = (
                    wiki_and_media.get(
                        "image"
                    )
                )

            # =================================================
            # PLACE DETAILS → IMAGE
            # =================================================

            if (
                not restaurant_image
                and place_id
            ):

                details_url = (
                    "https://api.geoapify.com/"
                    "v2/place-details"
                )

                details_params = {
                    "id": place_id,
                    "features": "details",
                    "lang": "en",
                    "apiKey": api_key,
                }

                print(
                    f"[{index}/"
                    f"{len(features)}] "
                    f"Checking image: "
                    f"{name}"
                )

                try:

                    details_response = (
                        await client.get(
                            details_url,
                            params=details_params,
                        )
                    )

                    print(
                        "   Details status:",
                        details_response.status_code,
                    )

                    if (
                        details_response.status_code
                        == 200
                    ):

                        details_data = (
                            details_response.json()
                        )

                        detail_features = (
                            details_data.get(
                                "features",
                                [],
                            )
                        )

                        if isinstance(
                            detail_features,
                            list,
                        ):

                            # Find details feature
                            for detail_feature in (
                                detail_features
                            ):

                                detail_properties = (
                                    detail_feature.get(
                                        "properties",
                                        {},
                                    )
                                )

                                # -------------------------
                                # WIKI / MEDIA
                                # -------------------------

                                detail_wiki = (
                                    detail_properties.get(
                                        "wiki_and_media",
                                        {},
                                    )
                                )

                                if isinstance(
                                    detail_wiki,
                                    dict,
                                ):

                                    restaurant_image = (
                                        detail_wiki.get(
                                            "image"
                                        )
                                    )

                                if restaurant_image:
                                    break

                        if restaurant_image:

                            print(
                                "   Image found."
                            )

                        else:

                            print(
                                "   No image found."
                            )

                except Exception as exc:

                    print(
                        "   Image lookup error:",
                        str(exc),
                    )

            # =================================================
            # CATEGORY
            # =================================================

            categories = properties.get(
                "categories",
                [],
            )

            if not isinstance(
                categories,
                list,
            ):
                categories = []

            # =================================================
            # CONTACT
            # =================================================

            contact = properties.get(
                "contact",
                {},
            )

            if not isinstance(
                contact,
                dict,
            ):
                contact = {}

            # =================================================
            # RESTAURANT OBJECT
            # =================================================

            restaurants.append(
                {
                    "id": (
                        place_id
                        or f"restaurant-{index}"
                    ),

                    "name": name,

                    "address": (
                        properties.get(
                            "formatted"
                        )
                        or properties.get(
                            "address_line1"
                        )
                        or "Address unavailable"
                    ),

                    "city": (
                        properties.get(
                            "city"
                        )
                    ),

                    "country": (
                        properties.get(
                            "country"
                        )
                    ),

                    "latitude": (
                        restaurant_latitude
                    ),

                    "longitude": (
                        restaurant_longitude
                    ),

                    "category": categories,

                    "distance": (
                        properties.get(
                            "distance"
                        )
                    ),

                    "website": (
                        properties.get(
                            "website"
                        )
                    ),

                    "phone": (
                        contact.get(
                            "phone"
                        )
                    ),

                    "place_id": place_id,

                    "image": restaurant_image,

                    # Frontend fallback fields
                    "image_url": (
                        restaurant_image
                    ),

                    "photo": (
                        restaurant_image
                    ),

                    "photo_url": (
                        restaurant_image
                    ),

                    "rating": (
                        properties.get(
                            "rating"
                        )
                    ),
                }
            )

    # =====================================================
    # FINAL LIMIT = 5
    # =====================================================

    restaurants = restaurants[:5]

    print(
        "\n"
        "========================================"
    )

    print(
        "FINAL RESTAURANT RESULTS"
    )

    print(
        "========================================"
    )

    print(
        f"Restaurants returned: "
        f"{len(restaurants)}"
    )

    for index, restaurant in enumerate(
        restaurants,
        start=1,
    ):

        print(
            f"{index}. "
            f"{restaurant['name']} | "
            f"Image: "
            f"{'YES' if restaurant.get('image') else 'NO'}"
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
        "message": (
            "Restaurants fetched successfully"
        ),
        "is_live": True,
    }