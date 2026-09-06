from fastapi import APIRouter

from app.services.weather import get_weather
from app.services.geocoding import get_coordinates
from app.services.places import search_places
from app.services.hotels import search_hotels
from app.services.flights import search_flights
from app.services.restaurants import search_restaurants
from app.ai.itinerary import generate_itinerary
from app.services.budget import calculate_budget
from app.ai.chat import modify_itinerary
router = APIRouter()


# =========================================================
# WEATHER
# =========================================================

@router.get("/weather")
async def weather(
    latitude: float,
    longitude: float,
):
    data = await get_weather(
        latitude,
        longitude,
    )

    return {
        "success": True,
        "weather": data,
    }


# =========================================================
# LOCATION
# =========================================================

@router.get("/location")
async def location(
    city: str,
):
    data = await get_coordinates(city)

    if not data:
        return {
            "success": False,
            "message": f"Location not found: {city}",
        }

    return {
        "success": True,
        "location": data,
    }


# =========================================================
# PLACES
# =========================================================
@router.get("/places")
async def places(
    city: str,
    category: str = "tourist_attraction",
):
    try:
        search_city = city.strip()

        if search_city.lower() == "maldives":
            search_city = "Male, Maldives"

        location = await get_coordinates(search_city)

        if not location:
            return {
                "success": False,
                "message": f"Location not found: {search_city}",
                "places": [],
                "error_type": "location_not_found",
                "is_live": False,
            }

        result = await search_places(
            latitude=location["latitude"],
            longitude=location["longitude"],
            category=category,
        )

        if not result.get("success"):
            return {
                "success": False,
                "city": city,
                "search_location": search_city,
                "places": [],
                "error_type": result.get(
                    "error_type"
                ),
                "message": result.get(
                    "message"
                ),
                "is_live": False,
            }

        place_results = result.get(
            "places",
            []
        )

        return {
            "success": True,
            "city": city,
            "search_location": search_city,
            "country": location["country"],
            "category": category,
            "count": len(place_results),
            "places": place_results,
            "error_type": result.get(
                "error_type"
            ),
            "message": result.get(
                "message"
            ),
            "is_live": result.get(
                "is_live",
                True
            ),
        }

    except Exception as e:

        print(
            "Places API error:",
            e
        )

        return {
            "success": False,
            "message": "Unable to fetch places.",
            "places": [],
            "count": 0,
            "error_type": "unexpected_error",
            "is_live": False,
        }

# =========================================================
# HOTELS
# =========================================================
@router.get("/hotels")
async def hotels(
    location: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    limit: int = 10,
):
    try:
        result = await search_hotels(
            location=location,
            check_in=check_in,
            check_out=check_out,
            adults=adults,
            limit=limit,
        )

        if not result.get("success"):
            return {
                "success": False,
                "location": location,
                "check_in": check_in,
                "check_out": check_out,
                "adults": adults,
                "count": 0,
                "hotels": [],
                "error_type": result.get(
                    "error_type"
                ),
                "message": result.get(
                    "message"
                ),
                "is_live": False,
            }

        hotels_data = result.get(
            "hotels",
            []
        )

        return {
            "success": True,
            "location": location,
            "check_in": check_in,
            "check_out": check_out,
            "adults": adults,
            "count": len(hotels_data),
            "hotels": hotels_data,
            "message": result.get(
                "message"
            ),
            "is_live": result.get(
                "is_live",
                True
            ),
        }

    except Exception as e:
        print(
            "Hotel API error:",
            e
        )

        return {
            "success": False,
            "message": "Unable to fetch hotels",
            "hotels": [],
            "error_type": "unexpected_error",
            "is_live": False,
        }


# =========================================================
# FLIGHTS
# =========================================================

@router.get("/flights")
async def flights(
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
):
    try:
        result = await search_flights(
            origin=origin,
            destination=destination,
            departure_date=departure_date,
            adults=adults,
        )

        # API/service error
        if not result.get("success"):
            return {
                "success": False,
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date,
                "adults": adults,
                "count": 0,
                "flights": [],
                "error_type": result.get(
                    "error_type",
                    "flight_api_error",
                ),
                "message": result.get(
                    "message",
                    "Flight service unavailable",
                ),
                "is_live": False,
            }

        # Successful response
        flight_results = result.get(
            "flights",
            [],
        )

        return {
            "success": True,
            "origin": origin,
            "destination": destination,
            "departure_date": departure_date,
            "adults": adults,
            "count": len(flight_results),
            "flights": flight_results,
            "error_type": result.get(
                "error_type"
            ),
            "message": result.get(
                "message",
                "Flights fetched successfully",
            ),
            "is_live": result.get(
                "is_live",
                True,
            ),
        }

    except Exception as e:
        print(
            "Flight API error:",
            e,
        )

        return {
            "success": False,
            "origin": origin,
            "destination": destination,
            "departure_date": departure_date,
            "adults": adults,
            "count": 0,
            "flights": [],
            "error_type": "unexpected_error",
            "message": "Unable to fetch flights",
            "is_live": False,
        }


# =========================================================
# RESTAURANTS
# =========================================================

@router.get("/restaurants")
async def restaurants(
    city: str,
    radius: int = 5000,
    limit: int = 10,
):
    try:
        search_city = city.strip()

        # Maldives → Male
        if search_city.lower() == "maldives":
            search_city = "Male, Maldives"

        location = await get_coordinates(search_city)

        if not location:
            return {
                "success": False,
                "message": f"Location not found: {search_city}",
                "restaurants": [],
                "error_type": "location_not_found",
                "is_live": False,
            }

        # Wider radius for Maldives
        if city.strip().lower() == "maldives":
            radius = 10000

        result = await search_restaurants(
            latitude=location["latitude"],
            longitude=location["longitude"],
            radius=radius,
            limit=limit,
        )

        if not result.get("success"):
            return {
                "success": False,
                "city": city,
                "search_location": search_city,
                "restaurants": [],
                "count": 0,
                "error_type": result.get(
                    "error_type"
                ),
                "message": result.get(
                    "message"
                ),
                "is_live": False,
            }

        restaurant_results = result.get(
            "restaurants",
            []
        )

        return {
            "success": True,
            "city": city,
            "search_location": search_city,
            "country": location["country"],
            "count": len(restaurant_results),
            "restaurants": restaurant_results,
            "error_type": None,
            "message": result.get(
                "message"
            ),
            "is_live": result.get(
                "is_live",
                True
            ),
        }

    except Exception as e:
        print(
            "Restaurant API error:",
            e
        )

        return {
            "success": False,
            "message": "Unable to fetch restaurants",
            "restaurants": [],
            "count": 0,
            "error_type": "unexpected_error",
            "is_live": False,
        }



@router.post("/itinerary")
async def create_itinerary(trip_data: dict):
    try:
        result = generate_itinerary(trip_data)

        return result

    except Exception as e:
        print("Itinerary generation error:", e)

        return {
            "success": False,
            "error_type": "unexpected_error",
            "message": "Unable to generate itinerary.",
            "itinerary": None,
        }


    # ==========================================
# BUDGET CALCULATOR
# ==========================================

@router.post("/budget")
async def calculate_trip_budget(trip_data: dict):

    try:

        result = calculate_budget(

            budget=trip_data.get(
                "budget",
                0,
            ),

            travelers=trip_data.get(
                "travelers",
                1,
            ),

            days=trip_data.get(
                "days",
                trip_data.get(
                    "duration",
                    1,
                ),
            ),

            nights=trip_data.get(
                "nights",
                1,
            ),

            flight_price=trip_data.get(
                "flight_price",
                0,
            ),

            hotel_price=trip_data.get(
                "hotel_price",
                0,
            ),

            food_daily=trip_data.get(
                "food_daily",
                0,
            ),

            activities=trip_data.get(
                "activities",
                0,
            ),

            transport=trip_data.get(
                "transport",
                0,
            ),

            other=trip_data.get(
                "other",
                0,
            ),
        )

        return {
            "success": True,
            "budget": result,
        }

    except ValueError as e:

        print(
            "Budget validation error:",
            e,
        )

        return {
            "success": False,
            "error_type": "validation_error",
            "message": str(e),
            "budget": None,
        }

    except Exception as e:

        print(
            "Budget calculation error:",
            e,
        )

        return {
            "success": False,
            "error_type": "budget_calculation_error",
            "message": (
                "Unable to calculate trip budget."
            ),
            "budget": None,
        }



    
@router.post("/trips/{trip_id}/chat")
async def chat_with_trip(
    trip_id: str,
    chat_data: dict,
):
    try:
        trip_data = chat_data.get("trip_data", {})

        current_itinerary = chat_data.get(
            "current_itinerary",
            {},
        )

        user_message = chat_data.get(
            "message",
            "",
        )

        if not user_message.strip():
            return {
                "success": False,
                "message": "Message is required",
                "itinerary": None,
            }

        if not current_itinerary:
            return {
                "success": False,
                "message": "Current itinerary is required",
                "itinerary": None,
            }

        updated_itinerary = modify_itinerary(
            trip_data=trip_data,
            current_itinerary=current_itinerary,
            user_message=user_message,
        )

        return {
            "success": True,
            "trip_id": trip_id,
            "message": "Itinerary updated successfully",
            "itinerary": updated_itinerary,
        }

    except Exception as e:
        print("Chat modification error:", e)

        return {
            "success": False,
            "message": str(e),
            "itinerary": None,
        }
    