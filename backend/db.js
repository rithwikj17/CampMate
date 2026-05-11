const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (Neon/Render) and individual env vars
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      database: process.env.DB_NAME || 'campmate',
    };

const pool = new Pool(dbConfig);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 5, retryDelay = 3000) => {
  let attempt = 1;
  while (attempt <= retries) {
    try {
      const host = process.env.DATABASE_URL ? 'Neon cloud' : `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5433}/${process.env.DB_NAME || 'campmate'}`;
      console.log(`[DB] Attempting to connect to PostgreSQL at ${host}... (Attempt ${attempt}/${retries})`);
      const client = await pool.connect();
      console.log('✅ [DB] Successfully connected to PostgreSQL');
      client.release();
      return true;
    } catch (err) {
      console.error(`❌ [DB] Connection failed: ${err.message}`);
      if (attempt === retries) {
        console.error('💥 [DB] Max retries reached. Could not connect to the database.');
        throw err;
      }
      console.log(`⏳ [DB] Retrying in ${retryDelay / 1000} seconds...`);
      await delay(retryDelay);
      attempt++;
    }
  }
};

const testConnection = async () => {
  return await connectWithRetry();
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params)
};
