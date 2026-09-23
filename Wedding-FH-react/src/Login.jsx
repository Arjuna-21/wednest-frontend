import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import API_URL from './api.js'

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            setMessage("Login Successful");

            navigate("/");

        } catch (error) {
            console.log(error);
            setMessage("Server Error");
        }
    };

    return (
        <div className="login-container">

            <div className="login-heading">
                <h1>Welcome Back</h1>
                <p>Sign in to continue your wedding journey.</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>

                <label htmlFor="email">Email</label>

                <input
                    className='email'
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Password</label>

                <input
                    className='password'
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="forget-password">
                    <p></p>
                    <Link className='forget' to='/forget'>Forget Password</Link>
                </div>

                <button
                    className="login-Btn"
                    type="submit"
                >
                    Login
                </button>

                {message && (
                    <p className="login-message">
                        {message}
                    </p>
                )}

                <div className="login-divider">
                    <hr />
                    <span>OR</span>
                    <hr />
                </div>

                <div className="register-link">
                    <p>Don't have an account?</p>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>

            </form>

        </div>
    );
}

export default Login;
