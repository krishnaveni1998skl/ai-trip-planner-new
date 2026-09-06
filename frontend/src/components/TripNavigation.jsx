import React from "react";

const tabs = [
  "Overview",
  "Itinerary",
  "Flights",
  "Hotels",
  "Restaurants",
  "Weather",
  "Places",
  "Map",
  "Budget",
];

const TripNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex gap-2 overflow-x-auto p-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-green-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TripNavigation;
