import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const [productName, setProductName] = useState("");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [brands, setBrands] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch Brands Using Axios
  useEffect(() => {
    axios.get("http://localhost:5000/brands")
      .then((response) => {
        setBrands(response.data);
      })
      .catch((error) => console.error("Error fetching brands:", error.message));
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${encodeURIComponent(brand)}`);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleSearch = () => {
    if (productName.trim()) {
      navigate(`/search?query=${encodeURIComponent(productName)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUserEmail("");
    navigate("/");
  };

  const getEmailDetails = (email) => {
    if (!email) return { initial: "", displayName: "" };
    const firstLetter = email[0].toUpperCase();
    const name = email.split("@")[0];
    return { initial: firstLetter, displayName: name };
  };

  const { initial, displayName } = getEmailDetails(userEmail);

  // Fetch Products by Brand
  {/*
  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${encodeURIComponent(brand)}`);
  };*/}

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <a href="/">Home</a>
        </div>

        {/* Brand Dropdown Menu */}
        <div className="brand-dropdown">
        <button className="brand-button" onClick={toggleDropdown}>
          Brands ▼
        </button>
        {isDropdownOpen && (
          <div className="brand-menu">
            {brands.length > 0 ? (
              brands.map((brand, index) => (
                <div key={index} className="brand-item" onClick={() => handleBrandClick(brand)}>
                  {brand}
                </div>
              ))
            ) : (
              <p>Loading brands...</p>
            )}
          </div>
        )}
      </div>

        <div className="search-bar-container">
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Search for products"
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>

        <div className="navbar-links">
          <a href="/cart">Cart</a>
          {userEmail ? (
            <div className="user-info">
              <div className="user-icon">{initial}</div>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <a href="/account">Account</a>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
