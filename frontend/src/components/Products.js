import React, { useState, useEffect } from 'react';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      const res = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Product created successfully!' });
        setFormData({ name: '', price: '', stock: '' });
        await fetchProducts();
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create product' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create product' });
    }
  };

  return (
    <>
      <div className="form-group">
        <h2>Create Product</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✓' : '✗'} {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-input">
              <label>Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Keyboard"
              />
            </div>
            <div className="form-input">
              <label>Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 1499"
              />
            </div>
            <div className="form-input">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary">
              Create Product
            </button>
          </div>
        </form>
      </div>

      <div className="list-container">
        <h2>Products List</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Create one above!</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="list-item">
              <div className="list-item-header">
                <h3>{product.name}</h3>
                <span className="list-item-badge">Stock: {product.stock}</span>
              </div>
              <div className="list-item-details">
                <div className="detail-item">
                  <div className="detail-label">Price</div>
                  <div className="detail-value price">₹{product.price.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Available Stock</div>
                  <div className="detail-value">{product.stock} units</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Products;
