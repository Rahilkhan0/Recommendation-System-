// src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate,useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const product = state?.product; // Product passed via navigation
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const productName = searchParams.get('query');

  const navigate = useNavigate();

  const getValidImageUrl = (imageUrl) => {
    const imageUrls = imageUrl.split('|').map(url => url.trim());
    for (const url of imageUrls) {
      if (url) return url; 
    }
    return 'https://via.placeholder.com/150'; 
  };

  const handleCardClick = (product) => {
    // Navigate to product detail page and pass product data
    navigate(`/product-detail`, { state: { product } });
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productName) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`http://localhost:5000/content-recommendation?item_name=${productName}`);
        setRecommendations(data);
      } catch (error) {
        setError('Failed to fetch recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
    console.log("Advait")
  }, [productName]);

  return (
    <div className="product-detail-container">
      <h1>{product?.name}</h1>

      <div className="product-detail">
        <img
          src={getValidImageUrl(product?.ImageURL)}
          alt={product?.Name}
          className="product-image"
        />
        <div className="product-info">
          <h2>{product?.Name}</h2>
          <p>{product?.Brand}</p>
          <p>Rating: {product?.Rating} ⭐</p>
          <p>{product?.ReviewCount} reviews</p>
          <p>{product?.description}</p>
        </div>
      </div>

      <h3>Similar Products</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {recommendations.length === 0 && !loading && !error && (
        <p>No recommendations found</p>
      )}

      <div className="recommendation-container">
        {recommendations.map((rec) => (
          <div key={rec.ID} className="recommendation-card" onClick={() => handleCardClick(rec)}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;
