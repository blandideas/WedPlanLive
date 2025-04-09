// This is a Node.js script to run database migrations during Vercel build
// It implements the migration in JavaScript to avoid TypeScript compilation issues

const { execSync } = require('child_process');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

async function runMigrations() {
  console.log("Running database migrations from Node.js build script...");
  
  // First try using drizzle-kit through npm script
  try {
    console.log("Attempting to run standard migrations via npm script...");
    execSync("npm run db:push", { stdio: 'inherit' });
    console.log("Standard migrations completed successfully");
    return;
  } catch (e) {
    console.log("Standard migration failed, falling back to direct database creation");
  }

  // Fall back to direct table creation
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set, cannot run migrations");
    return;
  }

  try {
    console.log("Creating database connection...");
    const sql = neon(process.env.DATABASE_URL);
    
    console.log("Creating tables...");
    
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
    
    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error running database migrations:", error);
    throw error;
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  runMigrations().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}

module.exports = { runMigrations };