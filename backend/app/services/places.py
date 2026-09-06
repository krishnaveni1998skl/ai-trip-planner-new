from app.utils.api_helpers import safe_post


OVERPASS_URL = "https://overpass-api.de/api/interpreter"


async def search_places(
    latitude: float,
    longitude: float,
    category: str = "tourist_attraction",
):
    # =====================================================
    # DESTINATION SEARCH RADIUS
    # =====================================================

    radius = 30000

    category_queries = {
        "tourist_attraction": f"""
            nwr["tourism"="attraction"](around:{radius},{{lat}},{{lon}});
            nwr["tourism"="museum"](around:{radius},{{lat}},{{lon}});
            nwr["tourism"="viewpoint"](around:{radius},{{lat}},{{lon}});
            nwr["historic"](around:{radius},{{lat}},{{lon}});
        """,

        "restaurant": f"""
            nwr["amenity"="restaurant"](around:{radius},{{lat}},{{lon}});
            nwr["amenity"="cafe"](around:{radius},{{lat}},{{lon}});
            nwr["amenity"="fast_food"](around:{radius},{{lat}},{{lon}});
        """,

        "hotel": f"""
            nwr["tourism"="hotel"](around:{radius},{{lat}},{{lon}});
            nwr["tourism"="hostel"](around:{radius},{{lat}},{{lon}});
            nwr["tourism"="guest_house"](around:{radius},{{lat}},{{lon}});
            nwr["tourism"="resort"](around:{radius},{{lat}},{{lon}});
        """,

        "shopping": f"""
            nwr["shop"="mall"](around:{radius},{{lat}},{{lon}});
            nwr["shop"="department_store"](around:{radius},{{lat}},{{lon}});
            nwr["shop"="supermarket"](around:{radius},{{lat}},{{lon}});
        """,
    }

    selected_query = category_queries.get(
        category,
        category_queries["tourist_attraction"],
    )

    query = f"""
[out:json][timeout:60];

(
    {selected_query.format(
        lat=latitude,
        lon=longitude
    )}
);

out center tags;
"""

    headers = {
        "User-Agent": (
            "WayToParadise/1.0 "
            "(Travel Planner POC)"
        ),
        "Accept": "application/json",
        "Content-Type": (
            "application/x-www-form-urlencoded"
        ),
    }

    print(
        f"Places search: "
        f"lat={latitude}, "
        f"lon={longitude}, "
        f"category={category}"
    )

    # =====================================================
    # SAFE OVERPASS API REQUEST
    # =====================================================

    result = await safe_post(
        url=OVERPASS_URL,
        data={"data": query},
        headers=headers,
        timeout=90,
        retries=1,
    )

    # =====================================================
    # HANDLE API ERROR
    # =====================================================

    if not result.get("success"):

        error_type = result.get(
            "error_type",
            "places_api_error",
        )

        message = result.get(
            "message",
            "Places service unavailable.",
        )

        print(
            f"Overpass error: "
            f"{error_type} - {message}"
        )

        return {
            "success": False,
            "places": [],
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

    places = []

    seen_names = set()

    # =====================================================
    # PARSE PLACES
    # =====================================================

    for element in data.get(
        "elements",
        []
    ):

        tags = element.get(
            "tags",
            {}
        )

        # =================================================
        # NODE
        # =================================================

        lat = element.get("lat")
        lon = element.get("lon")

        # =================================================
        # WAY / RELATION
        # =================================================

        if lat is None or lon is None:

            center = element.get(
                "center",
                {}
            )

            lat = center.get("lat")
            lon = center.get("lon")

        name = tags.get("name")

        if not name or lat is None or lon is None:
            continue

        # =================================================
        # REMOVE DUPLICATES
        # =================================================

        name_key = name.strip().lower()

        if name_key in seen_names:
            continue

        seen_names.add(name_key)

        # =================================================
        # NORMALIZED PLACE RESULT
        # =================================================

        places.append(
            {
                "id": element.get("id"),

                "name": name,

                "latitude": lat,

                "longitude": lon,

                "type": (
                    tags.get("tourism")
                    or tags.get("amenity")
                    or tags.get("historic")
                    or tags.get("shop")
                ),

                "address": (
                    tags.get("addr:street")
                    or tags.get("addr:city")
                    or tags.get("addr:place")
                ),

                "phone": tags.get(
                    "phone"
                ),

                "website": tags.get(
                    "website"
                ),
            }
        )

    print(
        f"Places found for {category}:",
        len(places)
    )

    # =====================================================
    # NO RESULTS
    # =====================================================

    if not places:

        return {
            "success": True,
            "places": [],
            "error_type": "no_results",
            "message": (
                f"No places found for "
                f"category: {category}"
            ),
            "is_live": True,
        }

    # =====================================================
    # SUCCESS
    # =====================================================

    return {
        "success": True,
        "places": places[:20],
        "error_type": None,
        "message": "Places fetched successfully",
        "is_live": True,
    }