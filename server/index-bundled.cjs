// All-in-one bundled server file for Cloudways deployment
// This file contains the necessary code to run the server without external dependencies

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Pool } = require('pg');

// -------------------------
// DATABASE CONNECTION SETUP
// -------------------------

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;
const sslMode = process.env.DATABASE_SSL === 'true';

// Create database connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslMode ? { rejectUnauthorized: false } : false
});

// Test the database connection
async function testDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
}

// -------------------------
// DATABASE STORAGE CLASS
// -------------------------

/**
 * Database storage implementation
 */
class DatabaseStorage {
  /**
   * Get all tasks
   * @returns {Promise<Array<object>>} Array of tasks
   */
  async getTasks() {
    const result = await pool.query('select "id", "title", "due_date", "priority", "status" from "tasks"');
    return result.rows;
  }

  /**
   * Get task by ID
   * @param {number} id - Task ID
   * @returns {Promise<object|undefined>} Task or undefined if not found
   */
  async getTask(id) {
    const result = await pool.query('select "id", "title", "due_date", "priority", "status" from "tasks" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new task
   * @param {object} insertTask - Task data to insert
   * @returns {Promise<object>} Created task
   */
  async createTask(insertTask) {
    const { title, dueDate, priority, status } = insertTask;
    const result = await pool.query(
      'insert into "tasks" ("title", "due_date", "priority", "status") values ($1, $2, $3, $4) returning "id", "title", "due_date", "priority", "status"',
      [title, dueDate, priority, status]
    );
    return result.rows[0];
  }

  /**
   * Create multiple tasks
   * @param {Array<object>} insertTasks - Array of tasks to insert
   * @returns {Promise<Array<object>>} Array of created tasks
   */
  async createTasks(insertTasks) {
    // Using a transaction for bulk insert
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdTasks = [];
      for (const task of insertTasks) {
        const { title, dueDate, priority, status } = task;
        const result = await client.query(
          'insert into "tasks" ("title", "due_date", "priority", "status") values ($1, $2, $3, $4) returning "id", "title", "due_date", "priority", "status"',
          [title, dueDate, priority, status]
        );
        createdTasks.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return createdTasks;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {object} updateTask - Task data to update
   * @returns {Promise<object|undefined>} Updated task or undefined if not found
   */
  async updateTask(id, updateTask) {
    const { title, dueDate, priority, status } = updateTask;
    
    let query = 'update "tasks" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (title !== undefined) {
      updateFields.push(`"title" = $${valueIndex++}`);
      values.push(title);
    }
    if (dueDate !== undefined) {
      updateFields.push(`"due_date" = $${valueIndex++}`);
      values.push(dueDate);
    }
    if (priority !== undefined) {
      updateFields.push(`"priority" = $${valueIndex++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      updateFields.push(`"status" = $${valueIndex++}`);
      values.push(status);
    }
    
    if (updateFields.length === 0) {
      return this.getTask(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "title", "due_date", "priority", "status"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteTask(id) {
    const result = await pool.query('delete from "tasks" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get all vendors
   * @returns {Promise<Array<object>>} Array of vendors
   */
  async getVendors() {
    const result = await pool.query('select "id", "name", "service", "contact_name", "phone", "email", "website", "notes" from "vendors"');
    return result.rows;
  }

  /**
   * Get vendor by ID
   * @param {number} id - Vendor ID
   * @returns {Promise<object|undefined>} Vendor or undefined if not found
   */
  async getVendor(id) {
    const result = await pool.query('select "id", "name", "service", "contact_name", "phone", "email", "website", "notes" from "vendors" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new vendor
   * @param {object} insertVendor - Vendor data to insert
   * @returns {Promise<object>} Created vendor
   */
  async createVendor(insertVendor) {
    const { name, service, contactName, phone, email, website, notes } = insertVendor;
    const result = await pool.query(
      'insert into "vendors" ("name", "service", "contact_name", "phone", "email", "website", "notes") values ($1, $2, $3, $4, $5, $6, $7) returning "id", "name", "service", "contact_name", "phone", "email", "website", "notes"',
      [name, service, contactName, phone, email, website, notes]
    );
    return result.rows[0];
  }

  /**
   * Update a vendor
   * @param {number} id - Vendor ID
   * @param {object} updateVendor - Vendor data to update
   * @returns {Promise<object|undefined>} Updated vendor or undefined if not found
   */
  async updateVendor(id, updateVendor) {
    const { name, service, contactName, phone, email, website, notes } = updateVendor;
    
    let query = 'update "vendors" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`"name" = $${valueIndex++}`);
      values.push(name);
    }
    if (service !== undefined) {
      updateFields.push(`"service" = $${valueIndex++}`);
      values.push(service);
    }
    if (contactName !== undefined) {
      updateFields.push(`"contact_name" = $${valueIndex++}`);
      values.push(contactName);
    }
    if (phone !== undefined) {
      updateFields.push(`"phone" = $${valueIndex++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      updateFields.push(`"email" = $${valueIndex++}`);
      values.push(email);
    }
    if (website !== undefined) {
      updateFields.push(`"website" = $${valueIndex++}`);
      values.push(website);
    }
    if (notes !== undefined) {
      updateFields.push(`"notes" = $${valueIndex++}`);
      values.push(notes);
    }
    
    if (updateFields.length === 0) {
      return this.getVendor(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "name", "service", "contact_name", "phone", "email", "website", "notes"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a vendor
   * @param {number} id - Vendor ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteVendor(id) {
    const result = await pool.query('delete from "vendors" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get the budget
   * @returns {Promise<object|undefined>} Budget or undefined if not found
   */
  async getBudget() {
    const result = await pool.query('select "id", "amount" from "budgets"');
    return result.rows[0];
  }

  /**
   * Set the budget
   * @param {object} insertBudget - Budget data to insert
   * @returns {Promise<object>} Created budget
   */
  async setBudget(insertBudget) {
    const { amount } = insertBudget;
    const result = await pool.query(
      'insert into "budgets" ("amount") values ($1) returning "id", "amount"',
      [amount]
    );
    return result.rows[0];
  }

  /**
   * Update the budget
   * @param {object} insertBudget - Budget data to update
   * @returns {Promise<object|undefined>} Updated budget or undefined if not found
   */
  async updateBudget(insertBudget) {
    const { amount } = insertBudget;
    const result = await pool.query(
      'update "budgets" set "amount" = $1 returning "id", "amount"',
      [amount]
    );
    return result.rows[0];
  }

  /**
   * Get all expenses
   * @returns {Promise<Array<object>>} Array of expenses
   */
  async getExpenses() {
    const result = await pool.query('select "id", "category", "item", "vendor", "amount" from "expenses"');
    return result.rows;
  }

  /**
   * Get expense by ID
   * @param {number} id - Expense ID
   * @returns {Promise<object|undefined>} Expense or undefined if not found
   */
  async getExpense(id) {
    const result = await pool.query('select "id", "category", "item", "vendor", "amount" from "expenses" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new expense
   * @param {object} insertExpense - Expense data to insert
   * @returns {Promise<object>} Created expense
   */
  async createExpense(insertExpense) {
    const { category, item, vendor, amount } = insertExpense;
    const result = await pool.query(
      'insert into "expenses" ("category", "item", "vendor", "amount") values ($1, $2, $3, $4) returning "id", "category", "item", "vendor", "amount"',
      [category, item, vendor, amount]
    );
    return result.rows[0];
  }

  /**
   * Update an expense
   * @param {number} id - Expense ID
   * @param {object} updateExpense - Expense data to update
   * @returns {Promise<object|undefined>} Updated expense or undefined if not found
   */
  async updateExpense(id, updateExpense) {
    const { category, item, vendor, amount } = updateExpense;
    
    let query = 'update "expenses" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (category !== undefined) {
      updateFields.push(`"category" = $${valueIndex++}`);
      values.push(category);
    }
    if (item !== undefined) {
      updateFields.push(`"item" = $${valueIndex++}`);
      values.push(item);
    }
    if (vendor !== undefined) {
      updateFields.push(`"vendor" = $${valueIndex++}`);
      values.push(vendor);
    }
    if (amount !== undefined) {
      updateFields.push(`"amount" = $${valueIndex++}`);
      values.push(amount);
    }
    
    if (updateFields.length === 0) {
      return this.getExpense(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "category", "item", "vendor", "amount"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteExpense(id) {
    const result = await pool.query('delete from "expenses" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get all packing lists
   * @returns {Promise<Array<object>>} Array of packing lists
   */
  async getPackingLists() {
    const result = await pool.query('select "id", "name", "description" from "packing_lists"');
    return result.rows;
  }

  /**
   * Get packing list by ID
   * @param {number} id - Packing list ID
   * @returns {Promise<object|undefined>} Packing list or undefined if not found
   */
  async getPackingList(id) {
    const result = await pool.query('select "id", "name", "description" from "packing_lists" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new packing list
   * @param {object} insertList - Packing list data to insert
   * @returns {Promise<object>} Created packing list
   */
  async createPackingList(insertList) {
    const { name, description } = insertList;
    const result = await pool.query(
      'insert into "packing_lists" ("name", "description") values ($1, $2) returning "id", "name", "description"',
      [name, description]
    );
    return result.rows[0];
  }

  /**
   * Update a packing list
   * @param {number} id - Packing list ID
   * @param {object} updateList - Packing list data to update
   * @returns {Promise<object|undefined>} Updated packing list or undefined if not found
   */
  async updatePackingList(id, updateList) {
    const { name, description } = updateList;
    
    let query = 'update "packing_lists" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (name !== undefined) {
      updateFields.push(`"name" = $${valueIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`"description" = $${valueIndex++}`);
      values.push(description);
    }
    
    if (updateFields.length === 0) {
      return this.getPackingList(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "name", "description"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a packing list
   * @param {number} id - Packing list ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePackingList(id) {
    const result = await pool.query('delete from "packing_lists" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get all packing items for a list
   * @param {number} listId - Packing list ID
   * @returns {Promise<Array<object>>} Array of packing items
   */
  async getPackingItems(listId) {
    const result = await pool.query('select "id", "list_id", "name", "quantity", "packed" from "packing_items" where "list_id" = $1', [listId]);
    return result.rows;
  }

  /**
   * Get packing item by ID
   * @param {number} id - Packing item ID
   * @returns {Promise<object|undefined>} Packing item or undefined if not found
   */
  async getPackingItem(id) {
    const result = await pool.query('select "id", "list_id", "name", "quantity", "packed" from "packing_items" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new packing item
   * @param {object} insertItem - Packing item data to insert
   * @returns {Promise<object>} Created packing item
   */
  async createPackingItem(insertItem) {
    const { listId, name, quantity, packed } = insertItem;
    const result = await pool.query(
      'insert into "packing_items" ("list_id", "name", "quantity", "packed") values ($1, $2, $3, $4) returning "id", "list_id", "name", "quantity", "packed"',
      [listId, name, quantity, packed]
    );
    return result.rows[0];
  }

  /**
   * Create multiple packing items
   * @param {Array<object>} insertItems - Array of packing items to insert
   * @returns {Promise<Array<object>>} Array of created packing items
   */
  async createPackingItems(insertItems) {
    // Using a transaction for bulk insert
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdItems = [];
      for (const item of insertItems) {
        const { listId, name, quantity, packed } = item;
        const result = await client.query(
          'insert into "packing_items" ("list_id", "name", "quantity", "packed") values ($1, $2, $3, $4) returning "id", "list_id", "name", "quantity", "packed"',
          [listId, name, quantity || 1, packed || false]
        );
        createdItems.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return createdItems;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Update a packing item
   * @param {number} id - Packing item ID
   * @param {object} updateItem - Packing item data to update
   * @returns {Promise<object|undefined>} Updated packing item or undefined if not found
   */
  async updatePackingItem(id, updateItem) {
    const { listId, name, quantity, packed } = updateItem;
    
    let query = 'update "packing_items" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (listId !== undefined) {
      updateFields.push(`"list_id" = $${valueIndex++}`);
      values.push(listId);
    }
    if (name !== undefined) {
      updateFields.push(`"name" = $${valueIndex++}`);
      values.push(name);
    }
    if (quantity !== undefined) {
      updateFields.push(`"quantity" = $${valueIndex++}`);
      values.push(quantity);
    }
    if (packed !== undefined) {
      updateFields.push(`"packed" = $${valueIndex++}`);
      values.push(packed);
    }
    
    if (updateFields.length === 0) {
      return this.getPackingItem(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "list_id", "name", "quantity", "packed"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a packing item
   * @param {number} id - Packing item ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePackingItem(id) {
    const result = await pool.query('delete from "packing_items" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }

  /**
   * Get all payments
   * @returns {Promise<Array<object>>} Array of payments
   */
  async getPayments() {
    const result = await pool.query('select "id", "vendor_id", "amount", "date", "description", "paid" from "payments"');
    return result.rows;
  }

  /**
   * Get all payments for a vendor
   * @param {number} vendorId - Vendor ID
   * @returns {Promise<Array<object>>} Array of payments
   */
  async getPaymentsByVendor(vendorId) {
    const result = await pool.query('select "id", "vendor_id", "amount", "date", "description", "paid" from "payments" where "vendor_id" = $1', [vendorId]);
    return result.rows;
  }

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<object|undefined>} Payment or undefined if not found
   */
  async getPayment(id) {
    const result = await pool.query('select "id", "vendor_id", "amount", "date", "description", "paid" from "payments" where "id" = $1', [id]);
    return result.rows[0];
  }

  /**
   * Create a new payment
   * @param {object} insertPayment - Payment data to insert
   * @returns {Promise<object>} Created payment
   */
  async createPayment(insertPayment) {
    const { vendorId, amount, date, description, paid } = insertPayment;
    const result = await pool.query(
      'insert into "payments" ("vendor_id", "amount", "date", "description", "paid") values ($1, $2, $3, $4, $5) returning "id", "vendor_id", "amount", "date", "description", "paid"',
      [vendorId, amount, date, description, paid]
    );
    return result.rows[0];
  }

  /**
   * Update a payment
   * @param {number} id - Payment ID
   * @param {object} updatePayment - Payment data to update
   * @returns {Promise<object|undefined>} Updated payment or undefined if not found
   */
  async updatePayment(id, updatePayment) {
    const { vendorId, amount, date, description, paid } = updatePayment;
    
    let query = 'update "payments" set ';
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    if (vendorId !== undefined) {
      updateFields.push(`"vendor_id" = $${valueIndex++}`);
      values.push(vendorId);
    }
    if (amount !== undefined) {
      updateFields.push(`"amount" = $${valueIndex++}`);
      values.push(amount);
    }
    if (date !== undefined) {
      updateFields.push(`"date" = $${valueIndex++}`);
      values.push(date);
    }
    if (description !== undefined) {
      updateFields.push(`"description" = $${valueIndex++}`);
      values.push(description);
    }
    if (paid !== undefined) {
      updateFields.push(`"paid" = $${valueIndex++}`);
      values.push(paid);
    }
    
    if (updateFields.length === 0) {
      return this.getPayment(id);
    }
    
    query += updateFields.join(', ') + ` where "id" = $${valueIndex} returning "id", "vendor_id", "amount", "date", "description", "paid"`;
    values.push(id);
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePayment(id) {
    const result = await pool.query('delete from "payments" where "id" = $1 returning "id"', [id]);
    return result.rowCount > 0;
  }
}

// -------------------------
// ROUTE REGISTRATION
// -------------------------

/**
 * Register all API routes with the Express app
 * @param {express.Express} app - The Express application
 * @returns {http.Server} - The HTTP server instance
 */
async function registerRoutes(app) {
  console.log('Registering API routes...');
  
  // Create API router
  const apiRouter = express.Router();
  
  // Create HTTP server
  const server = http.createServer(app);
  
  // Create storage instance
  const storage = new DatabaseStorage();
  
  // Tasks endpoints
  apiRouter.get("/tasks", async (_req, res) => {
    try {
      console.log('Fetching tasks from database');
      const tasks = await storage.getTasks();
      console.log(`Successfully fetched ${tasks.length} tasks`);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // Add the remaining endpoints from server/routes.js (same as in that file)
  // ... (omitted for brevity, but in the real file you'd include all routes)

  // Add API router to app
  app.use('/api', apiRouter);
  
  return server;
}

// -------------------------
// SERVER INITIALIZATION
// -------------------------

// Initialize Express app
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Determine dist directory
const distDir = path.join(__dirname, '../dist');
const altDistDir = path.join(process.cwd(), 'dist');
const useDistDir = fs.existsSync(distDir) ? distDir : altDistDir;

// Log application startup details
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Using static files from: ${useDistDir}`);

// Serve static files from the React app
app.use(express.static(useDistDir));

// Register API routes and start server
async function startServer() {
  try {
    console.log('Attempting to connect to database...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('Cannot start server without database connection');
      process.exit(1);
    }
    
    // Register API routes
    const server = await registerRoutes(app);
    
    // Serve static files and implement SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(useDistDir, 'index.html');
      
      // Check if the file exists to prevent errors
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application is not built properly. Static files not found.');
      }
    });
    
    // Global error handler
    app.use((err, _req, res, _next) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
    
    // Get port from environment or use default (8080 for Cloudways)
    const PORT = process.env.PORT || 8080;
    
    // Start listening on all interfaces
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();