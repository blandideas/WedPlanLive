import { 
  users, tasks, vendors, budgets, expenses, packingLists, packingItems, payments,
  type User, type InsertUser, 
  type Task, type InsertTask,
  type Vendor, type InsertVendor,
  type Budget, type InsertBudget,
  type Expense, type InsertExpense,
  type PackingList, type InsertPackingList,
  type PackingItem, type InsertPackingItem,
  type Payment, type InsertPayment
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    try {
      console.log("Fetching tasks from database");
      const result = await db.select().from(tasks);
      console.log(`Successfully fetched ${result.length} tasks`);
      return result;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async createTasks(insertTasks: InsertTask[]): Promise<Task[]> {
    if (insertTasks.length === 0) return [];
    const result = await db
      .insert(tasks)
      .values(insertTasks)
      .returning();
    return result;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return result.length > 0;
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, updateVendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(updateVendor)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db
      .delete(vendors)
      .where(eq(vendors.id, id))
      .returning();
    return result.length > 0;
  }

  // Budget methods
  async getBudget(): Promise<Budget | undefined> {
    try {
      console.log("Fetching budget from database");
      const budgetList = await db.select().from(budgets);
      console.log(`Found ${budgetList.length} budget entries`);
      return budgetList[0] || undefined;
    } catch (error) {
      console.error("Error fetching budget:", error);
      throw new Error("Failed to fetch budget");
    }
  }

  async setBudget(insertBudget: InsertBudget): Promise<Budget> {
    // Delete existing budgets first (we only want one)
    await db.delete(budgets);
    
    // Insert the new budget
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
    return budget;
  }

  async updateBudget(insertBudget: InsertBudget): Promise<Budget | undefined> {
    const existingBudget = await this.getBudget();
    if (!existingBudget) {
      return this.setBudget(insertBudget);
    }
    
    const [budget] = await db
      .update(budgets)
      .set(insertBudget)
      .where(eq(budgets.id, existingBudget.id))
      .returning();
    return budget || undefined;
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    try {
      console.log("Fetching expenses from database");
      const result = await db.select().from(expenses);
      console.log(`Successfully fetched ${result.length} expenses`);
      return result;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw new Error("Failed to fetch expenses");
    }
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async updateExpense(id: number, updateExpense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updateExpense)
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    return result.length > 0;
  }

  // Packing List methods
  async getPackingLists(): Promise<PackingList[]> {
    return await db.select().from(packingLists);
  }

  async getPackingList(id: number): Promise<PackingList | undefined> {
    const [list] = await db.select().from(packingLists).where(eq(packingLists.id, id));
    return list || undefined;
  }

  async createPackingList(insertList: InsertPackingList): Promise<PackingList> {
    const [list] = await db
      .insert(packingLists)
      .values(insertList)
      .returning();
    return list;
  }

  async updatePackingList(id: number, updateList: Partial<InsertPackingList>): Promise<PackingList | undefined> {
    const [list] = await db
      .update(packingLists)
      .set(updateList)
      .where(eq(packingLists.id, id))
      .returning();
    return list || undefined;
  }

  async deletePackingList(id: number): Promise<boolean> {
    // First delete all items in this list
    await db
      .delete(packingItems)
      .where(eq(packingItems.listId, id));
    
    // Then delete the list itself
    const result = await db
      .delete(packingLists)
      .where(eq(packingLists.id, id))
      .returning();
    return result.length > 0;
  }

  // Packing Items methods
  async getPackingItems(listId: number): Promise<PackingItem[]> {
    return await db.select().from(packingItems).where(eq(packingItems.listId, listId));
  }

  async getPackingItem(id: number): Promise<PackingItem | undefined> {
    const [item] = await db.select().from(packingItems).where(eq(packingItems.id, id));
    return item || undefined;
  }

  async createPackingItem(insertItem: InsertPackingItem): Promise<PackingItem> {
    const [item] = await db
      .insert(packingItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async createPackingItems(insertItems: InsertPackingItem[]): Promise<PackingItem[]> {
    if (insertItems.length === 0) return [];
    const result = await db
      .insert(packingItems)
      .values(insertItems)
      .returning();
    return result;
  }

  async updatePackingItem(id: number, updateItem: Partial<InsertPackingItem>): Promise<PackingItem | undefined> {
    const [item] = await db
      .update(packingItems)
      .set(updateItem)
      .where(eq(packingItems.id, id))
      .returning();
    return item || undefined;
  }

  async deletePackingItem(id: number): Promise<boolean> {
    const result = await db
      .delete(packingItems)
      .where(eq(packingItems.id, id))
      .returning();
    return result.length > 0;
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPaymentsByVendor(vendorId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.vendorId, vendorId));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePayment(id: number, updatePayment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updatePayment)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return result.length > 0;
  }
}