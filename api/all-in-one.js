// All-in-one API implementation specifically for Vercel deployment
// This file contains all API endpoints in a single file with minimal dependencies
const express = require('express');
const { neon, neonConfig } = require('@neondatabase/serverless');

// Configure Neon for better performance in serverless
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = true;

// Initialize SQL function
let sql;
try {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  }
} catch (error) {
  console.error("Error initializing database:", error);
}

// Helper function to safely execute SQL
async function executeSql(query, params = []) {
  try {
    if (!sql) {
      throw new Error("Database not initialized");
    }
    return await query(sql, ...params);
  } catch (error) {
    console.error("SQL error:", error);
    throw error;
  }
}

// Route handlers for each API endpoint
const handlers = {
  // Tasks API
  async getTasks() {
    return executeSql(sql => sql`SELECT * FROM tasks ORDER BY due_date`);
  },
  
  async getTask(id) {
    const results = await executeSql(sql => sql`SELECT * FROM tasks WHERE id = ${id}`);
    return results[0];
  },
  
  async createTask(task) {
    const { title, description, status, due_date, priority, category, assigned_to } = task;
    const results = await executeSql(sql => sql`
      INSERT INTO tasks (title, description, status, due_date, priority, category, assigned_to)
      VALUES (${title}, ${description}, ${status}, ${due_date}, ${priority}, ${category}, ${assigned_to})
      RETURNING *
    `);
    return results[0];
  },
  
  async updateTask(id, task) {
    // Dynamically build update query from provided fields
    const updates = [];
    const values = [];
    
    Object.entries(task).forEach(([key, value]) => {
      if (key !== 'id') { // Skip id
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updates.length === 0) return null;
    
    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `;
    
    // For this specific case, we need to use a different approach for the dynamic query
    const results = await executeSql(sql => {
      // Convert the query to use numbered parameters instead of ?
      let numberedQuery = query;
      for (let i = 1; i <= values.length; i++) {
        numberedQuery = numberedQuery.replace('?', `$${i}`);
      }
      
      // Execute with neon's tagged template literal approach
      return sql([numberedQuery], values);
    });
    
    return results[0];
  },
  
  async deleteTask(id) {
    await executeSql(sql => sql`DELETE FROM tasks WHERE id = ${id}`);
    return true;
  },
  
  // Vendors API
  async getVendors() {
    return executeSql(sql => sql`SELECT * FROM vendors ORDER BY name`);
  },
  
  async getVendor(id) {
    const results = await executeSql(sql => sql`SELECT * FROM vendors WHERE id = ${id}`);
    return results[0];
  },
  
  async createVendor(vendor) {
    const { name, contact_name, contact_email, contact_phone, category, website, notes } = vendor;
    const results = await executeSql(sql => sql`
      INSERT INTO vendors (name, contact_name, contact_email, contact_phone, category, website, notes)
      VALUES (${name}, ${contact_name}, ${contact_email}, ${contact_phone}, ${category}, ${website}, ${notes})
      RETURNING *
    `);
    return results[0];
  },
  
  // Budget API
  async getBudget() {
    const results = await executeSql(sql => sql`SELECT * FROM budget LIMIT 1`);
    return results[0];
  },
  
  async setBudget(budget) {
    const { total_amount, currency } = budget;
    
    // Check if budget exists
    const existing = await this.getBudget();
    
    if (existing) {
      // Update existing budget
      const results = await executeSql(sql => sql`
        UPDATE budget 
        SET total_amount = ${total_amount}, currency = ${currency}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
        RETURNING *
      `);
      return results[0];
    } else {
      // Create new budget
      const results = await executeSql(sql => sql`
        INSERT INTO budget (total_amount, currency)
        VALUES (${total_amount}, ${currency})
        RETURNING *
      `);
      return results[0];
    }
  },
  
  // Expenses API
  async getExpenses() {
    return executeSql(sql => sql`
      SELECT e.*, v.name as vendor_name 
      FROM expenses e
      LEFT JOIN vendors v ON e.vendor_id = v.id
      ORDER BY e.date
    `);
  },
  
  async getExpense(id) {
    const results = await executeSql(sql => sql`
      SELECT e.*, v.name as vendor_name 
      FROM expenses e
      LEFT JOIN vendors v ON e.vendor_id = v.id
      WHERE e.id = ${id}
    `);
    return results[0];
  },
  
  async createExpense(expense) {
    const { title, amount, category, vendor_id, date, paid, notes } = expense;
    const results = await executeSql(sql => sql`
      INSERT INTO expenses (title, amount, category, vendor_id, date, paid, notes)
      VALUES (${title}, ${amount}, ${category}, ${vendor_id}, ${date}, ${paid}, ${notes})
      RETURNING *
    `);
    return results[0];
  }
};

// Database setup and migration helper
async function ensureTables() {
  if (!sql) return { success: false, message: "Database not initialized" };
  
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    const missingTables = [];
    
    // Create tasks table if it doesn't exist
    if (!tableNames.includes('tasks')) {
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
      missingTables.push('tasks');
    }
    
    // Create vendors table if it doesn't exist
    if (!tableNames.includes('vendors')) {
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
      missingTables.push('vendors');
    }
    
    // Create budget table if it doesn't exist
    if (!tableNames.includes('budget')) {
      await sql`
        CREATE TABLE budget (
          id SERIAL PRIMARY KEY,
          total_amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      missingTables.push('budget');
    }
    
    // Create expenses table if it doesn't exist
    if (!tableNames.includes('expenses')) {
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
      missingTables.push('expenses');
    }
    
    return { 
      success: true, 
      message: missingTables.length > 0 
        ? `Created tables: ${missingTables.join(', ')}` 
        : "All tables already exist",
      tables: tableNames
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to ensure tables", 
      error: error.message 
    };
  }
}

// Main request handler for all API routes
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Basic diagnostics
    if (req.url === '/api/info') {
      return res.status(200).json({
        message: "API is running",
        database: !!sql ? "initialized" : "not initialized",
        databaseUrl: process.env.DATABASE_URL ? "set (value hidden)" : "not set",
        timestamp: new Date().toISOString()
      });
    }
    
    // Database setup
    if (req.url === '/api/setup-db') {
      const setupResult = await ensureTables();
      return res.status(setupResult.success ? 200 : 500).json(setupResult);
    }
    
    // API endpoints
    
    // Tasks
    if (req.url === '/api/tasks' && req.method === 'GET') {
      const tasks = await handlers.getTasks();
      return res.status(200).json(tasks);
    }
    
    if (req.url.match(/^\/api\/tasks\/\d+$/) && req.method === 'GET') {
      const id = parseInt(req.url.split('/').pop());
      const task = await handlers.getTask(id);
      return task 
        ? res.status(200).json(task)
        : res.status(404).json({ message: "Task not found" });
    }
    
    if (req.url === '/api/tasks' && req.method === 'POST') {
      // Parse request body
      const body = await parseBody(req);
      const task = await handlers.createTask(body);
      return res.status(201).json(task);
    }
    
    if (req.url.match(/^\/api\/tasks\/\d+$/) && req.method === 'PATCH') {
      const id = parseInt(req.url.split('/').pop());
      const body = await parseBody(req);
      const task = await handlers.updateTask(id, body);
      return task 
        ? res.status(200).json(task)
        : res.status(404).json({ message: "Task not found" });
    }
    
    if (req.url.match(/^\/api\/tasks\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(req.url.split('/').pop());
      await handlers.deleteTask(id);
      return res.status(204).end();
    }
    
    // Vendors
    if (req.url === '/api/vendors' && req.method === 'GET') {
      const vendors = await handlers.getVendors();
      return res.status(200).json(vendors);
    }
    
    if (req.url.match(/^\/api\/vendors\/\d+$/) && req.method === 'GET') {
      const id = parseInt(req.url.split('/').pop());
      const vendor = await handlers.getVendor(id);
      return vendor 
        ? res.status(200).json(vendor)
        : res.status(404).json({ message: "Vendor not found" });
    }
    
    if (req.url === '/api/vendors' && req.method === 'POST') {
      const body = await parseBody(req);
      const vendor = await handlers.createVendor(body);
      return res.status(201).json(vendor);
    }
    
    // Budget
    if (req.url === '/api/budget' && req.method === 'GET') {
      const budget = await handlers.getBudget();
      return budget 
        ? res.status(200).json(budget)
        : res.status(404).json({ message: "Budget not found" });
    }
    
    if (req.url === '/api/budget' && req.method === 'POST') {
      const body = await parseBody(req);
      const budget = await handlers.setBudget(body);
      return res.status(201).json(budget);
    }
    
    // Expenses
    if (req.url === '/api/expenses' && req.method === 'GET') {
      const expenses = await handlers.getExpenses();
      return res.status(200).json(expenses);
    }
    
    if (req.url.match(/^\/api\/expenses\/\d+$/) && req.method === 'GET') {
      const id = parseInt(req.url.split('/').pop());
      const expense = await handlers.getExpense(id);
      return expense 
        ? res.status(200).json(expense)
        : res.status(404).json({ message: "Expense not found" });
    }
    
    if (req.url === '/api/expenses' && req.method === 'POST') {
      const body = await parseBody(req);
      const expense = await handlers.createExpense(body);
      return res.status(201).json(expense);
    }
    
    // Fallback for unknown routes
    return res.status(404).json({ message: "API endpoint not found" });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: "API error",
      error: error.message || String(error)
    });
  }
};

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}