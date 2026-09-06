import React, { useState } from "react";

const TripChat = ({ onMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onMessage(message);
    setMessage("");
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-green-900">
          AI Trip Planner
        </h2>
        <p className="text-sm text-gray-500">Tell me about your trip</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
          Hello! 👋 Where would you like to travel?
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your trip request..."
            className="flex-1 rounded-lg border px-3 py-2 outline-none focus:border-green-800"
          />

          <button
            type="submit"
            className="rounded-lg bg-green-900 px-5 py-2 text-white"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripChat;
