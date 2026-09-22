import React from 'react'
import { useState } from 'react'
import './Register.css';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const navigate = useNavigate();
    const [cooldown, setCooldown] = useState(0);

    const sendOtp = async () => {

        if(cooldown > 0) {
            return ;
        }
        const response = await fetch(`${URL}/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        setCooldown(60);
        
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if(prev <= 0) {
                    clearInterval(timer) ;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        setMessage(data.message)
    }

    const verifyOtp = async () => {
        const response = await fetch(`${URL}/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        if (response.ok) {
            setIsOtpVerified(true);
        } else {
            setIsOtpVerified(false)
        }
        setMessage(data.message);
    };

    const handleRegister = async (e) => {

        e.preventDefault();
        try {
            const response = await fetch(`${URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username, email, password
                })
            });

            const data = await response.json();

            if (!isOtpVerified) {
                setMessage("Please verify OTP before registering");
                return;
            }

            if (!response.ok) {
                setMessage(data.message);
                return;
            }
            setMessage("Registration Successful");

            setUsername("");
            setEmail("");
            setPassword("");
        } catch (error) {
            console.log(error.message);
            setMessage("Server Error");
        }
    }
    return (
        <div className='container'>
            <div className="heading">
                <h1>Register</h1>
                <p>Your perfect wedding begins with the perfect venue.</p>
                <p>Let's find yours</p>
            </div>
            <form className='input-holder' onSubmit={handleRegister} action="">
                <label for="">Username</label>
                <input type="text" placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} />
                <label for="">Email</label>
                <div class="email-otp">
                    <input type="email" placeholder='Enter Email' value={email} onChange={(e) => {setEmail(e.target.value); setIsOtpVerified(false)}} />
                    <button type='button' disabled={cooldown > 0} onClick={sendOtp} className='otp-btn'>
                        {
                            cooldown > 0 ? `Resend OTP ${cooldown}s` : "Get OTP"
                        }
                    </button>
                </div>
                <div class="verify-otp">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter OTP' />
                    <button type='button' onClick={verifyOtp} className='verify-btn'>Verify Email</button>
                </div>
                <label for="">password</label>
                <input type="password" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} /> <br />

                <button className='register-btn' type='submit'>Register</button>

                {
                    message && <p style={{ color: "red" }}>{message}</p>
                }

                <div class="choice">
                    <hr />
                    <p>OR</p>
                    <hr />
                </div>
                <div class="login-page">
                    <p>Already Have an Account?.</p>
                    <a href="" onClick={() => navigate("/login")}>Login</a>
                </div>
            </form>
        </div>
    )
}

export default Register