import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/signup', {
                name,
                mobileNo,
                email,
                password,
            });
            setSuccess('Sign Up successful! You can now log in.');
            setError('');
            setName('');
            setMobileNo('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Error signing up. Please try again.');
            setSuccess('');
        }
    };

    const handleLogIn = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password,
            });
            // Store the user ID and email in local storage
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('userEmail', email); // Store user email
            setSuccess('Log In successful!');
            setError('');
            navigate('/'); // Redirect to home page after login
        } catch (err) {
            setError('Error logging in. Please check your credentials.');
            setSuccess('');
        }
    };

    return (
        <div className="account-container">
            <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
            {isLogin ? (
                <form onSubmit={handleLogIn}>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button type="submit">Log In</button>
                    <p>
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setIsLogin(false)}>
                            Sign Up
                        </button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleSignIn}>
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="tel"
                            value={mobileNo}
                            onChange={(e) => setMobileNo(e.target.value)}
                            placeholder="Mobile No"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <button type="submit">Sign Up</button>
                    <p>
                        Already have an account?{' '}
                        <button type="button" onClick={() => setIsLogin(true)}>
                            Log In
                        </button>
                    </p>
                </form>
            )}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default Account;
