from sqlalchemy import Column, Integer, String, Text, Date, Numeric, JSON, ForeignKey
from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String(100), nullable=False)
    country = Column(String(100), nullable=True)
    duration_days = Column(Integer, nullable=False)
    travelers = Column(Integer, nullable=False)
    budget = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(10), default="INR")
    departure_city = Column(String(100), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    travel_style = Column(String(50), nullable=True)
    interests = Column(JSON, nullable=True)
    itinerary = Column(JSON, nullable=True)
    expenses = Column(JSON, nullable=True)
    status = Column(String(30), default="planned")


class TripPreference(Base):
    __tablename__ = "trip_preferences"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    preference_type = Column(String(50), nullable=False)
    preference_value = Column(String(200), nullable=False)


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=True)
    title = Column(String(200), nullable=True)
    summary = Column(Text, nullable=True)
    daily_cost = Column(Numeric(12, 2), default=0)


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("itinerary_days.id"), nullable=False)
    item_order = Column(Integer, default=1)
    time = Column(String(50), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(300), nullable=True)
    category = Column(String(100), nullable=True)
    estimated_cost = Column(Numeric(12, 2), default=0)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)


class ToolResult(Base):
    __tablename__ = "tool_results"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    status = Column(String(30), nullable=True)
    result = Column(JSON, nullable=True)