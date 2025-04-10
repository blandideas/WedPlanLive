// Vercel Serverless API
const express = require('express');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const schema = require('../shared/schema');
const { DatabaseStorage } = require('../server/database-storage');

// Create Express app
const app = express();
app.use(express.json());

// Initialize database connection
const sql = neon(process.env.DATABASE_URL || '');
const db = drizzle(sql, { schema });

// Create storage instance
const storage = new DatabaseStorage();

// Setup API routes
const apiRouter = express.Router();

// Task routes
apiRouter.get("/tasks", async (_req, res) => {
  try {
    const tasks = await storage.getTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

apiRouter.get("/tasks/:id", async (req, res) => {
  try {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task" });
  }
});

apiRouter.post("/tasks", async (req, res) => {
  try {
    const newTask = await storage.createTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

apiRouter.post("/tasks/bulk", async (req, res) => {
  try {
    const tasks = Array.isArray(req.body) ? req.body : [];
    const newTasks = await storage.createTasks(tasks);
    res.status(201).json(newTasks);
  } catch (error) {
    console.error('Error creating bulk tasks:', error);
    res.status(500).json({ error: "Failed to create tasks" });
  }
});

apiRouter.patch("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await storage.updateTask(Number(req.params.id), req.body);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

apiRouter.delete("/tasks/:id", async (req, res) => {
  try {
    const success = await storage.deleteTask(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Vendor routes
apiRouter.get("/vendors", async (_req, res) => {
  try {
    const vendors = await storage.getVendors();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: "Failed to get vendors" });
  }
});

apiRouter.get("/vendors/:id", async (req, res) => {
  try {
    const vendor = await storage.getVendor(Number(req.params.id));
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to get vendor" });
  }
});

apiRouter.post("/vendors", async (req, res) => {
  try {
    const newVendor = await storage.createVendor(req.body);
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

apiRouter.patch("/vendors/:id", async (req, res) => {
  try {
    const updatedVendor = await storage.updateVendor(Number(req.params.id), req.body);
    if (!updatedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

apiRouter.delete("/vendors/:id", async (req, res) => {
  try {
    const success = await storage.deleteVendor(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

// Budget routes
apiRouter.get("/budget", async (_req, res) => {
  try {
    const budget = await storage.getBudget();
    res.json(budget || { amount: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to get budget" });
  }
});

apiRouter.post("/budget", async (req, res) => {
  try {
    const budget = await storage.getBudget();
    let newBudget;
    
    if (budget) {
      newBudget = await storage.updateBudget(req.body);
    } else {
      newBudget = await storage.setBudget(req.body);
    }
    
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ error: "Failed to set budget" });
  }
});

// Expense routes
apiRouter.get("/expenses", async (_req, res) => {
  try {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to get expenses" });
  }
});

apiRouter.get("/expenses/:id", async (req, res) => {
  try {
    const expense = await storage.getExpense(Number(req.params.id));
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: "Failed to get expense" });
  }
});

apiRouter.post("/expenses", async (req, res) => {
  try {
    const newExpense = await storage.createExpense(req.body);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

apiRouter.patch("/expenses/:id", async (req, res) => {
  try {
    const updatedExpense = await storage.updateExpense(Number(req.params.id), req.body);
    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense" });
  }
});

apiRouter.delete("/expenses/:id", async (req, res) => {
  try {
    const success = await storage.deleteExpense(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Packing List routes
apiRouter.get("/packing-lists", async (_req, res) => {
  try {
    const lists = await storage.getPackingLists();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: "Failed to get packing lists" });
  }
});

apiRouter.get("/packing-lists/:id", async (req, res) => {
  try {
    const list = await storage.getPackingList(Number(req.params.id));
    if (!list) {
      return res.status(404).json({ error: "Packing list not found" });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get packing list" });
  }
});

apiRouter.post("/packing-lists", async (req, res) => {
  try {
    const newList = await storage.createPackingList(req.body);
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: "Failed to create packing list" });
  }
});

apiRouter.patch("/packing-lists/:id", async (req, res) => {
  try {
    const updatedList = await storage.updatePackingList(Number(req.params.id), req.body);
    if (!updatedList) {
      return res.status(404).json({ error: "Packing list not found" });
    }
    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ error: "Failed to update packing list" });
  }
});

apiRouter.delete("/packing-lists/:id", async (req, res) => {
  try {
    const success = await storage.deletePackingList(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Packing list not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete packing list" });
  }
});

// Packing Item routes
apiRouter.get("/packing-lists/:listId/items", async (req, res) => {
  try {
    const items = await storage.getPackingItems(Number(req.params.listId));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to get packing items" });
  }
});

apiRouter.get("/packing-items/:id", async (req, res) => {
  try {
    const item = await storage.getPackingItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Packing item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to get packing item" });
  }
});

apiRouter.post("/packing-items", async (req, res) => {
  try {
    const newItem = await storage.createPackingItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating packing item:', error);
    res.status(500).json({ error: "Failed to create packing item" });
  }
});

apiRouter.post("/packing-items/bulk", async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const newItems = await storage.createPackingItems(items);
    res.status(201).json(newItems);
  } catch (error) {
    console.error('Error creating bulk packing items:', error);
    res.status(500).json({ error: "Failed to create packing items" });
  }
});

apiRouter.patch("/packing-items/:id", async (req, res) => {
  try {
    const updatedItem = await storage.updatePackingItem(Number(req.params.id), req.body);
    if (!updatedItem) {
      return res.status(404).json({ error: "Packing item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update packing item" });
  }
});

apiRouter.delete("/packing-items/:id", async (req, res) => {
  try {
    const success = await storage.deletePackingItem(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Packing item not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete packing item" });
  }
});

// Payment routes
apiRouter.get("/payments", async (_req, res) => {
  try {
    const payments = await storage.getPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get payments" });
  }
});

apiRouter.get("/vendors/:vendorId/payments", async (req, res) => {
  try {
    const payments = await storage.getPaymentsByVendor(Number(req.params.vendorId));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get vendor payments" });
  }
});

apiRouter.get("/payments/:id", async (req, res) => {
  try {
    const payment = await storage.getPayment(Number(req.params.id));
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to get payment" });
  }
});

apiRouter.post("/payments", async (req, res) => {
  try {
    const newPayment = await storage.createPayment(req.body);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

apiRouter.patch("/payments/:id", async (req, res) => {
  try {
    const updatedPayment = await storage.updatePayment(Number(req.params.id), req.body);
    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment" });
  }
});

apiRouter.delete("/payments/:id", async (req, res) => {
  try {
    const success = await storage.deletePayment(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

// Setup database check and debugging endpoint
apiRouter.get("/db-status", async (_req, res) => {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: "DATABASE_URL is not set",
        tables: [] 
      });
    }
    
    // Check database connection
    try {
      const tables = await sql`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname='public'
      `;
      
      return res.json({
        connected: true,
        databaseUrl: process.env.DATABASE_URL.substring(0, 15) + "...",
        tables: tables.map(t => t.tablename)
      });
    } catch (error) {
      return res.status(500).json({ 
        error: "Database connection failed", 
        details: error.message 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: "Error checking database status",
      details: error.message 
    });
  }
});

// Use API router
app.use('/api', apiRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Export for Vercel serverless
module.exports = app;