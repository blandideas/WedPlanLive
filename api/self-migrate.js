// Self-contained migration script for Vercel that doesn't rely on imports
const { neon } = require('@neondatabase/serverless');

// Function to safely check if a table exists
async function tableExists(sql, tableName) {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ) as exists
  `;
  return result[0]?.exists || false;
}

// Create missing tables
async function createTables(sql) {
  const tables = [];
  const errors = [];

  // Users table
  if (!await tableExists(sql, 'users')) {
    try {
      await sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('users');
    } catch (e) {
      errors.push({ table: 'users', error: e.message });
    }
  }

  // Tasks table
  if (!await tableExists(sql, 'tasks')) {
    try {
      await sql`
        CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo',
          due_date TIMESTAMP,
          priority TEXT DEFAULT 'medium',
          category TEXT,
          assigned_to TEXT,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('tasks');
    } catch (e) {
      errors.push({ table: 'tasks', error: e.message });
    }
  }

  // Vendors table
  if (!await tableExists(sql, 'vendors')) {
    try {
      await sql`
        CREATE TABLE vendors (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          contact_name TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          category TEXT,
          website TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('vendors');
    } catch (e) {
      errors.push({ table: 'vendors', error: e.message });
    }
  }

  // Budget table
  if (!await tableExists(sql, 'budget')) {
    try {
      await sql`
        CREATE TABLE budget (
          id SERIAL PRIMARY KEY,
          total_amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('budget');
    } catch (e) {
      errors.push({ table: 'budget', error: e.message });
    }
  }

  // Expenses table
  if (!await tableExists(sql, 'expenses')) {
    try {
      await sql`
        CREATE TABLE expenses (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          category TEXT,
          vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
          date TIMESTAMP,
          paid BOOLEAN DEFAULT false,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('expenses');
    } catch (e) {
      errors.push({ table: 'expenses', error: e.message });
    }
  }

  // Packing lists table
  if (!await tableExists(sql, 'packing_lists')) {
    try {
      await sql`
        CREATE TABLE packing_lists (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('packing_lists');
    } catch (e) {
      errors.push({ table: 'packing_lists', error: e.message });
    }
  }

  // Packing items table
  if (!await tableExists(sql, 'packing_items')) {
    try {
      await sql`
        CREATE TABLE packing_items (
          id SERIAL PRIMARY KEY,
          list_id INTEGER NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          packed BOOLEAN DEFAULT false,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('packing_items');
    } catch (e) {
      errors.push({ table: 'packing_items', error: e.message });
    }
  }

  // Payments table
  if (!await tableExists(sql, 'payments')) {
    try {
      await sql`
        CREATE TABLE payments (
          id SERIAL PRIMARY KEY,
          vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_date TIMESTAMP,
          payment_method TEXT,
          reference_number TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      tables.push('payments');
    } catch (e) {
      errors.push({ table: 'payments', error: e.message });
    }
  }

  return { tables, errors };
}

// Handler for Vercel serverless function
module.exports = async (req, res) => {
  try {
    // Ensure we have a database URL
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: "DATABASE_URL environment variable is not set" 
      });
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL);
    
    // Perform migration
    const migrationResult = await createTables(sql);
    
    // Get current tables
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Return results
    return res.status(200).json({
      success: true,
      message: "Database migration completed",
      tablesCreated: migrationResult.tables,
      errors: migrationResult.errors,
      existingTables: existingTables.map(t => t.table_name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || String(error),
      timestamp: new Date().toISOString()
    });
  }
};