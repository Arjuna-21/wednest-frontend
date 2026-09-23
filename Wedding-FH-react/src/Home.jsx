import { useEffect, useState } from "react";
import "./App.css";
import "./Home.css";
import logoname from "/images/logoname.png"
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Contact from "./Contact";
import WHall from '/images/wedding-hall.jpg';
import API_URL from './api.js'

function Home() {
  const [halls, setHalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/halls`)
      .then((response) => response.json())
      .then((data) => {
        setHalls(data.halls);
      }).catch((error) => {
        console.log(error);
      })
  }, []);
  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <img src="/images/venue.png" alt="Wedding Venue" className="hero-image" />
        <div className="hero-shade"></div>
        <div className="hero-content">
          <p className="small-title">FIND YOUR PERFECT</p>
          <h1> Wedding Venue</h1>
          <p className="hero-description">Discover and book the best function halls
            <br />
            for your special moments</p>
          <div className="hero-decoration">───── ♥ ───── </div>
        </div>
      </section>
      <section className="search-box">
        <div className="search-field">
          <span className="icon"><i class="fa-solid fa-location-dot"></i></span>
          <div>
            <label>Location</label>
            <p>Enter city or area</p>
          </div>
          <span className="arrow">⌄</span>
        </div>

        <div className="search-field">
          <span className="icon"><i class="fa-solid fa-calendar"></i></span>
          <div>
            <label>Date</label>
            <p>Select date</p>
          </div>
          <span className="arrow">⌄</span>
        </div>

        <div className="search-field">
          <span className="icon"><i class="fa-solid fa-people-line"></i></span>
          <div>
            <label>Guests</label>
            <p>No. of guests</p>
          </div>
          <span className="arrow">⌄</span>
        </div>

        <button onClick={() => navigate("/search")} className="search-btn"><i class="fa-solid fa-magnifying-glass"></i> Search Halls</button>

      </section>

      <section className="popular">
        <div className="section-heading">
          <span>────</span>
          <p>FEATURED HALLS</p>
          <span>────</span>
        </div>

        <h2>Popular Function Halls</h2>

        <p className="section-description">Explore our handpicked selection of beautiful venues</p>


        <div className="halls-grid">
          {
            halls.map((hall) => (
              <div className="hall-card" key={hall.id}>
                <div class="hall-image">
                  <img src={WHall} alt="" width="250" />
                </div>
                <div class="hall-info">
                  <h2>{hall.hall_name}</h2>
                  <p className="hall-place">{hall.city}, {hall.state}</p>
                  <p className="hall-capacity">{hall.capacity_from} - {hall.capacity_to}</p>
                  <div className="price">{Number(hall.price).toLocaleString("en-IN")} <span> / Day</span></div>
                </div>
                <button onClick={() => navigate(`/halls/${hall.id}`)} className="details-btn">View  Details</button>
              </div>
            ))
          }
          {/* </div> */}
        </div>

        <button className="view-all" onClick={() => navigate("/search")}>
          View All Halls &nbsp; →
        </button>

      </section>
      <footer className="footer">

        <div className="footer-box">
          <h2 className="web-name">WedNest</h2>
          <p>
            Find the perfect function hall for your special occasions.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/home">Home</a>
          <a href="/search">Function Halls</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact Us</a>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>📞 +91 98765 43210</p>
          <p>📧 support@wednest.com</p>
          <p>📍 Adoni, Andhra Pradesh</p>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-social">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">YouTube</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 WedNest. All Rights Reserved.</p>
        </div>

      </footer>
    </div>
  );
}

export default Home;