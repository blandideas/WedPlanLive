// Database migration for Vercel
import { sql } from '@neondatabase/serverless';
import * as schema from "../shared/schema";

export default async function handler(req, res) {
  try {
    console.log("Starting database migration...");
    
    // Connect to database with SSL enabled
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Check if tables exist
    const tablesExist = await checkTables();
    
    if (tablesExist) {
      console.log("Tables already exist, skipping migration");
      return res.status(200).json({ message: "Tables already exist, no migration needed" });
    }
    
    // Create tables
    await createTables();
    
    return res.status(200).json({ message: "Migration completed successfully" });
  } catch (error) {
    console.error("Migration error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function checkTables() {
  try {
    // Try querying one of the main tables
    await sql`SELECT COUNT(*) FROM tasks`;
    return true;
  } catch (error) {
    // If error contains "relation does not exist", tables don't exist
    if (error.message.includes("does not exist")) {
      return false;
    }
    // Rethrow any other errors
    throw error;
  }
}

async function createTables() {
  console.log("Creating tables...");
  
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `;
  
  // Create tasks table
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      due_date TIMESTAMP,
      priority TEXT,
      status TEXT
    )
  `;
  
  // Create vendors table
  await sql`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      service TEXT,
      contact TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      notes TEXT
    )
  `;
  
  // Create budgets table
  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      amount INTEGER NOT NULL
    )
  `;
  
  // Create expenses table
  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      category TEXT,
      item TEXT NOT NULL,
      vendor TEXT,
      amount INTEGER NOT NULL
    )
  `;
  
  // Create packing_lists table
  await sql`
    CREATE TABLE IF NOT EXISTS packing_lists (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `;
  
  // Create packing_items table
  await sql`
    CREATE TABLE IF NOT EXISTS packing_items (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES packing_lists(id),
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      packed BOOLEAN NOT NULL DEFAULT false
    )
  `;
  
  // Create payments table
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER REFERENCES vendors(id),
      amount INTEGER NOT NULL,
      date TIMESTAMP NOT NULL,
      method TEXT,
      notes TEXT
    )
  `;
  
  console.log("All tables created successfully");
}