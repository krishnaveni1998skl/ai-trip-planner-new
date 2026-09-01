import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import MyTrips from "./pages/MyTrips";
import Budget from "./pages/Budget";
import About from "./pages/About";
import Chatbot from "./pages/Chatbot";
import PlanTrip from "./pages/PlanTrip";
import Flights from "./pages/Flights";
import Hotels from "./pages/Hotels";
import PlanResult from "./pages/PlanResult";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/tours" element={<Tours />} />

        <Route path="/tours/:number" element={<TourDetails />} />

        <Route path="/my-trips" element={<MyTrips />} />

        <Route path="/budget" element={<Budget />} />
        <Route path="/about" element={<About />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/plan" element={<PlanTrip />} />
        <Route path="/flights" element={<Flights />} />

        <Route path="/hotels" element={<Hotels />} />
        <Route path="/plan-result" element={<PlanResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
