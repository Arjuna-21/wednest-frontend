import React from 'react'
import { Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Register from './Register'
import Login from './Login'
import HallDetails from './HallDetails'
import Booking from './Booking'
import Confirmed from './Confirmed'
import SearchHalls from './SearchHalls'
import MyBookings from './MyBookings'
import Contact from './Contact'
import ForgotPassword from './ForgotPassword'

function App() {
  return (
    <div>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/halls/:id' element={<HallDetails />} />
          <Route path='/booking/:id' element={<Booking />} />
          <Route path='/confirmed' element={<Confirmed />} />
          <Route path='/search' element={<SearchHalls />} />
          <Route path='/mybookings' element={<MyBookings />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/forget' element={<ForgotPassword />} />
        </Routes>
    </div>
  )
}

export default App