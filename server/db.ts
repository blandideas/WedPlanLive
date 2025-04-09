import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Create a database connection
const connectionString = process.env.DATABASE_URL!;

// For different environments
let client: any;
let db: any;

// Regular postgres client for development
client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for better compatibility
  ssl: process.env.NODE_ENV === 'production' // Enable SSL in production
});

db = drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  console.log("Database connection established");
}

export { db };

// For Vercel serverless environment, we use a special import in api/index.ts instead