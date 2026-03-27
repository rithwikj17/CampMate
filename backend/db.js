const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'campmate'
};

const pool = new Pool(dbConfig);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 5, retryDelay = 3000) => {
  let attempt = 1;
  while (attempt <= retries) {
    try {
      console.log(`[DB] Attempting to connect to PostgreSQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}... (Attempt ${attempt}/${retries})`);
      const client = await pool.connect();
      console.log('✅ [DB] Successfully connected to PostgreSQL');
      client.release(); // release immediately
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
