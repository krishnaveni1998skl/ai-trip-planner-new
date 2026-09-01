from tools.budget_tool import calculate_budget


result = calculate_budget(
    total_budget=200000,
    travelers=2,
    nights=4,
)


print(result)