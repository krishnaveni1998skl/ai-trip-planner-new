from tools.flight_tool import search_flights


result = search_flights(
    origin="Chennai",
    destination="Dubai",
    travelers=2,
)


print(result)