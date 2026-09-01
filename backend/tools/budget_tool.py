from typing import Dict


def calculate_budget(
    total_budget: float,
    travelers: int = 1,
    nights: int = 1,
) -> Dict:
    """
    Calculate a travel budget breakdown for flights,
    hotels, food, local transport, activities,
    and emergency expenses.
    """

    if total_budget <= 0:
        raise ValueError(
            "Total budget must be greater than zero"
        )

    if travelers < 1:
        raise ValueError(
            "Travelers must be at least 1"
        )

    if nights < 1:
        raise ValueError(
            "Nights must be at least 1"
        )

    flights = total_budget * 0.35
    hotels = total_budget * 0.30
    food = total_budget * 0.15
    transport = total_budget * 0.10
    activities = total_budget * 0.07
    emergency = total_budget * 0.03

    allocated_total = (
        flights
        + hotels
        + food
        + transport
        + activities
        + emergency
    )

    return {
        "total_budget": round(
            total_budget, 2
        ),

        "travelers": travelers,

        "nights": nights,

        "per_person": round(
            total_budget / travelers,
            2
        ),

        "hotel_per_night": round(
            hotels / nights,
            2
        ),

        "food_per_person_per_day": round(
            food / travelers / (nights + 1),
            2
        ),

        "breakdown": {
            "flights": round(
                flights, 2
            ),

            "hotels": round(
                hotels, 2
            ),

            "food": round(
                food, 2
            ),

            "local_transport": round(
                transport, 2
            ),

            "activities": round(
                activities, 2
            ),

            "emergency": round(
                emergency, 2
            ),
        },

        "allocated_total": round(
            allocated_total,
            2
        ),

        "remaining": round(
            total_budget - allocated_total,
            2
        ),
    }