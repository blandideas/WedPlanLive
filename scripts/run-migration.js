// Run migration script directly
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function runMigration() {
  try {
    console.log('Starting database initialization...');
    
    // Get the database URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL environment variable is not set');
      return;
    }
    
    // Create the database connection using just neon (no drizzle)
    const sql = neon(dbUrl);
    
    // Create each table using direct SQL
    console.log('Creating tables...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;
    console.log('- Created users table');
    
    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        due_date TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL
      )
    `;
    console.log('- Created tasks table');
    
    // Create vendors table
    await sql`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT
      )
    `;
    console.log('- Created vendors table');
    
    // Create budgets table
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        amount DOUBLE PRECISION NOT NULL
      )
    `;
    console.log('- Created budgets table');
    
    // Create expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        item TEXT NOT NULL,
        vendor TEXT,
        amount DOUBLE PRECISION NOT NULL
      )
    `;
    console.log('- Created expenses table');
    
    // Create packing_lists table
    await sql`
      CREATE TABLE IF NOT EXISTS packing_lists (
        id SERIAL PRIMARY KEY,
        activity TEXT NOT NULL,
        description TEXT
      )
    `;
    console.log('- Created packing_lists table');
    
    // Create packing_items table
    await sql`
      CREATE TABLE IF NOT EXISTS packing_items (
        id SERIAL PRIMARY KEY,
        list_id INTEGER NOT NULL,
        item TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        packed BOOLEAN NOT NULL DEFAULT false
      )
    `;
    console.log('- Created packing_items table');
    
    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        is_paid BOOLEAN NOT NULL DEFAULT false
      )
    `;
    console.log('- Created payments table');
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Run the migration
runMigration();