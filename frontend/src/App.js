import React, { useState, useEffect } from 'react';
import Users from './components/Users';
import Products from './components/Products';
import Orders from './components/Orders';

function App() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [gatewayHealth, setGatewayHealth] = useState(false);

  useEffect(() => {
    const checkGateway = async () => {
      try {
        const res = await fetch('/health');
        setGatewayHealth(res.ok);
      } catch (err) {
        setGatewayHealth(false);
      }
      setLoading(false);
    };
    checkGateway();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Connecting to API Gateway...</p>
        </div>
      </div>
    );
  }

  if (!gatewayHealth) {
    return (
      <div className="container">
        <div className="alert alert-error">
          ⚠️ Cannot connect to API Gateway on http://localhost:3000
          <br />
          Please start the backend services using: docker compose up --build
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🛍️ Microservices Store</h1>
        <p>E-commerce Application with Node.js and MongoDB</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </button>
      </div>

      <div className={`section ${activeTab === 'users' ? 'active' : ''}`}>
        <Users />
      </div>

      <div className={`section ${activeTab === 'products' ? 'active' : ''}`}>
        <Products />
      </div>

      <div className={`section ${activeTab === 'orders' ? 'active' : ''}`}>
        <Orders />
      </div>
    </div>
  );
}

export default App;
