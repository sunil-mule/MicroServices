const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

const routes = {
  '/users': process.env.USER_SERVICE_URL || 'http://localhost:3001',
  '/products': process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  '/orders': process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
};

app.get('/health', (req, res) => res.json({ service: 'api-gateway', status: 'ok' }));

for (const [prefix, target] of Object.entries(routes)) {
  app.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathFilter: prefix,
      on: {
        error: (err, req, res) =>
          res.status(503).json({ error: `Service for ${prefix} unavailable` }),
      },
    })
  );
}

app.listen(PORT, () => console.log(`api-gateway running on port ${PORT}`));
