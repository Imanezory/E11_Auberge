
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Client from "./pages/Client";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/factures">
      <div className="app-wrapper">
        <Header />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Client />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
