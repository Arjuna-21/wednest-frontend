import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Confirmed.css'

function Confirmed() {
    const navigate = useNavigate();

    return (
        <div className="confirmed-box">
            <div className="confirmed-container">
                <div className="success-icon"><i class="fa-regular fa-circle-check"></i></div>

                <h1>Congratulations!</h1>

                <p>
                    Your function hall booking has been confirmed successfully.
                </p>

                <button onClick={() => navigate("/")}>
                    Redirect to Page
                </button>
            </div>
        </div>
    )
}

export default Confirmed
