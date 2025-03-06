import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getValidImageUrl = (imageUrl) => {
    const imageUrls = imageUrl.split('|').map(url => url.trim());
    for (const url of imageUrls) {
      if (url) return url;
    }
    return 'https://via.placeholder.com/150'; 
  };

  useEffect(() => {
    const fetchCollaborativeRecommendations = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      setLoading(true);
      setError('');

      try {
        const { data } = await axios.get(`http://localhost:5000/recommendations?user_id=${userId}`);
        const filteredRecommendations = data.filter(rec => rec.Rating > 0.0);
        setRecommendations(filteredRecommendations);
      } catch (error) {
        setError('Failed to fetch recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTopRatedProducts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const { data } = await axios.get('http://localhost:5000/rating-recommendation');
        setTopRated(data);
      } catch (error) {
        setError('Failed to fetch top-rated products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborativeRecommendations();
    fetchTopRatedProducts();
  }, []);

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      console.log('No valid product ID');
    }
  };

  const handlecart = (name,brand,rating,count) =>{
    let proddata = {
      name : this.name, brand : this.brand , ratingda : rating, countda : count
    }

    localStorage.setItem('key', 'value');
  }

  const handleCardClick = (product) => {
    console.log(product);
    // Navigate to product detail page and pass product data
    navigate(`/product-detail?query=${product.Name}`, { state: { product } });
  };

  return (
    <div className="home-container">
      <h1>Recommended Products for You</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {recommendations.length === 0 && !loading && !error && (
        <p>No recommendations found</p>
      )}

      <div className="recommendation-container" >
        {recommendations.map((rec) => (
          <div 
            key={rec.ProdID} 
            className="recommendation-card"
            onClick={() => handleCardClick(rec)}
          >
            <img 
              src={getValidImageUrl(rec.ImageURL)} 
              alt={rec.Name} 
              className="product-image" 
            />
            <div className="product-info">
              <h2>{rec.Name}</h2>
              <p>{rec.Brand}</p>
              <p>Rating: {rec.Rating} ⭐</p>
              <p>{rec.ReviewCount} reviews</p>
              <button className="add-to-cart-button" > Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <hr className="section-divider" />

      <h1>Top-Rated Products</h1>
      {topRated.length === 0 && !loading && !error && (
        <p>No top-rated products found</p>
      )}
      <div className="recommendation-container">
        {topRated.map((rec, index) => (
          <div 
            key={index} 
            className="recommendation-card"
            onClick={() => handleProductClick(rec.ProdID)}
          >
            <img 
              src={getValidImageUrl(rec.ImageURL)} 
              alt={rec.Name} 
              className="product-image" 
            />
            <div className="product-info">
              <h2>{rec.Name}</h2>
              <p>{rec.Brand}</p>
              <p>Rating: {rec.Rating} ⭐</p>
              <p>{rec.ReviewCount} reviews</p>
              <button className="add-to-cart-button">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <hr className="section-divider" />
      <footer className="footer">
        <p>&copy; 2025 Rahilkhan Recommendation system . All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
