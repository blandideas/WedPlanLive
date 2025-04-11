// CommonJS version of routes for production deployment
const express = require('express');
const http = require('http');
const { DatabaseStorage } = require('./database-storage.js');

// Create storage instance
const storage = new DatabaseStorage();

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

  apiRouter.get("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  });

  apiRouter.post("/tasks", async (req, res) => {
    try {
      const { title, dueDate, priority, status } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const task = await storage.createTask({
        title,
        dueDate,
        priority,
        status
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  apiRouter.patch("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const { title, dueDate, priority, status } = req.body;
      const task = await storage.updateTask(id, {
        title,
        dueDate,
        priority,
        status
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  apiRouter.delete("/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const result = await storage.deleteTask(id);
      if (!result) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  apiRouter.post("/tasks/bulk", async (req, res) => {
    try {
      const tasks = req.body;
      
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: 'Invalid tasks array' });
      }
      
      const createdTasks = await storage.createTasks(tasks);
      res.status(201).json(createdTasks);
    } catch (error) {
      console.error('Error creating bulk tasks:', error);
      res.status(500).json({ error: 'Failed to create bulk tasks' });
    }
  });

  // Vendors endpoints
  apiRouter.get("/vendors", async (_req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  apiRouter.get("/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }
      
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  });

  apiRouter.post("/vendors", async (req, res) => {
    try {
      const { name, service, contactName, phone, email, website, notes } = req.body;
      
      if (!name || !service) {
        return res.status(400).json({ error: 'Name and service are required' });
      }
      
      const vendor = await storage.createVendor({
        name,
        service,
        contactName,
        phone,
        email,
        website,
        notes
      });
      
      res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  });

  apiRouter.patch("/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }
      
      const { name, service, contactName, phone, email, website, notes } = req.body;
      const vendor = await storage.updateVendor(id, {
        name,
        service,
        contactName,
        phone,
        email,
        website,
        notes
      });
      
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  });

  apiRouter.delete("/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }
      
      const result = await storage.deleteVendor(id);
      if (!result) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ error: 'Failed to delete vendor' });
    }
  });

  // Budget endpoints
  apiRouter.get("/budget", async (_req, res) => {
    try {
      console.log('Fetching budget from database');
      const budget = await storage.getBudget();
      
      if (budget) {
        console.log(`Found ${budget ? 1 : 0} budget entries`);
        res.json(budget);
      } else {
        res.json({ amount: 0 });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      res.status(500).json({ error: 'Failed to fetch budget' });
    }
  });

  apiRouter.post("/budget", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (amount === undefined || isNaN(parseInt(amount))) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }
      
      // Check if budget already exists, if yes update it
      const existingBudget = await storage.getBudget();
      let budget;
      
      if (existingBudget) {
        budget = await storage.updateBudget({ amount: parseInt(amount) });
      } else {
        budget = await storage.setBudget({ amount: parseInt(amount) });
      }
      
      res.status(201).json(budget);
    } catch (error) {
      console.error('Error setting budget:', error);
      res.status(500).json({ error: 'Failed to set budget' });
    }
  });

  // Expenses endpoints
  apiRouter.get("/expenses", async (_req, res) => {
    try {
      console.log('Fetching expenses from database');
      const expenses = await storage.getExpenses();
      console.log(`Successfully fetched ${expenses.length} expenses`);
      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  });

  apiRouter.get("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid expense ID' });
      }
      
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.json(expense);
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({ error: 'Failed to fetch expense' });
    }
  });

  apiRouter.post("/expenses", async (req, res) => {
    try {
      const { category, item, vendor, amount } = req.body;
      
      if (!category || !item || amount === undefined) {
        return res.status(400).json({ error: 'Category, item, and amount are required' });
      }
      
      const expense = await storage.createExpense({
        category,
        item,
        vendor,
        amount: parseFloat(amount)
      });
      
      res.status(201).json(expense);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  });

  apiRouter.patch("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid expense ID' });
      }
      
      const { category, item, vendor, amount } = req.body;
      const expense = await storage.updateExpense(id, {
        category,
        item,
        vendor,
        amount: amount !== undefined ? parseFloat(amount) : undefined
      });
      
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });

  apiRouter.delete("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid expense ID' });
      }
      
      const result = await storage.deleteExpense(id);
      if (!result) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  // Packing Lists endpoints
  apiRouter.get("/packing-lists", async (_req, res) => {
    try {
      const packingLists = await storage.getPackingLists();
      res.json(packingLists);
    } catch (error) {
      console.error('Error fetching packing lists:', error);
      res.status(500).json({ error: 'Failed to fetch packing lists' });
    }
  });

  apiRouter.get("/packing-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing list ID' });
      }
      
      const packingList = await storage.getPackingList(id);
      if (!packingList) {
        return res.status(404).json({ error: 'Packing list not found' });
      }
      
      res.json(packingList);
    } catch (error) {
      console.error('Error fetching packing list:', error);
      res.status(500).json({ error: 'Failed to fetch packing list' });
    }
  });

  apiRouter.post("/packing-lists", async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const packingList = await storage.createPackingList({
        name,
        description
      });
      
      res.status(201).json(packingList);
    } catch (error) {
      console.error('Error creating packing list:', error);
      res.status(500).json({ error: 'Failed to create packing list' });
    }
  });

  apiRouter.patch("/packing-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing list ID' });
      }
      
      const { name, description } = req.body;
      const packingList = await storage.updatePackingList(id, {
        name,
        description
      });
      
      if (!packingList) {
        return res.status(404).json({ error: 'Packing list not found' });
      }
      
      res.json(packingList);
    } catch (error) {
      console.error('Error updating packing list:', error);
      res.status(500).json({ error: 'Failed to update packing list' });
    }
  });

  apiRouter.delete("/packing-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing list ID' });
      }
      
      const result = await storage.deletePackingList(id);
      if (!result) {
        return res.status(404).json({ error: 'Packing list not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting packing list:', error);
      res.status(500).json({ error: 'Failed to delete packing list' });
    }
  });

  // Packing Items endpoints
  apiRouter.get("/packing-lists/:listId/items", async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ error: 'Invalid packing list ID' });
      }
      
      const packingItems = await storage.getPackingItems(listId);
      res.json(packingItems);
    } catch (error) {
      console.error('Error fetching packing items:', error);
      res.status(500).json({ error: 'Failed to fetch packing items' });
    }
  });

  apiRouter.get("/packing-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing item ID' });
      }
      
      const packingItem = await storage.getPackingItem(id);
      if (!packingItem) {
        return res.status(404).json({ error: 'Packing item not found' });
      }
      
      res.json(packingItem);
    } catch (error) {
      console.error('Error fetching packing item:', error);
      res.status(500).json({ error: 'Failed to fetch packing item' });
    }
  });

  apiRouter.post("/packing-items", async (req, res) => {
    try {
      const { listId, name, quantity, packed } = req.body;
      
      if (!listId || isNaN(parseInt(listId)) || !name) {
        return res.status(400).json({ error: 'List ID and name are required' });
      }
      
      const packingItem = await storage.createPackingItem({
        listId: parseInt(listId),
        name,
        quantity: quantity || 1,
        packed: packed || false
      });
      
      res.status(201).json(packingItem);
    } catch (error) {
      console.error('Error creating packing item:', error);
      res.status(500).json({ error: 'Failed to create packing item' });
    }
  });

  apiRouter.post("/packing-items/bulk", async (req, res) => {
    try {
      const items = req.body;
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid items array' });
      }
      
      const createdItems = await storage.createPackingItems(items);
      res.status(201).json(createdItems);
    } catch (error) {
      console.error('Error creating bulk packing items:', error);
      res.status(500).json({ error: 'Failed to create bulk packing items' });
    }
  });

  apiRouter.patch("/packing-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing item ID' });
      }
      
      const { name, quantity, packed } = req.body;
      const packingItem = await storage.updatePackingItem(id, {
        name,
        quantity,
        packed
      });
      
      if (!packingItem) {
        return res.status(404).json({ error: 'Packing item not found' });
      }
      
      res.json(packingItem);
    } catch (error) {
      console.error('Error updating packing item:', error);
      res.status(500).json({ error: 'Failed to update packing item' });
    }
  });

  apiRouter.delete("/packing-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid packing item ID' });
      }
      
      const result = await storage.deletePackingItem(id);
      if (!result) {
        return res.status(404).json({ error: 'Packing item not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting packing item:', error);
      res.status(500).json({ error: 'Failed to delete packing item' });
    }
  });

  // Payment endpoints
  apiRouter.get("/payments", async (_req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  });

  apiRouter.get("/vendors/:vendorId/payments", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      if (isNaN(vendorId)) {
        return res.status(400).json({ error: 'Invalid vendor ID' });
      }
      
      const payments = await storage.getPaymentsByVendor(vendorId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      res.status(500).json({ error: 'Failed to fetch vendor payments' });
    }
  });

  apiRouter.get("/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' });
      }
      
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  });

  apiRouter.post("/payments", async (req, res) => {
    try {
      const { vendorId, amount, date, description, paymentMethod, isPaid } = req.body;
      
      if (!vendorId || amount === undefined) {
        return res.status(400).json({ error: 'Vendor ID and amount are required' });
      }
      
      const payment = await storage.createPayment({
        vendorId: parseInt(vendorId),
        amount: parseFloat(amount),
        date,
        description,
        paymentMethod,
        isPaid: isPaid || false
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  });

  apiRouter.patch("/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' });
      }
      
      const { amount, date, description, paymentMethod, isPaid } = req.body;
      const payment = await storage.updatePayment(id, {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        date,
        description,
        paymentMethod,
        isPaid
      });
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ error: 'Failed to update payment' });
    }
  });

  apiRouter.delete("/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' });
      }
      
      const result = await storage.deletePayment(id);
      if (!result) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  });

  // Mount API router
  app.use('/api', apiRouter);

  return server;
}

module.exports = { registerRoutes };