
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Client from "./pages/Client";
import Payment from "./pages/Payment";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Client />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

