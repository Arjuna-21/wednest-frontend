import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import API_URL from './api';

function ForgotPassword() {

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cooldown, setCooldown] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const sendOTP = async () => {
        try {
            const response = await fetch(`${API_URL}/forget-password/send-otp`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({ email })
            });

            const data = await response.json();

            if(!response.ok) {
                setStep(1);
                setMessage(data.message);
                return;
            }
            setMessage(data.message);

            setCooldown(60);

            const timer = setInterval(() => {
               setCooldown((prev) => {
                if(prev <= 1 ) {
                    clearInterval(timer);
                }
                return prev - 1;
               }) 
            }, 1000);

            setStep(2);
        } catch (error) {
            setStep(1);
            setMessage(data.message || "Failed to send OTP");
        }
    }

    const verifyOTP = async () => {
        try {
            const response = await fetch(`${API_URL}/forget-password/verify-otp`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({ email, otp })
            });

            const data = await response.json();
            setMessage(data.message);
            setStep(3);
        } catch (error) {
            setMessage(data.message || "Invalid OTP");
        }
    }

    const resetPassword = async () => {
        try {
            if(!newPassword || !confirmPassword) {
                setMessage("Please enter both passwords");
            }

            if(newPassword !== confirmPassword) {
                setMessage("Passwords doesn't match");
            }

            const response = await fetch(`${API_URL}/forget-password/reset-password`, {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                }, 
                body : JSON.stringify({
                    email, newPassword, confirmPassword
                })
            });

            const data = await response.json();
            setMessage(data.message);

            setInterval(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setMessage(data.message || "Failed to reset Password");
        }
    }
  return (
    <div className='forgot-container'>
        <div class="forget-box">
            <h3>Forget Password</h3>
            {
                step === 1 && (
                    <div class="s1">
                        <p>Enter Your Registered email Address</p>

                        <input type="email"  placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} />

                        <button  onClick={sendOTP}>Get OTP</button>
                    </div>
                )
            }
            {
                step === 2 && (
                    <div class="s2">
                        <p>OTP sent to your <b>{email}</b></p>
                        <input type="text" placeholder='Enter OTP' value={otp} onChange={(e) => setOtp(e.target.value)} />

                        <button onClick={verifyOTP}>Verify Email</button>
                        <button className='resend-btn' disabled={cooldown > 0}>
                            {
                                cooldown > 0 ? `Resend OTP ${cooldown}s` : "Resend OTP"
                            }
                        </button>
                    </div>
                )
            }
            {
                step === 3 && (
                    <div class="s3">
                        <p>Create your New Password</p>
                        <input type="password" placeholder='New Password' onChange={(e) => setNewPassword(e.target.value)} />

                        <input type="password" placeholder='Confirm Password' onChange={(e) => setConfirmPassword(e.target.value)} />

                        <button onClick={resetPassword}>Reset Password </button>
                    </div>
                )
            }
            {
                message && (<p className='msg'>{message}</p>)
            }
        </div>
    </div>
  )
}

export default ForgotPassword