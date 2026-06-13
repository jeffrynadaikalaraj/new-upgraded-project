const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Force Google DNS to bypass local Windows/hotspot DNS issues with SRV records
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log(`[DB] Using DNS Servers: ${dns.getServers().join(', ')}`);

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
    console.log(`[DB] Attempting connection to: ${maskedUri}`);

    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`[DB] Connection State: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error(`[DB] Error Name: ${error.name}`);
    console.error(`[DB] Error Message: ${error.message}`);
    console.error(`[DB] Stack Trace:\n${error.stack}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
