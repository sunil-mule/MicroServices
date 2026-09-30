const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/products_db';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);
const Product = mongoose.model('Product', productSchema);

app.get('/health', (req, res) => res.json({ service: 'product-service', status: 'ok' }));

app.post('/products', async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/products', async (req, res) => {
  res.json(await Product.find());
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Invalid product id' });
  }
});

app.patch('/products/:id/decrease-stock', async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );
    if (!product) return res.status(409).json({ error: 'Insufficient stock' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('product-service connected to MongoDB');
    app.listen(PORT, () => console.log(`product-service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
