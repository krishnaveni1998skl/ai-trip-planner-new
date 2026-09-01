from tools.hotel_tool import search_hotels


result = search_hotels(
    destination="Dubai",
    nights=4,
    travelers=2,
)


print(result)