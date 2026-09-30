import React, { useState, useEffect } from 'react';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setFormData({ name: '', email: '' });
        await fetchUsers();
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create user' });
    }
  };

  return (
    <>
      <div className="form-group">
        <h2>Create User</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✓' : '✗'} {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-input">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="form-input">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>

      <div className="list-container">
        <h2>Users List</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users found. Create one above!</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="list-item">
              <div className="list-item-header">
                <h3>{user.name}</h3>
                <span className="list-item-badge">ID: {user._id.substring(0, 8)}...</span>
              </div>
              <div className="list-item-details">
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{user.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">
                    {new Date(user.createdAt).toLocaleDateString()}
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

export default Users;
