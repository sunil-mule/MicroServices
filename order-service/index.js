const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orders_db';
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: 'CREATED' },
  },
  { timestamps: true }
);
const Order = mongoose.model('Order', orderSchema);

app.get('/health', (req, res) => res.json({ service: 'order-service', status: 'ok' }));

app.post('/orders', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    // 1. Does the user exist? (call user-service)
    const userRes = await fetch(`${USER_URL}/users/${userId}`);
    if (!userRes.ok) return res.status(404).json({ error: 'User not found' });

    // 2. Does the product exist? (call product-service)
    const productRes = await fetch(`${PRODUCT_URL}/products/${productId}`);
    if (!productRes.ok) return res.status(404).json({ error: 'Product not found' });
    const product = await productRes.json();

    // 3. Reserve stock (call product-service)
    const stockRes = await fetch(`${PRODUCT_URL}/products/${productId}/decrease-stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!stockRes.ok) return res.status(409).json({ error: 'Insufficient stock' });

    // 4. Save the order in our own database
    const order = await Order.create({
      userId,
      productId,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(502).json({ error: 'Downstream service error', details: err.message });
  }
});

app.get('/orders', async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};
  res.json(await Order.find(filter));
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Invalid order id' });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('order-service connected to MongoDB');
    app.listen(PORT, () => console.log(`order-service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
