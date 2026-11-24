
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ReservationPage from './pages/ReservationPage'
import ServiceReservationPage from './pages/ServiceReservationPage'
import Payment from './pages/Payment'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reservations/*" element={<ReservationPage />} />

        <Route
          path="/services/reserver/*"
          element={<ServiceReservationPage />}
        />

        <Route
          path="/factures/payment/:id"
          element={<Payment />}
        />

        <Route path="*" element={<ReservationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
