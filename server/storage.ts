import { 
  type User, type InsertUser,
  type Task, type InsertTask,
  type Vendor, type InsertVendor,
  type Budget, type InsertBudget,
  type Expense, type InsertExpense,
  type PackingList, type InsertPackingList,
  type PackingItem, type InsertPackingItem,
  type Payment, type InsertPayment
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  createTasks(tasks: InsertTask[]): Promise<Task[]>; // Bulk task creation
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Packing List methods
  getPackingLists(): Promise<PackingList[]>;
  getPackingList(id: number): Promise<PackingList | undefined>;
  createPackingList(list: InsertPackingList): Promise<PackingList>;
  updatePackingList(id: number, list: Partial<InsertPackingList>): Promise<PackingList | undefined>;
  deletePackingList(id: number): Promise<boolean>;
  
  // Packing Items methods
  getPackingItems(listId: number): Promise<PackingItem[]>;
  getPackingItem(id: number): Promise<PackingItem | undefined>;
  createPackingItem(item: InsertPackingItem): Promise<PackingItem>;
  createPackingItems(items: InsertPackingItem[]): Promise<PackingItem[]>; // Bulk items creation
  updatePackingItem(id: number, item: Partial<InsertPackingItem>): Promise<PackingItem | undefined>;
  deletePackingItem(id: number): Promise<boolean>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
  
  // Budget methods
  getBudget(): Promise<Budget | undefined>;
  setBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(budget: InsertBudget): Promise<Budget | undefined>;
  
  // Expense methods
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPaymentsByVendor(vendorId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
}

// Use DatabaseStorage for persistent storage
export const storage = new DatabaseStorage();