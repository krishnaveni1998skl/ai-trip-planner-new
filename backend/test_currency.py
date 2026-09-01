from tools.currency_tool import convert_currency


result = convert_currency(
    amount=100000,
    from_currency="INR",
    to_currency="AED",
)


print(result)