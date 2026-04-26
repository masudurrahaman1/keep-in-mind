const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB();

const fs = require('fs');
const path = require('path');
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath) || !process.env.JWT_SECRET) {
  console.warn('\n⚠️  WARNING: backend/serviceAccountKey.json or JWT_SECRET is missing!');
  console.warn('Authentication will fail until these are configured.\n');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
