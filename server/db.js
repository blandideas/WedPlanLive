// CommonJS version of db.js for production deployment
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { config } = require('dotenv');

// Load environment variables from .env file
config();

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Attempting to connect to database...');

// Check if SSL is enabled (default to true in production)
const useSSL = process.env.NODE_ENV === 'production' && 
               process.env.DATABASE_SSL !== 'false';

// Configure database connection
const options = {
  ssl: useSSL,
  max: 10, // Maximum number of connections
  idle_timeout: 30,
  connection: {
    application_name: 'wedding-planner-app'
  }
};

// Create Postgres client
const sql = postgres(connectionString, options);

// Create Drizzle ORM instance
const db = drizzle(sql);

// Log successful connection
console.log('Database connection established successfully');

// Export database connection
module.exports = { db, sql };