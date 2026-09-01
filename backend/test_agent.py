from services.travel_agent import travel_agent
question = """
Plan a 4-night Dubai trip for 2 travelers from Chennai.

Total budget: 200000 INR.

Please:
1. Calculate the budget.
2. Find flights from Chennai to Dubai.
3. Find hotels in Dubai.
4. Check Dubai weather.
5. Convert 200000 INR to AED.
6. Find popular places to visit.
7. Find Arabic restaurants.

Give me a concise travel summary.
"""



print()
print("========================================")
print("       LANGCHAIN AGENT TEST")
print("========================================")
print()


answer = travel_agent(
    question
)


print(answer)


print()
print("========================================")
print("       AGENT TEST SUCCESS")
print("========================================")