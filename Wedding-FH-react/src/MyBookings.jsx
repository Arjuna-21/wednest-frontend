import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import './MyBookings.css';
import { Link } from 'react-router-dom'
import WHall from '/images/wedding-hall.jpg'
import API_URL from './api.js'

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const userId = user.id;
                const response = await fetch(`${API_URL}/bookings/${userId}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch bookings");
                }

                const data = await response.json();
                setBookings(data);

            } catch (err) {
                console.error(err);
                setError("Unable to load your bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();

    }, []);

    if (loading) {
        return <p>Loading bookings...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="bookings-page">
            <Navbar />
            <h2>My Bookings</h2>
            <div className="my-bookings">

                {
                    bookings.length === 0 ? (
                        <div className="bookings-card">
                            <h3>You Don't have any bookings</h3>
                            <p>Looks like you haven't made any booking yet</p>
                            <Link to='/search'>View Halls</Link>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div className="booking-card" key={booking.id}>
                                <div className="hall_image">
                                    <img src={WHall} alt="" />
                                </div>
                                <h3>{booking.hall_name}</h3>

                                <p>City: {booking.city}</p>
                                <p>Date: {booking.event_date.split("T")[0]}</p>
                                <p>Guests: {booking.guests}</p>
                                <p>Event Type: {booking.event_type}</p>
                                <p>Phone: {booking.phone}</p>
                                <p>Email: {booking.email}</p>
                            </div>
                        )))}
            </div>
        </div>
    );
}

export default MyBookings;
