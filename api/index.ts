import express, { Request, Response } from 'express';
import { Server } from 'http';

// Database storage must come from the specialized serverless version
import { db } from './db';
import { IStorage } from '../server/storage';
import { DatabaseStorage } from './database-storage';

// Create express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import and register all API routes from the server module
import * as schema from "../shared/schema";
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { 
  users, tasks, vendors, budgets, expenses, packingLists, packingItems, payments,
  insertTaskSchema, insertVendorSchema, insertBudgetSchema, insertExpenseSchema,
  insertPackingListSchema, insertPackingItemSchema, insertPaymentSchema
} from "../shared/schema";

// Create storage implementation
const storage: IStorage = new DatabaseStorage();

// Register API routes
const registerRoutes = async (app: express.Express): Promise<Server> => {
  const server = new Server(app);
  
  // API routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);
  
  // TASK ROUTES
  // Get all tasks
  apiRouter.get("/tasks", async (_req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Get a single task
  apiRouter.get("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  // Create a task
  apiRouter.post("/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  // Update a task
  apiRouter.patch("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  // Delete a task
  apiRouter.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // BULK TASK CREATION
  apiRouter.post("/tasks/bulk", async (req: Request, res: Response) => {
    try {
      const tasksArray = z.array(insertTaskSchema).parse(req.body.tasks);
      const newTasks = await storage.createTasks(tasksArray);
      res.status(201).json(newTasks);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tasks data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tasks" });
    }
  });
  
  // VENDOR ROUTES 
  apiRouter.get("/vendors", async (_req: Request, res: Response) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  
  apiRouter.get("/vendors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });
  
  apiRouter.post("/vendors", async (req: Request, res: Response) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const newVendor = await storage.createVendor(vendorData);
      res.status(201).json(newVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  
  apiRouter.patch("/vendors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const vendorData = insertVendorSchema.partial().parse(req.body);
      
      const updatedVendor = await storage.updateVendor(id, vendorData);
      
      if (!updatedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(updatedVendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  apiRouter.delete("/vendors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVendor(id);
      
      if (!success) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  
  // BUDGET ROUTES
  apiRouter.get("/budget", async (_req: Request, res: Response) => {
    try {
      const budget = await storage.getBudget();
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });
  
  apiRouter.post("/budget", async (req: Request, res: Response) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const existingBudget = await storage.getBudget();
      
      let budget;
      if (existingBudget) {
        budget = await storage.updateBudget(budgetData);
      } else {
        budget = await storage.setBudget(budgetData);
      }
      
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set budget" });
    }
  });
  
  // EXPENSE ROUTES
  apiRouter.get("/expenses", async (_req: Request, res: Response) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  
  apiRouter.get("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });
  
  apiRouter.post("/expenses", async (req: Request, res: Response) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const newExpense = await storage.createExpense(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
  
  apiRouter.patch("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      
      const updatedExpense = await storage.updateExpense(id, expenseData);
      
      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  
  apiRouter.delete("/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  
  // PACKING LIST ROUTES
  apiRouter.get("/packing-lists", async (_req: Request, res: Response) => {
    try {
      const lists = await storage.getPackingLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing lists" });
    }
  });
  
  apiRouter.get("/packing-lists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getPackingList(id);
      
      if (!list) {
        return res.status(404).json({ message: "Packing list not found" });
      }
      
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing list" });
    }
  });
  
  apiRouter.post("/packing-lists", async (req: Request, res: Response) => {
    try {
      const listData = insertPackingListSchema.parse(req.body);
      const newList = await storage.createPackingList(listData);
      res.status(201).json(newList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid packing list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create packing list" });
    }
  });
  
  apiRouter.patch("/packing-lists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const listData = insertPackingListSchema.partial().parse(req.body);
      
      const updatedList = await storage.updatePackingList(id, listData);
      
      if (!updatedList) {
        return res.status(404).json({ message: "Packing list not found" });
      }
      
      res.json(updatedList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid packing list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update packing list" });
    }
  });
  
  apiRouter.delete("/packing-lists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePackingList(id);
      
      if (!success) {
        return res.status(404).json({ message: "Packing list not found" });
      }
      
      res.json({ message: "Packing list deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete packing list" });
    }
  });
  
  // PACKING ITEM ROUTES
  apiRouter.get("/packing-lists/:listId/items", async (req: Request, res: Response) => {
    try {
      const listId = parseInt(req.params.listId);
      const items = await storage.getPackingItems(listId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing items" });
    }
  });
  
  apiRouter.get("/packing-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getPackingItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Packing item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packing item" });
    }
  });
  
  apiRouter.post("/packing-items", async (req: Request, res: Response) => {
    try {
      const itemData = insertPackingItemSchema.parse(req.body);
      const newItem = await storage.createPackingItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid packing item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create packing item" });
    }
  });
  
  apiRouter.post("/packing-items/bulk", async (req: Request, res: Response) => {
    try {
      const itemsArray = z.array(insertPackingItemSchema).parse(req.body.items);
      const newItems = await storage.createPackingItems(itemsArray);
      res.status(201).json(newItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid packing items data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create packing items" });
    }
  });
  
  apiRouter.patch("/packing-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertPackingItemSchema.partial().parse(req.body);
      
      const updatedItem = await storage.updatePackingItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Packing item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid packing item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update packing item" });
    }
  });
  
  apiRouter.delete("/packing-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePackingItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Packing item not found" });
      }
      
      res.json({ message: "Packing item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete packing item" });
    }
  });
  
  // PAYMENT ROUTES
  apiRouter.get("/payments", async (_req: Request, res: Response) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  
  apiRouter.get("/vendors/:vendorId/payments", async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const payments = await storage.getPaymentsByVendor(vendorId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments for vendor" });
    }
  });
  
  apiRouter.get("/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });
  
  apiRouter.post("/payments", async (req: Request, res: Response) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const newPayment = await storage.createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  
  apiRouter.patch("/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      
      const updatedPayment = await storage.updatePayment(id, paymentData);
      
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });
  
  apiRouter.delete("/payments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePayment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  return server;
};

// Execute the function to register all routes
registerRoutes(app);