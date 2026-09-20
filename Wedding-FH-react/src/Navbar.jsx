import React, { useState } from 'react'
import "./Navbar.css";
import logoname from '/images/logoname.png';
import { Link, useNavigate } from 'react-router-dom';
import Login from './Login';
import SearchHalls from './SearchHalls';
import MyBookings from './MyBookings';

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const [token, setToken] = useState(localStorage.getItem("token"))
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
    }
    return (
        <div className=''>
            <header className="header">

                <div className="logo">
                    <img src={logoname} alt="WedNest" />
                </div>


                <nav className={`navbar ${menuOpen ? "open" : ""}`}>
                    <Link className="Link" to='/'>Home</Link>
                    <Link className='Link' to='/search'>Function Halls</Link>
                    {/* <Link className='Link' >About Us</Link> */}
                    {
                        !token ? <Link className='Link' onClick={ () => alert("please login to your account ")}>My Bookings</Link> :  <Link className='Link' to='/mybookings'>My Bookings</Link>
                    }
                    <Link className='Link' to='/contact' >Contact Us</Link>
                    <div class="mobile_auth">
                        {
                            token ? <button class="logout-btn" onClick={handleLogout}>Logout</button> :
                                <button className='login-btn' onClick={() => navigate("/login")}>Login</button>
                        }
                    </div>
                </nav>

                <div className="header-right">
                    {
                        token ? <button className='logout-btn' onClick={handleLogout}>Logout</button> :
                            <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
                    }
                </div>

                <div className="menu">
                    <button onClick={() => setMenuOpen(!menuOpen)}><i class="fa-solid fa-bars"></i></button>
                </div>

            </header>
        </div>
    )
}

export default Navbar