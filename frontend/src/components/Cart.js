import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    const handleRemoveFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.ProdID !== productId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const navigate = useNavigate();

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-items">
                    {cart.map((item) => (
                        <div key={item.ProdID} className="cart-item">
                            <img src={item.ImageURL} alt={item.Name} className="cart-image" />
                            <div className="cart-info">
                                <h2>{item.Name}</h2>
                                <p>{item.Brand}</p>
                                <p>Rating: {item.Rating} ⭐</p>
                                <p>{item.ReviewCount} reviews</p>
                                <button className="remove-from-cart-button" onClick={() => handleRemoveFromCart(item.ProdID)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <button className="go-back-button" onClick={() => navigate('/')}>Go Back</button>
        </div>
    );
};

export default Cart;
