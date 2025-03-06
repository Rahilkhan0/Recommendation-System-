import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Cart from './components/Cart';
import SignIn from './components/SignIn';
import Login from './components/Login';
import Account from './components/Account';
import Search from './components/Search';  
import ProductDetail from './components/ProductDetail';
import Brand from './components/Brand';
import ProductsByBrand from './components/ProductsByBrand';

const App = () => {
  const [userEmail, setUserEmail] = useState(null);  

  const handleLogin = (email) => {
    setUserEmail(email);  
  };

  const handleLogout = () => {
    setUserEmail(null); // Clear user email on logout
  };

  return (
    <Router>
      <Navbar userEmail={userEmail} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signin" element={<SignIn handleLogin={handleLogin} />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/account" element={<Account handleLogin={handleLogin} />} />
        <Route path="/search" element={<Search />} />  
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/Brand" element={<Brand/>} />
       <Route path="/products" element={<ProductsByBrand />} />
        
      </Routes>
    </Router>
  );
};

export default App;
