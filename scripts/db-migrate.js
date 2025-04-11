// Database migration script
// This script is used to create database tables
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Get the database URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL environment variable is not set, cannot run migration');
      process.exit(1);
    }
    
    // Create the database connection
    const sql = neon(dbUrl);
    const db = drizzle(sql, { schema });
    
    // Create each table manually using SQL according to the schema
    console.log('Creating tables...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL
      )
    `;
    
    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "due_date" TEXT NOT NULL,
        "priority" TEXT NOT NULL,
        "status" TEXT NOT NULL
      )
    `;
    
    // Create vendors table
    await sql`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "contact" TEXT,
        "phone" TEXT,
        "email" TEXT
      )
    `;
    
    // Create budgets table
    await sql`
      CREATE TABLE IF NOT EXISTS "budgets" (
        "id" SERIAL PRIMARY KEY,
        "amount" DOUBLE PRECISION NOT NULL
      )
    `;
    
    // Create expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" SERIAL PRIMARY KEY,
        "category" TEXT NOT NULL,
        "item" TEXT NOT NULL,
        "vendor" TEXT,
        "amount" DOUBLE PRECISION NOT NULL
      )
    `;
    
    // Create packing_lists table
    await sql`
      CREATE TABLE IF NOT EXISTS "packing_lists" (
        "id" SERIAL PRIMARY KEY,
        "activity" TEXT NOT NULL,
        "description" TEXT
      )
    `;
    
    // Create packing_items table
    await sql`
      CREATE TABLE IF NOT EXISTS "packing_items" (
        "id" SERIAL PRIMARY KEY,
        "list_id" INTEGER NOT NULL,
        "item" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "packed" BOOLEAN NOT NULL DEFAULT false
      )
    `;
    
    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" SERIAL PRIMARY KEY,
        "vendor_id" INTEGER NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "date" TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "is_paid" BOOLEAN NOT NULL DEFAULT false
      )
    `;
    
    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Run the migration
migrateDatabase();