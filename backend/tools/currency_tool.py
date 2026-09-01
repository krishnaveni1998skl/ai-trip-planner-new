from typing import Dict


# ============================================================
# DEMO EXCHANGE RATES
# Base currency: INR
# ============================================================

EXCHANGE_RATES = {
    "INR": {
        "INR": 1.0,
        "AED": 0.0437,
        "USD": 0.0117,
        "EUR": 0.0100,
        "JPY": 1.72,
    },

    "AED": {
        "INR": 22.88,
        "AED": 1.0,
        "USD": 0.27,
        "EUR": 0.23,
        "JPY": 39.40,
    },

    "USD": {
        "INR": 85.47,
        "AED": 3.67,
        "USD": 1.0,
        "EUR": 0.86,
        "JPY": 147.0,
    },

    "EUR": {
        "INR": 100.0,
        "AED": 4.28,
        "USD": 1.16,
        "EUR": 1.0,
        "JPY": 171.0,
    },

    "JPY": {
        "INR": 0.58,
        "AED": 0.0254,
        "USD": 0.0068,
        "EUR": 0.0058,
        "JPY": 1.0,
    },
}


# ============================================================
# CURRENCY CONVERTER
# ============================================================

def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str,
) -> Dict:
    """
    Convert an amount from one supported currency
    to another supported currency.

    Supported currencies:
    INR, AED, USD, EUR, JPY
    """

    if amount < 0:
        raise ValueError(
            "Amount cannot be negative"
        )

    from_currency = from_currency.upper().strip()
    to_currency = to_currency.upper().strip()

    if from_currency not in EXCHANGE_RATES:
        raise ValueError(
            f"Unsupported source currency: {from_currency}"
        )

    if to_currency not in EXCHANGE_RATES:
        raise ValueError(
            f"Unsupported target currency: {to_currency}"
        )

    rate = EXCHANGE_RATES[
        from_currency
    ][
        to_currency
    ]

    converted_amount = amount * rate

    return {
        "amount": round(amount, 2),

        "from_currency": from_currency,

        "to_currency": to_currency,

        "converted_amount": round(
            converted_amount,
            2,
        ),

        "exchange_rate": rate,
    }