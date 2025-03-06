 
import React, { useState, useEffect } from "react";

const Brand = () => {
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch list of brands
        fetch("http://127.0.0.1:5000/brands")
            .then((response) => response.json())
            .then((data) => setBrands(data))
            .catch((error) => console.error("Error fetching brands:", error));
    }, []);

    const handleBrandChange = (event) => {
        const brand = event.target.value;
        setSelectedBrand(brand);

        // Fetch products based on selected brand
        fetch(`http://127.0.0.1:5000/products/brand?brand=${brand}`)
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error("Error fetching products:", error));
    };

    return (
        <div className="brand-container">
            <div className="brand">
                <a href="/Brand">Brands</a>
            </div>
            <select onChange={handleBrandChange} value={selectedBrand}>
                <option value="x ">Select a brand</option>
                {brands.map((brand, index) => (
                    <option key={index} value={brand}>
                        {brand}
                    </option>
                ))}
            </select>

            <div className="products-list">
                {products.length > 0 ? (
                    products.map((product, index) => (
                        <div key={index} className="product-card">
                            <img src={product.ImageURL} alt={product.Name} />
                            <h3>{product.Name}</h3>
                            <p>Rating: {product.Rating}</p>
                            <p>Category: {product.Category}</p>
                        </div>
                    ))
                ) : (
                    <p>No products found for this brand.</p>
                )}
            </div>
        </div>
    );
};

export default Brand;
