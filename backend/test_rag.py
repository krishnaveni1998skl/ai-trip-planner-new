from services.rag_service import search_knowledge


print()
print("========================================")
print("           RAG TEST")
print("========================================")
print()


# ============================================================
# TEST 1 - JAPAN
# ============================================================

print("TEST 1: Japan Destination Search")
print("----------------------------------------")

japan_results = search_knowledge(
    query="What are the best places to visit in Japan?",
    destination="Japan",
    top_k=3,
)

print()
print(
    f"Found {len(japan_results)} results"
)
print()


for index, document in enumerate(
    japan_results,
    start=1,
):

    print(
        f"--- Japan Result {index} ---"
    )

    print()
    print(document.page_content)

    print()

    print(
        "Destination:",
        document.metadata.get(
            "destination"
        ),
    )

    print(
        "Source:",
        document.metadata.get(
            "source_file"
        ),
    )

    print()


# ============================================================
# TEST 2 - TRAVEL PLANNING
# ============================================================

print()
print("TEST 2: Travel Planning Search")
print("----------------------------------------")

planning_results = search_knowledge(
    query="How should I plan my travel budget and itinerary?",
    destination="Travel_Planning",
    top_k=3,
)

print()
print(
    f"Found {len(planning_results)} results"
)
print()


for index, document in enumerate(
    planning_results,
    start=1,
):

    print(
        f"--- Planning Result {index} ---"
    )

    print()
    print(document.page_content)

    print()

    print(
        "Destination:",
        document.metadata.get(
            "destination"
        ),
    )

    print(
        "Source:",
        document.metadata.get(
            "source_file"
        ),
    )

    print()


print("========================================")
print("           RAG TEST COMPLETE")
print("========================================")