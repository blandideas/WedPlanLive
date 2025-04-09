#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

echo "Starting Vercel build process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set. Database tables may not be created properly."
  echo "Please set the DATABASE_URL environment variable in your Vercel project settings."
else
  echo "DATABASE_URL is set, proceeding with migrations..."
fi

# Try multiple migration approaches
echo "Running database migrations..."

# First try - direct SQL approach
if [ -n "$DATABASE_URL" ]; then
  # This always runs - direct SQL works even in serverless environments
  echo "Running in-script migration with direct SQL..."
  node -e "
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    async function createTables() {
      try {
        // Create users table
        await sql\`CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )\`;
        
        // Create tasks table
        await sql\`CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          due_date TEXT NOT NULL,
          priority TEXT NOT NULL,
          status TEXT NOT NULL
        )\`;
        
        // Create vendors table
        await sql\`CREATE TABLE IF NOT EXISTS vendors (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          contact TEXT,
          phone TEXT,
          email TEXT
        )\`;
        
        // Create budgets table
        await sql\`CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          amount DOUBLE PRECISION NOT NULL
        )\`;
        
        // Create expenses table
        await sql\`CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          item TEXT NOT NULL,
          vendor TEXT,
          amount DOUBLE PRECISION NOT NULL
        )\`;
        
        // Create packing_lists table
        await sql\`CREATE TABLE IF NOT EXISTS packing_lists (
          id SERIAL PRIMARY KEY,
          activity TEXT NOT NULL,
          description TEXT
        )\`;
        
        // Create packing_items table
        await sql\`CREATE TABLE IF NOT EXISTS packing_items (
          id SERIAL PRIMARY KEY,
          list_id INTEGER NOT NULL,
          item TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          packed BOOLEAN NOT NULL DEFAULT false
        )\`;
        
        // Create payments table
        await sql\`CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          vendor_id INTEGER NOT NULL,
          amount DOUBLE PRECISION NOT NULL,
          date TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          is_paid BOOLEAN NOT NULL DEFAULT false
        )\`;
        
        console.log('Database tables created successfully!');
      } catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
      }
    }
    
    createTables();
  "
  
  # Second try - drizzle-kit push
  echo "Also running drizzle-kit push as a backup..."
  npm run db:push || echo "Drizzle-kit push failed, but direct SQL migration should have worked"
fi

# Build the frontend using Vite
echo "Building frontend..."
vite build

# Build the serverless API
echo "Building serverless API..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully"