import html
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")


# ============================================================
# OVERPASS API SERVERS
# ============================================================

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]


# ============================================================
# GET IMAGE FROM PEXELS
# ============================================================

async def get_pexels_image(
    client,
    place_name,
):
    """
    Find a relevant place image using the Pexels API.

    OpenStreetMap remains the primary place-data source.
    Pexels is used only when OSM does not provide an image.
    """

    if not PEXELS_API_KEY or not place_name:
        return None

    place_name = str(place_name).strip()

    if not place_name:
        return None

    query = f"{place_name} tourist attraction"

    print(
        f"Pexels image search: {query}"
    )

    try:
        response = await client.get(
            "https://api.pexels.com/v1/search",
            params={
                "query": query,
                "per_page": 5,
                "orientation": "landscape",
            },
            headers={
                "Authorization": PEXELS_API_KEY,
                "Accept": "application/json",
            },
        )

        print(
            "Pexels status:",
            response.status_code,
        )

        if response.status_code != 200:
            print(
                "Pexels API error:",
                response.text[:500],
            )
            return None

        data = response.json()
        photos = data.get("photos", [])

        if not photos:
            print(
                f"No Pexels image found: {place_name}"
            )
            return None

        # Prefer a landscape image suitable for a place card.
        for photo in photos:
            src = photo.get("src", {})

            image_url = (
                src.get("large2x")
                or src.get("large")
                or src.get("medium")
            )

            if image_url:
                print(
                    f"Pexels image found: {place_name}"
                )
                return image_url

    except (
        httpx.RequestError,
        httpx.TimeoutException,
        ValueError,
    ) as exc:
        print(
            f"Pexels image lookup error for {place_name}: {exc}"
        )

    return None


# ============================================================
# GET IMAGE FROM OSM TAGS
# ============================================================

def get_osm_image(
    tags: dict,
):
    """
    Read image directly from OpenStreetMap tags.
    """

    # --------------------------------------------------------
    # image=
    # --------------------------------------------------------

    image = tags.get("image")

    if image:

        image = html.unescape(
            str(image).strip()
        )

        if (
            image.startswith("http://")
            or image.startswith("https://")
        ):

            return image

    # --------------------------------------------------------
    # Wikimedia Commons
    # --------------------------------------------------------

    wikimedia = tags.get(
        "wikimedia_commons"
    )

    if wikimedia:

        value = str(
            wikimedia
        ).strip()

        # File:Example.jpg
        if value.lower().startswith(
            "file:"
        ):

            file_name = value[5:].strip()

            if file_name:

                return (
                    "https://commons.wikimedia.org/"
                    "wiki/Special:FilePath/"
                    f"{quote(file_name)}"
                )

        # Direct Wikimedia URL
        if (
            value.startswith("http://")
            or value.startswith("https://")
        ):

            return value

    return None


# ============================================================
# SEARCH PLACES
# ============================================================

async def search_places(
    latitude: float,
    longitude: float,
    category: str = "tourist_attraction",
):
    """
    Search places using OpenStreetMap Overpass.

    Maximum 5 places are returned.

    Images:
        1. OpenStreetMap image
        2. Pexels image
        3. None if no relevant image exists
    """

    # ========================================================
    # VALIDATE COORDINATES
    # ========================================================

    try:

        latitude = float(latitude)
        longitude = float(longitude)

    except (
        TypeError,
        ValueError,
    ):

        return {
            "success": False,
            "places": [],
            "error_type": "validation_error",
            "message": (
                "Invalid latitude or longitude."
            ),
            "is_live": False,
        }

    # ========================================================
    # SEARCH RADIUS
    # ========================================================

    # 10 km is safer than 30 km for Overpass.
    radius = 10000

    # ========================================================
    # CATEGORY QUERIES
    # ========================================================

    category_queries = {

        "tourist_attraction": f"""
            nwr["tourism"="attraction"]
            (around:{radius},{{lat}},{{lon}});

            nwr["tourism"="museum"]
            (around:{radius},{{lat}},{{lon}});

            nwr["tourism"="viewpoint"]
            (around:{radius},{{lat}},{{lon}});

            nwr["historic"]
            (around:{radius},{{lat}},{{lon}});
        """,

        "restaurant": f"""
            nwr["amenity"="restaurant"]
            (around:{radius},{{lat}},{{lon}});

            nwr["amenity"="cafe"]
            (around:{radius},{{lat}},{{lon}});

            nwr["amenity"="fast_food"]
            (around:{radius},{{lat}},{{lon}});
        """,

        "hotel": f"""
            nwr["tourism"="hotel"]
            (around:{radius},{{lat}},{{lon}});

            nwr["tourism"="hostel"]
            (around:{radius},{{lat}},{{lon}});

            nwr["tourism"="guest_house"]
            (around:{radius},{{lat}},{{lon}});

            nwr["tourism"="resort"]
            (around:{radius},{{lat}},{{lon}});
        """,

        "shopping": f"""
            nwr["shop"="mall"]
            (around:{radius},{{lat}},{{lon}});

            nwr["shop"="department_store"]
            (around:{radius},{{lat}},{{lon}});

            nwr["shop"="supermarket"]
            (around:{radius},{{lat}},{{lon}});
        """,
    }

    selected_query = category_queries.get(
        category,
        category_queries[
            "tourist_attraction"
        ],
    )

    # ========================================================
    # OVERPASS QUERY
    # ========================================================

    query = f"""
[out:json][timeout:25];

(
    {
        selected_query.format(
            lat=latitude,
            lon=longitude,
        )
    }
);

out center tags;
"""

    # ========================================================
    # HEADERS
    # ========================================================

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

    # ========================================================
    # LOG
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "OVERPASS PLACES SEARCH"
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
        f"Category  : {category}"
    )

    print(
        f"Radius    : {radius}m"
    )

    # ========================================================
    # TRY MULTIPLE OVERPASS SERVERS
    # ========================================================

    response = None

    try:

        async with httpx.AsyncClient(
            timeout=40.0,
            follow_redirects=True,
        ) as client:

            for overpass_url in OVERPASS_URLS:

                print(
                    f"Trying Overpass server: "
                    f"{overpass_url}"
                )

                try:

                    current_response = (
                        await client.post(
                            overpass_url,
                            data={
                                "data": query
                            },
                            headers=headers,
                        )
                    )

                    print(
                        "Overpass Status:",
                        current_response.status_code,
                    )

                    if (
                        current_response.status_code
                        == 200
                    ):

                        response = current_response

                        print(
                            "Overpass server succeeded."
                        )

                        break

                    print(
                        "Overpass server failed:",
                        current_response.status_code,
                    )

                except httpx.TimeoutException:

                    print(
                        "Overpass server timed out."
                    )

                    continue

                except httpx.RequestError as exc:

                    print(
                        "Overpass connection error:",
                        str(exc),
                    )

                    continue

    except httpx.TimeoutException:

        print(
            "Overpass request timed out."
        )

        return {
            "success": False,
            "places": [],
            "error_type": "timeout",
            "message": (
                "Places service timed out."
            ),
            "is_live": False,
        }

    except httpx.RequestError as exc:

        print(
            "Overpass connection error:",
            str(exc),
        )

        return {
            "success": False,
            "places": [],
            "error_type": "request_error",
            "message": (
                "Unable to connect to "
                "Places service."
            ),
            "is_live": False,
        }

    # ========================================================
    # ALL SERVERS FAILED
    # ========================================================

    if response is None:

        print(
            "All Overpass servers failed."
        )

        return {
            "success": False,
            "places": [],
            "error_type": "places_api_error",
            "message": (
                "Places service is temporarily "
                "unavailable."
            ),
            "is_live": False,
        }

    # ========================================================
    # HTTP ERROR
    # ========================================================

    if response.status_code != 200:

        print(
            "Overpass API ERROR:"
        )

        print(
            response.text[:1000]
        )

        return {
            "success": False,
            "places": [],
            "error_type": "places_api_error",
            "message": (
                "Places service returned "
                f"HTTP {response.status_code}."
            ),
            "is_live": False,
        }

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        data = response.json()

    except Exception as exc:

        print(
            "Overpass JSON error:",
            str(exc),
        )

        return {
            "success": False,
            "places": [],
            "error_type": "invalid_response",
            "message": (
                "Places service returned "
                "invalid data."
            ),
            "is_live": False,
        }

    # ========================================================
    # ELEMENTS
    # ========================================================

    elements = data.get(
        "elements",
        [],
    )

    if not isinstance(
        elements,
        list,
    ):

        elements = []

    print(
        f"Overpass returned "
        f"{len(elements)} elements."
    )

    # ========================================================
    # PLACES
    # ========================================================

    places = []

    seen_names = set()

    # ========================================================
    # PROCESS ELEMENTS
    # ========================================================

    for element in elements:

        tags = element.get(
            "tags",
            {},
        )

        if not isinstance(
            tags,
            dict,
        ):

            tags = {}

        # ----------------------------------------------------
        # NODE
        # ----------------------------------------------------

        lat = element.get(
            "lat"
        )

        lon = element.get(
            "lon"
        )

        # ----------------------------------------------------
        # WAY / RELATION
        # ----------------------------------------------------

        if (
            lat is None
            or lon is None
        ):

            center = element.get(
                "center",
                {},
            )

            if not isinstance(
                center,
                dict,
            ):

                center = {}

            lat = center.get(
                "lat"
            )

            lon = center.get(
                "lon"
            )

        # ----------------------------------------------------
        # NAME
        # ----------------------------------------------------

        name = tags.get(
            "name"
        )

        if (
            not name
            or lat is None
            or lon is None
        ):

            continue

        name = str(
            name
        ).strip()

        if not name:

            continue

        # ----------------------------------------------------
        # DUPLICATE CHECK
        # ----------------------------------------------------

        name_key = name.lower()

        if name_key in seen_names:

            continue

        seen_names.add(
            name_key
        )

        # ----------------------------------------------------
        # PLACE TYPE
        # ----------------------------------------------------

        place_type = (
            tags.get("tourism")
            or tags.get("amenity")
            or tags.get("historic")
            or tags.get("shop")
            or category
        )

        # ----------------------------------------------------
        # ADDRESS
        # ----------------------------------------------------

        address = (
            tags.get("addr:street")
            or tags.get("addr:city")
            or tags.get("addr:place")
            or tags.get("addr:full")
        )

        # ----------------------------------------------------
        # PHONE
        # ----------------------------------------------------

        phone = (
            tags.get("phone")
            or tags.get("contact:phone")
        )

        # ----------------------------------------------------
        # WEBSITE
        # ----------------------------------------------------

        website = (
            tags.get("website")
            or tags.get("contact:website")
        )

        # ----------------------------------------------------
        # OSM IMAGE
        # ----------------------------------------------------

        place_image = get_osm_image(
            tags
        )

        if place_image:

            print(
                f"OSM image found: {name}"
            )

        # ----------------------------------------------------
        # ADD PLACE
        # ----------------------------------------------------

        place = {

            "id": element.get(
                "id"
            ),

            "name": name,

            "latitude": lat,

            "longitude": lon,

            "type": place_type,

            "address": address,

            "phone": phone,

            "website": website,

            "image": place_image,

            "image_url": place_image,

            "photo": place_image,

            "photo_url": place_image,

            "source": (
                "OpenStreetMap / Overpass"
            ),
        }

        places.append(
            place
        )

        # Collect up to 15 first
        # so image matching has more options.
        if len(places) >= 15:

            break

    # ========================================================
    # PEXELS IMAGE SEARCH
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "PEXELS IMAGE SEARCH"
    )

    print(
        "========================================"
    )

    if PEXELS_API_KEY:
        try:
            async with httpx.AsyncClient(
                timeout=20.0,
                follow_redirects=True,
            ) as client:

                for place in places:

                    # Already has an OSM image.
                    if place.get("image"):
                        place["image_source"] = (
                            "OpenStreetMap"
                        )
                        continue

                    image = await get_pexels_image(
                        client=client,
                        place_name=place.get("name"),
                    )

                    if image:
                        place["image"] = image
                        place["image_url"] = image
                        place["photo"] = image
                        place["photo_url"] = image
                        place["image_source"] = "Pexels"
                    else:
                        place["image_source"] = (
                            "Image unavailable"
                        )

                        print(
                            f"No exact image found: "
                            f"{place.get('name')}"
                        )

        except Exception as exc:
            print(
                "Pexels image service error:",
                str(exc),
            )

            for place in places:
                if place.get("image"):
                    place["image_source"] = (
                        "OpenStreetMap"
                    )
                else:
                    place["image_source"] = (
                        "Image unavailable"
                    )
    else:
        print(
            "PEXELS_API_KEY is missing. "
            "Skipping Pexels image search."
        )

        for place in places:
            if place.get("image"):
                place["image_source"] = (
                    "OpenStreetMap"
                )
            else:
                place["image_source"] = (
                    "Image unavailable"
                )


# ========================================================
    # PRIORITIZE PLACES WITH IMAGES
    # ========================================================

    places_with_images = [
        place
        for place in places
        if place.get("image")
    ]

    places_without_images = [
        place
        for place in places
        if not place.get("image")
    ]

    final_places = (
        places_with_images
        + places_without_images
    )

    # ========================================================
    # MAXIMUM 5
    # ========================================================

    final_places = final_places[:5]

    # ========================================================
    # FINAL LOG
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "FINAL PLACE RESULTS"
    )

    print(
        "========================================"
    )

    print(
        f"Places returned: "
        f"{len(final_places)}"
    )

    for index, place in enumerate(
        final_places,
        start=1,
    ):

        print(
            f"{index}. "
            f"{place.get('name')} | "
            f"Image: "
            f"{'YES' if place.get('image') else 'NO'} | "
            f"Source: "
            f"{place.get('image_source', 'OSM')}"
        )

    # ========================================================
    # NO RESULTS
    # ========================================================

    if not final_places:

        return {
            "success": True,
            "places": [],
            "error_type": "no_results",
            "message": (
                "No places found for "
                f"category: {category}"
            ),
            "is_live": True,
        }

    # ========================================================
    # SUCCESS
    # ========================================================

    return {
        "success": True,
        "places": final_places,
        "error_type": None,
        "message": (
            "Places fetched successfully"
        ),
        "is_live": True,
    }