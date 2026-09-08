import html
from urllib.parse import quote

import httpx


# ============================================================
# API URLS
# ============================================================

OVERPASS_URL = (
    "https://overpass-api.de/api/interpreter"
)

WIKIMEDIA_API_URL = (
    "https://commons.wikimedia.org/w/api.php"
)


# ============================================================
# GET WIKIMEDIA IMAGE
# ============================================================

async def get_wikimedia_image(
    client: httpx.AsyncClient,
    place_name: str,
    latitude: float,
    longitude: float,
):
    """
    Search Wikimedia Commons for an image related
    to the exact place name.

    Priority:
    1. Exact place name
    2. Place name + Dubai
    3. Place name only

    Returns image URL or None.
    """

    if not place_name:
        return None

    # --------------------------------------------------------
    # SEARCH QUERIES
    # --------------------------------------------------------

    search_queries = [
        f'"{place_name}" Dubai',
        f'"{place_name}"',
        place_name,
    ]

    for search_text in search_queries:

        params = {
            "action": "query",

            "generator": "search",

            "gsrsearch": search_text,

            "gsrnamespace": 6,

            "gsrlimit": 5,

            "prop": "imageinfo",

            "iiprop": "url",

            "iiurlwidth": 1000,

            "format": "json",

            "formatversion": 2,
        }

        try:

            response = await client.get(
                WIKIMEDIA_API_URL,
                params=params,
            )

            print(
                f"Wikimedia search "
                f"'{search_text}' "
                f"status: "
                f"{response.status_code}"
            )

            if response.status_code != 200:
                continue

            data = response.json()

            pages = data.get(
                "query",
                {},
            ).get(
                "pages",
                [],
            )

            if not isinstance(
                pages,
                list,
            ):
                continue

            # ------------------------------------------------
            # FIND BEST MATCH
            # ------------------------------------------------

            place_words = set(
                place_name.lower()
                .replace(",", " ")
                .split()
            )

            best_url = None
            best_score = -1

            for page in pages:

                title = str(
                    page.get(
                        "title",
                        "",
                    )
                ).lower()

                imageinfo = page.get(
                    "imageinfo",
                    [],
                )

                if not imageinfo:
                    continue

                image_data = imageinfo[0]

                image_url = (
                    image_data.get(
                        "thumburl"
                    )
                    or image_data.get(
                        "url"
                    )
                )

                if not image_url:
                    continue

                # --------------------------------------------
                # MATCH SCORE
                # --------------------------------------------

                score = 0

                for word in place_words:

                    if len(word) >= 3:
                        if word in title:
                            score += 2

                # Exact full name
                clean_name = (
                    place_name
                    .lower()
                    .strip()
                )

                if clean_name in title:
                    score += 10

                # Dubai relevance
                if "dubai" in title:
                    score += 3

                if score > best_score:

                    best_score = score
                    best_url = image_url

            # ------------------------------------------------
            # ACCEPT ONLY REASONABLE MATCH
            # ------------------------------------------------

            if best_url and best_score >= 2:

                print(
                    f"Wikimedia image found for: "
                    f"{place_name}"
                )

                return best_url

        except Exception as exc:

            print(
                f"Wikimedia lookup error "
                f"for {place_name}: "
                f"{exc}"
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

    image = tags.get(
        "image"
    )

    if image:

        image = html.unescape(
            str(image).strip()
        )

        if image.startswith(
            "http://"
        ) or image.startswith(
            "https://"
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

            file_name = value[
                5:
            ].strip()

            if file_name:

                return (
                    "https://commons.wikimedia.org/"
                    "wiki/Special:FilePath/"
                    f"{quote(file_name)}"
                )

        # Direct Commons URL
        if value.startswith(
            "http://"
        ) or value.startswith(
            "https://"
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
        2. Wikimedia Commons image search
        3. None if no relevant image exists
    """

    # ========================================================
    # VALIDATE COORDINATES
    # ========================================================

    try:

        latitude = float(
            latitude
        )

        longitude = float(
            longitude
        )

    except (
        TypeError,
        ValueError,
    ):

        return {
            "success": False,
            "places": [],
            "error_type": (
                "validation_error"
            ),
            "message": (
                "Invalid latitude or longitude."
            ),
            "is_live": False,
        }

    # ========================================================
    # SEARCH RADIUS
    # ========================================================

    radius = 30000

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
[out:json][timeout:60];

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
    # OVERPASS REQUEST
    # ========================================================

    try:

        async with httpx.AsyncClient(
            timeout=90.0,
            follow_redirects=True,
        ) as client:

            response = await client.post(
                OVERPASS_URL,
                data={
                    "data": query
                },
                headers=headers,
            )

        print(
            "Overpass Status:",
            response.status_code,
        )

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
            "error_type": (
                "request_error"
            ),
            "message": (
                "Unable to connect to "
                "Places service."
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
            "error_type": (
                "places_api_error"
            ),
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
            "error_type": (
                "invalid_response"
            ),
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
            tags.get(
                "addr:street"
            )
            or tags.get(
                "addr:city"
            )
            or tags.get(
                "addr:place"
            )
            or tags.get(
                "addr:full"
            )
        )

        # ----------------------------------------------------
        # PHONE
        # ----------------------------------------------------

        phone = (
            tags.get("phone")
            or tags.get(
                "contact:phone"
            )
        )

        # ----------------------------------------------------
        # WEBSITE
        # ----------------------------------------------------

        website = (
            tags.get("website")
            or tags.get(
                "contact:website"
            )
        )

        # ----------------------------------------------------
        # OSM IMAGE FIRST
        # ----------------------------------------------------

        place_image = get_osm_image(
            tags
        )

        if place_image:

            print(
                f"OSM image found: "
                f"{name}"
            )

        # ----------------------------------------------------
        # ADD PLACE TEMPORARILY
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

        # ----------------------------------------------------
        # COLLECT MORE THAN 5 TEMPORARILY
        # ----------------------------------------------------
        # We want a chance to find places with images.
        # So we don't stop immediately at 5.
        # ----------------------------------------------------

        if len(places) >= 15:
            break

    # ========================================================
    # WIKIMEDIA IMAGE SEARCH
    # ========================================================

    print(
        "\n"
        "========================================"
    )

    print(
        "WIKIMEDIA IMAGE SEARCH"
    )

    print(
        "========================================"
    )

    try:

        async with httpx.AsyncClient(
            timeout=20.0,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "WayToParadise/1.0 "
                    "(Travel Planner POC)"
                )
            },
        ) as client:

            for place in places:

                # --------------------------------------------
                # Already has image
                # --------------------------------------------

                if place.get(
                    "image"
                ):
                    continue

                image = await get_wikimedia_image(
                    client=client,
                    place_name=place.get(
                        "name"
                    ),
                    latitude=place.get(
                        "latitude"
                    ),
                    longitude=place.get(
                        "longitude"
                    ),
                )

                if image:

                    place[
                        "image"
                    ] = image

                    place[
                        "image_url"
                    ] = image

                    place[
                        "photo"
                    ] = image

                    place[
                        "photo_url"
                    ] = image

                    place[
                        "image_source"
                    ] = (
                        "Wikimedia Commons"
                    )

                else:

                    place[
                        "image_source"
                    ] = (
                        "Image unavailable"
                    )

                    print(
                        f"No exact image found: "
                        f"{place.get('name')}"
                    )

    except Exception as exc:

        print(
            "Wikimedia service error:",
            str(exc),
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

    # Image places first
    final_places = (
        places_with_images
        + places_without_images
    )

    # ========================================================
    # MAXIMUM 5
    # ========================================================

    final_places = final_places[:5]

    # ========================================================
    # FINAL RESULT LOG
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
            "error_type": (
                "no_results"
            ),
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