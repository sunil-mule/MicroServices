import React, { useState, useEffect } from 'react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ userId: '', productId: '', quantity: '' });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch orders' });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.productId || !formData.quantity) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Order placed successfully!' });
        setFormData({ userId: '', productId: '', quantity: '' });
        await fetchOrders();
        await fetchProducts(); // Refresh products to show updated stock
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to place order' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to place order' });
    }
    setLoading(false);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : `User ${userId.substring(0, 8)}...`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p._id === productId);
    return product ? product.name : `Product ${productId.substring(0, 8)}...`;
  };

  return (
    <>
      <div className="form-group">
        <h2>Place Order</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✓' : '✗'} {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-input">
              <label>Select User</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-input">
              <label>Select Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} (₹{product.price} - {product.stock} in stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-input">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g., 2"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>

      <div className="list-container">
        <h2>Orders List</h2>
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders placed yet. Create one above!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="list-item">
              <div className="list-item-header">
                <h3>Order #{order._id.substring(0, 8)}</h3>
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="list-item-details">
                <div className="detail-item">
                  <div className="detail-label">Customer</div>
                  <div className="detail-value">{getUserName(order.userId)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Product</div>
                  <div className="detail-value">{getProductName(order.productId)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Quantity</div>
                  <div className="detail-value">{order.quantity} units</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Unit Price</div>
                  <div className="detail-value price">₹{order.unitPrice.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Total</div>
                  <div className="detail-value price">₹{order.total.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Ordered</div>
                  <div className="detail-value">
                    {new Date(order.createdAt).toLocaleDateString()}
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

export default Orders;
