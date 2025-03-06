import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./ProductsByBrand.css"; // Import the CSS file for styling

const ProductsByBrand = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const brand = params.get("brand");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (brand) {
      axios
        .get(`http://localhost:5000/products/brand?brand=${encodeURIComponent(brand)}`)
        .then((response) => {
          setProducts(response.data);
          
          
        })
        .catch((error) => console.error("Error fetching products:", error.message));
    }
  }, [brand]);
  console.log(products)

  const getValidImageUrl = (imageUrl) => {
    const imageUrls = imageUrl.split('|').map(url => url.trim());
    for (const url of imageUrls) {
      console.log(url)
      if (url) return url; 
    }
    return 'https://via.placeholder.com/150'; 
  };

  return (
    <div>
      <h2>Products for {brand}</h2>
      <div className="products-container">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="product-card">
              <img src={getValidImageUrl(product.ImageURL)} alt={product.Name} className="product-image" />
              <h3 className="product-name">{product.Name}</h3>
              <p className="product-rating">⭐ Rating: {product.Rating}</p>
              <p className="product-category">{product.Category}</p>
            </div>
          ))
        ) : (
          <p>No products found for this brand.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsByBrand;
  