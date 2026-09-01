import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();

  const destination = location.state?.destination || "";

  const welcomeMessage = {
    id: 1,
    sender: "bot",
    text: destination
      ? `Hi! I'm Paradise AI ✦ Ask me anything about ${destination}.`
      : "Hi! I'm Paradise AI ✦ Ask me anything about travel.",
  };

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage = async (customMessage = null) => {
    const message = (customMessage || input).trim();

    if (!message || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setMessages((previous) => [...previous, userMessage]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: message,
          destination: destination || null,

          // Send previous conversation to backend
          history: messages.map((item) => ({
            role: item.sender === "user" ? "user" : "assistant",
            content: item.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Unable to get a response.";

        if (data?.detail?.message) {
          errorMessage = data.detail.message;
        } else if (typeof data?.detail === "string") {
          errorMessage = data.detail;
        }

        throw new Error(errorMessage);
      }

      const answer =
        data.answer ||
        data.response ||
        data.message ||
        data.reply ||
        "Sorry, I could not generate a response.";

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: answer,
      };

      setMessages((previous) => [...previous, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const botError = {
        id: Date.now() + 1,
        sender: "bot",
        text: error.message || "Sorry, something went wrong.",
        error: true,
      };

      setMessages((previous) => [...previous, botError]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ==========================================================
  // QUICK QUESTIONS
  // ==========================================================

  const quickQuestions = [
    "Plan a 5 day Dubai trip",
    "Best places to visit in Dubai?",
    "Suggest hotels in Dubai",
    "What food should I try?",
    "What are the best attractions?",
    "Give me a budget travel plan",
  ];

  // ==========================================================
  // CLEAR CHAT
  // ==========================================================

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: destination
          ? `Hi! I'm Paradise AI ✦ Ask me anything about ${destination}.`
          : "Hi! I'm Paradise AI ✦ Ask me anything about travel.",
      },
    ]);

    setInput("");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#183B32]">
      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="bg-[#123D35] px-5 pb-16 pt-28 text-white sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5C873]">
            ✦ AI Travel Assistant
          </p>

          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
            Travel
            <span className="ml-2 italic text-[#E5C873]">Chat.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Ask Paradise AI about destinations, hotels, restaurants, flights,
            attractions, weather and travel planning.
          </p>
        </div>
      </section>

      {/* ====================================================
          CHAT
      ==================================================== */}

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* CHAT HEADER */}

          <div className="flex items-center justify-between bg-[#183B32] px-5 py-5 text-white sm:px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5C873] text-xl text-[#183B32]">
                ✦
              </div>

              <div>
                <h2 className="font-serif text-xl">Paradise AI</h2>

                <p className="text-xs text-white/50">Travel Assistant</p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg border border-white/20 px-4 py-2 text-xs transition hover:bg-white/10"
            >
              Clear
            </button>
          </div>

          {/* DESTINATION */}

          {destination && (
            <div className="border-b border-[#183B32]/10 bg-[#F0E8D5] px-5 py-3 text-sm sm:px-7">
              Planning for:
              <span className="ml-2 font-semibold">{destination}</span>
            </div>
          )}

          {/* ==================================================
              MESSAGES
          ================================================== */}

          <div className="h-[500px] overflow-y-auto px-4 py-6 sm:px-7">
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-5 py-4 sm:max-w-[75%] ${
                      message.sender === "user"
                        ? "rounded-br-md bg-[#183B32] text-white"
                        : message.error
                          ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                          : "rounded-bl-md bg-[#F0E8D5] text-[#183B32]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* LOADING */}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[#F0E8D5] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#B4883D]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#B4883D] [animation-delay:150ms]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#B4883D] [animation-delay:300ms]" />

                      <span className="ml-2 text-xs text-[#183B32]/60">
                        Paradise AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              QUICK QUESTIONS
          ================================================== */}

          <div className="border-t border-[#183B32]/10 px-5 py-5 sm:px-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B4883D]">
              Quick Questions
            </p>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                  className="whitespace-nowrap rounded-full border border-[#183B32]/15 px-4 py-2 text-xs transition hover:border-[#B4883D] hover:bg-[#F7F3E8] disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* ==================================================
              INPUT
          ================================================== */}

          <div className="border-t border-[#183B32]/10 p-5 sm:p-7">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows="2"
                placeholder="Ask anything about your trip..."
                disabled={loading}
                className="min-h-[58px] flex-1 resize-none rounded-2xl border border-[#183B32]/15 bg-[#FCFBF7] px-5 py-4 text-sm outline-none transition focus:border-[#B4883D] disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-[58px] items-center justify-center rounded-2xl bg-[#183B32] px-6 font-semibold text-white transition hover:bg-[#28594D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">
                  {loading ? "Sending..." : "Send"}
                </span>

                <span className="sm:hidden">→</span>
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-[#183B32]/40">
              Press Enter to send • Shift + Enter for a new line
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================
          ACTION BUTTONS
      ==================================================== */}

      <section className="px-5 pb-16">
        <div className="mx-auto flex max-w-4xl flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/plan")}
            className="rounded-xl border border-[#183B32]/20 px-7 py-4 text-sm font-semibold transition hover:bg-white"
          >
            Plan a Trip
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-trips")}
            className="rounded-xl bg-[#183B32] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#28594D]"
          >
            My Trips →
          </button>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-[#102F29] py-10 text-center text-white">
        <p className="font-serif text-xl font-bold tracking-wide">
          WAY TO PARADISE
        </p>

        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
          TRAVELS • EXPLORE • REMEMBER
        </p>
      </footer>
    </main>
  );
}

export default Chatbot;
