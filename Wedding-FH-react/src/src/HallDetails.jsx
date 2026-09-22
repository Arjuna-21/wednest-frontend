import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar';
import './Navbar.css'
import './HallDetails.css';
import logoname from '/images/logoname.png';
import WHall from '/images/wedding-hall.jpg';
import URL from './api';

function HallDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [hall, setHall] = useState(null);

    useEffect(() => {
        fetch(`${URL}/halls/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setHall(data);
            }).catch((error) => {
                console.log(error);
            })
    }, [id]);
    if (!hall) {
        return <p>Loading...</p>
    }

    function verifyLogin ()  {
        const token = localStorage.getItem("token");

        if(!token) {
            alert("Please login to book this hall");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            const currentTime = Math.floor(Date.now() / 1000);

            if(payload.exp < currentTime) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                alert("Your session has expired. Please login again.");
                navigate("/login");
                return;
            }
            navigate(`/booking/${hall.id}`);
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert("Please login again");
            navigate("/login");
        }

    }
    return (
        <div>
            <Navbar />
            <div class="hall-details-page">
                <button className='hall-back-btn' onClick={() => navigate(-1)}><i class="fa-solid fa-arrow-left"></i>Back</button>

                <div class="hall-details-container">
                    <div class="hall-details-image">
                        <img src={WHall} alt=""  />
                    </div>
                    <div class="hall-details-info">
                        <p className='hall-details-label'>Wedding Venue</p>
                        <h1>{hall.hall_name}</h1>
                        <p className='hall-details-place'>{hall.city}, {hall.state}</p>
                        <div class="hall-details-price">{Number(hall.price).toLocaleString("en-In")} <span>/ Day</span></div>
                        <p>{hall.capacity_from} - {hall.capacity_to}</p>

                        <div class="hall-description">
                            <h2>About The Venue</h2>
                            <p>{hall.description || "A beautiful venue fro weddings and special occasions."}</p>
                        </div>
                    </div>
                </div>
                <div class="hall-facilities">
                    <h2>Venue Details</h2>
                    <div class="facilities-grid">
                        <div class="facility-card">
                            <span><i class="fa-solid fa-bowl-food"></i></span>
                            <h3>Food</h3>
                            <p>{hall.food_type || "Not Specified"}</p>
                        </div>
                        <div class="facility-card">
                            <span><i class="fa-solid fa-plug-circle-bolt"></i></span>
                            <h3>Electriciy</h3>
                            <p>{Number(hall.electricity_bill || 0).toFixed(2)} {" "} / Unit</p>
                        </div>
                        <div className="facility-card">
                            <span>❄️</span>
                            <h3>AC</h3>
                            <p>{hall.ac ? "Available" : "Not Available"}</p>
                        </div>

                        <div className="facility-card">
                            <span><i class="fa-solid fa-square-parking"></i></span>
                            <h3>Parking</h3>
                            <p>{hall.parking ? "Available" : "Not Available"}</p>
                        </div>

                        <div className="facility-card">
                            <span><i class="fa-solid fa-hotel"></i></span>
                            <h3>Rooms</h3>
                            <p>{hall.rooms_available ? "Available" : "Not Available"}</p>
                        </div>

                        <div className="facility-card">
                            <span>🌸</span>
                            <h3>Decoration</h3>
                            <p>{hall.decoration ? "Available" : "Not Available"}</p>
                        </div>

                    </div>
                <div class="book-btn">
                    <button className='hall-book-btn' onClick={() => verifyLogin()}>Book Now </button>
                </div>
                </div>
            </div>
        </div>
    )
}

export default HallDetails