import os
import httpx

from dotenv import load_dotenv

load_dotenv()


# =====================================================
# PEXELS IMAGE SEARCH
# =====================================================

async def get_pexels_restaurant_image(
    client: httpx.AsyncClient,
    restaurant_name: str,
    city: str | None = None,
):
    """
    Get a restaurant-related image from Pexels.

    First tries:
        restaurant name + city

    Then tries:
        restaurant name + restaurant

    Then:
        restaurant food
    """

    pexels_api_key = os.getenv("PEXELS_API_KEY")

    if not pexels_api_key:
        print("   Pexels API key not configured.")
        return None

    headers = {
        "Authorization": pexels_api_key,
    }

    # -------------------------------------------------
    # SEARCH QUERIES
    # -------------------------------------------------

    queries = []

    if restaurant_name and city:
        queries.append(
            f"{restaurant_name} {city} restaurant"
        )

    if restaurant_name:
        queries.append(
            f"{restaurant_name} restaurant"
        )

    queries.append("restaurant food")

    # Remove duplicate queries
    queries = list(dict.fromkeys(queries))

    # -------------------------------------------------
    # TRY EACH QUERY
    # -------------------------------------------------

    for query in queries:

        print(
            f"   Pexels image search: {query}"
        )

        params = {
            "query": query,
            "per_page": 5,
            "orientation": "landscape",
            "locale": "en-US",
        }

        try:

            response = await client.get(
                "https://api.pexels.com/v1/search",
                params=params,
                headers=headers,
            )

            print(
                "   Pexels status:",
                response.status_code,
            )

            # -----------------------------------------
            # SUCCESS
            # -----------------------------------------

            if response.status_code == 200:

                data = response.json()

                photos = data.get(
                    "photos",
                    [],
                )

                if photos:

                    # Take first available photo
                    photo = photos[0]

                    src = photo.get(
                        "src",
                        {},
                    )

                    # Prefer landscape image
                    image_url = (
                        src.get("landscape")
                        or src.get("large")
                        or src.get("medium")
                        or src.get("original")
                    )

                    if image_url:

                        print(
                            "   Pexels image found."
                        )

                        return {
                            "image": image_url,
                            "photo_url": photo.get(
                                "url"
                            ),
                            "photographer": photo.get(
                                "photographer"
                            ),
                            "photographer_url": photo.get(
                                "photographer_url"
                            ),
                        }

            # -----------------------------------------
            # AUTH ERROR
            # -----------------------------------------

            elif response.status_code == 401:

                print(
                    "   Pexels API key is invalid."
                )

                return None

            # -----------------------------------------
            # RATE LIMIT
            # -----------------------------------------

            elif response.status_code == 429:

                print(
                    "   Pexels API rate limit exceeded."
                )

                return None

        except httpx.TimeoutException:

            print(
                "   Pexels request timed out."
            )

        except httpx.RequestError as exc:

            print(
                "   Pexels connection error:",
                str(exc),
            )

        except Exception as exc:

            print(
                "   Pexels image error:",
                str(exc),
            )

    return None


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

    Image priority:

    1. Geoapify image
    2. Pexels restaurant image
    3. None
    """

    # =================================================
    # API KEYS
    # =================================================

    geoapify_api_key = os.getenv(
        "GEOAPIFY_API_KEY"
    )

    pexels_api_key = os.getenv(
        "PEXELS_API_KEY"
    )

    if not geoapify_api_key:

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

    if not pexels_api_key:

        print(
            "WARNING: PEXELS_API_KEY is missing."
        )

        print(
            "Restaurant search will work, "
            "but Pexels images will not be available."
        )

    # =================================================
    # VALIDATION
    # =================================================

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

    # =================================================
    # FORCE MAXIMUM 5
    # =================================================

    limit = min(
        max(int(limit), 1),
        5,
    )

    print(
        "\n"
        "========================================"
    )

    print(
        "GEOAPIFY + PEXELS RESTAURANT SEARCH"
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

    # =================================================
    # GEOAPIFY PLACES API
    # =================================================

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

        "apiKey": geoapify_api_key,
    }

    print(
        "\nCalling Geoapify Places API..."
    )

    # =================================================
    # DIRECT HTTPX REQUEST
    # =================================================

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

    # =================================================
    # HTTP ERROR
    # =================================================

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

    # =================================================
    # PARSE JSON
    # =================================================

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

    # =================================================
    # FEATURES
    # =================================================

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

    # =================================================
    # RESTAURANT LIST
    # =================================================

    restaurants = []

    # Only process maximum 5
    features = features[:5]

    # =================================================
    # ONE HTTP CLIENT FOR IMAGE REQUESTS
    # =================================================

    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
    ) as client:

        # =================================================
        # PROCESS EACH RESTAURANT
        # =================================================

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
            # CITY
            # -------------------------------------------------

            city = properties.get(
                "city"
            )

            # =================================================
            # IMAGE 1: GEOAPIFY
            # =================================================

            restaurant_image = None

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
            # IMAGE 2: GEOAPIFY PLACE DETAILS
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

                    "apiKey": geoapify_api_key,
                }

                print(
                    f"[{index}/"
                    f"{len(features)}] "
                    f"Checking Geoapify image: "
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

                            for detail_feature in (
                                detail_features
                            ):

                                detail_properties = (
                                    detail_feature.get(
                                        "properties",
                                        {},
                                    )
                                )

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

                                    print(
                                        "   Geoapify image found."
                                    )

                                    break

                except Exception as exc:

                    print(
                        "   Geoapify image lookup error:",
                        str(exc),
                    )

            # =================================================
            # IMAGE 3: PEXELS FALLBACK
            # =================================================

            pexels_photo = None

            if not restaurant_image:

                print(
                    f"   No Geoapify image."
                )

                pexels_photo = (
                    await get_pexels_restaurant_image(
                        client=client,
                        restaurant_name=name,
                        city=city,
                    )
                )

                if pexels_photo:

                    restaurant_image = (
                        pexels_photo.get(
                            "image"
                        )
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

            restaurant = {

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

                "city": city,

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

                # -----------------------------------------
                # IMAGE
                # -----------------------------------------

                "image": restaurant_image,

                # Frontend fallback fields

                "image_url": restaurant_image,

                "photo": restaurant_image,

                "photo_url": restaurant_image,

                # -----------------------------------------
                # PEXELS ATTRIBUTION
                # -----------------------------------------

                "image_source": (
                    "Geoapify"
                    if (
                        restaurant_image
                        and not pexels_photo
                    )
                    else (
                        "Pexels"
                        if pexels_photo
                        else None
                    )
                ),

                "pexels_photo_url": (
                    pexels_photo.get(
                        "photo_url"
                    )
                    if pexels_photo
                    else None
                ),

                "pexels_photographer": (
                    pexels_photo.get(
                        "photographer"
                    )
                    if pexels_photo
                    else None
                ),

                "pexels_photographer_url": (
                    pexels_photo.get(
                        "photographer_url"
                    )
                    if pexels_photo
                    else None
                ),

                # -----------------------------------------
                # RATING
                # -----------------------------------------

                "rating": (
                    properties.get(
                        "rating"
                    )
                ),
            }

            restaurants.append(
                restaurant
            )

    # =================================================
    # FINAL LIMIT = 5
    # =================================================

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
            f"{'YES' if restaurant.get('image') else 'NO'} | "
            f"Source: "
            f"{restaurant.get('image_source') or 'None'}"
        )

    # =================================================
    # NO RESULTS
    # =================================================

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

    # =================================================
    # SUCCESS
    # =================================================

    return {
        "success": True,
        "restaurants": restaurants,
        "error_type": None,
        "message": (
            "Restaurants fetched successfully"
        ),
        "is_live": True,
    }