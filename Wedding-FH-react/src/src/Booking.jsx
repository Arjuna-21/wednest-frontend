import React, { useState } from 'react'
import "./Booking.css";
import URL from './api';
import { useNavigate, useParams } from 'react-router-dom';

function Booking() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [eventDate, setEventDate] = useState("");
    const [guests, setGuests] = useState("");
    const [eventType, setEventType] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const user =JSON.parse(localStorage.getItem("user"));

    const handleBooking = async (e) => {

        if(!phone || !email || !eventDate || !eventType || !guests) {
            alert("Please Fill all feilds");
            return;
        }
        e.preventDefault();

        try {
            const response = await fetch(`${URL}/bookings`, {
                method : "POST",
                headers : {"Content-Type" :  "application/json"},
                body : JSON.stringify({
                    user_id : user.id,
                    hall_id : id,
                    event_date :eventDate,
                    guests : Number(guests),
                    event_type : eventType,
                    phone : phone,
                    email : email,
                })
            })
            const date = await response.json();

            if(!response.ok) {
                alert(data.message);
                return;
            }

            navigate("/confirmed");
        } catch (error) {
            console.log(error);
            alert("Server error");
        }
    };

  return (
    <div className='booking-page'>
        <div class="booking-container">
            <div class="booking-heading">
                <h1>Book your Wedding hall</h1>
                <p class="booking-subtitle">Fill in the details </p>
                <p className='booking-subtitle'>below to reserve your wedding venue.</p>
            </div>

            <form onSubmit={handleBooking} action="" className='booking-form'>
                <div class="form-group">
                    <label for="">Event Date</label>
                    <input value={eventDate} type="date" onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div class="form-group">
                    <label for="">Number of Guests</label>
                    <input value={guests} type="number" placeholder='Enter number of guests' onChange={(e) => setGuests(e.target.value)} />
                </div>
                <div class="form-group">
                    <label for="">Event Type</label>
                    <select value={eventType} name="" id="" onChange={(e) => setEventType(e.target.value)}>
                        <option value="">Select Event type</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="">Personal details</label>
                    <input value={phone} type="tel" placeholder='Enter Phone Number' onChange={(e) => setPhone(e.target.value)} />
                    <input value={email} type="text" placeholder='Enter Email' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type='submit' className='confirm-booking-btn'>Confirm Booking</button>
            </form>
        </div>
    </div>
  )
}

export default Booking