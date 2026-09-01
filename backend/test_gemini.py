import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing")


print("1. API key loaded")
print("2. Creating Gemini model...")


model = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=api_key,
    max_output_tokens=100,
)


print("3. Sending request...")

response = model.invoke(
    "Say only: Gemini test successful"
)


print("4. Response received")
print()
print(response.content)
print()
print("GEMINI API TEST SUCCESS")