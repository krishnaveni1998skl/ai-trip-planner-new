def calculate_budget(
    budget: float = 0,
    travelers: int = 1,
    days: int = 1,
    nights: int = 1,
    flight_price: float = 0,
    hotel_price: float = 0,
    food_daily: float = 0,
    activities: float = 0,
    transport: float = 0,
    other: float = 0,
):
    """
    Deterministic trip budget calculator.

    Flight = flight price × travelers
    Hotel = hotel price × nights
    Food = daily food estimate × travelers × days
    Activities = selected activities total
    Transport = local transport estimate
    Other = other expenses
    """

    # =====================================================
    # VALIDATE INPUTS
    # =====================================================

    try:
        budget = float(budget or 0)
        travelers = int(travelers or 1)
        days = int(days or 1)
        nights = int(nights or 0)

        flight_price = float(flight_price or 0)
        hotel_price = float(hotel_price or 0)
        food_daily = float(food_daily or 0)
        activities = float(activities or 0)
        transport = float(transport or 0)
        other = float(other or 0)

    except (TypeError, ValueError):

        raise ValueError(
            "Budget values must contain valid numbers."
        )

    # =====================================================
    # POSITIVE VALUE VALIDATION
    # =====================================================

    if budget < 0:
        raise ValueError(
            "Budget cannot be negative."
        )

    if travelers < 1:
        raise ValueError(
            "Travelers must be at least 1."
        )

    if days < 1:
        raise ValueError(
            "Days must be at least 1."
        )

    if nights < 0:
        raise ValueError(
            "Nights cannot be negative."
        )

    expense_values = {
        "flight_price": flight_price,
        "hotel_price": hotel_price,
        "food_daily": food_daily,
        "activities": activities,
        "transport": transport,
        "other": other,
    }

    for name, value in expense_values.items():

        if value < 0:
            raise ValueError(
                f"{name} cannot be negative."
            )

    # =====================================================
    # 1. FLIGHT
    # =====================================================

    flight_total = flight_price * travelers

    # =====================================================
    # 2. HOTEL
    # =====================================================

    hotel_total = hotel_price * nights

    # =====================================================
    # 3. FOOD
    # =====================================================

    food_total = (
        food_daily
        * travelers
        * days
    )

    # =====================================================
    # 4. ACTIVITIES
    # =====================================================

    activities_total = activities

    # =====================================================
    # 5. TRANSPORT
    # =====================================================

    transport_total = transport

    # =====================================================
    # 6. OTHER
    # =====================================================

    other_total = other

    # =====================================================
    # TOTAL
    # =====================================================

    total = (
        flight_total
        + hotel_total
        + food_total
        + activities_total
        + transport_total
        + other_total
    )

    # =====================================================
    # REMAINING
    # =====================================================

    remaining = budget - total

    # =====================================================
    # OVER BUDGET
    # =====================================================

    over_budget = max(
        0,
        total - budget,
    )

    is_over_budget = (
        budget > 0
        and total > budget
    )

    # =====================================================
    # BUDGET USAGE %
    # =====================================================

    if budget > 0:
        percentage = round(
            (total / budget) * 100
        )
    else:
        percentage = 0

    # =====================================================
    # STATUS
    # =====================================================

    if budget <= 0:
        status = "no_budget"

    elif is_over_budget:
        status = "over_budget"

    elif percentage >= 90:
        status = "near_limit"

    else:
        status = "within_budget"

    # =====================================================
    # SUGGESTIONS
    # =====================================================

    suggestions = []

    if is_over_budget:

        suggestions.append(
            f"Reduce total expenses by at least ₹{over_budget:,.2f}."
        )

        if hotel_total > 0:
            suggestions.append(
                "Consider choosing a lower-priced hotel."
            )

        if flight_total > 0:
            suggestions.append(
                "Consider checking alternative flight options."
            )

        if food_total > 0:
            suggestions.append(
                "Reduce daily food spending or choose budget-friendly restaurants."
            )

        if activities_total > 0:
            suggestions.append(
                "Reduce the number of paid activities or choose free attractions."
            )

        if transport_total > 0:
            suggestions.append(
                "Use public transport where possible."
            )

    elif status == "near_limit":

        suggestions.append(
            "Your trip is close to the maximum budget."
        )

        suggestions.append(
            "Keep some emergency money available."
        )

    elif status == "no_budget":

        suggestions.append(
            "Set a trip budget to calculate budget usage."
        )

    else:

        suggestions.append(
            "Trip expenses are currently within the budget."
        )

    # =====================================================
    # RETURN
    # =====================================================

    return {
        "budget": round(budget, 2),

        "flight": round(
            flight_total,
            2,
        ),

        "hotel": round(
            hotel_total,
            2,
        ),

        "food": round(
            food_total,
            2,
        ),

        "activities": round(
            activities_total,
            2,
        ),

        "transport": round(
            transport_total,
            2,
        ),

        "other": round(
            other_total,
            2,
        ),

        "total": round(
            total,
            2,
        ),

        "remaining": round(
            remaining,
            2,
        ),

        "over_budget": round(
            over_budget,
            2,
        ),

        "is_over_budget": is_over_budget,

        "percentage": percentage,

        "status": status,

        "suggestions": suggestions,
    }