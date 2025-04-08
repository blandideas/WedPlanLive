import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  vendors, type Vendor, type InsertVendor,
  budgets, type Budget, type InsertBudget,
  expenses, type Expense, type InsertExpense,
  packingLists, type PackingList, type InsertPackingList,
  packingItems, type PackingItem, type InsertPackingItem,
  payments, type Payment, type InsertPayment
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private vendors: Map<number, Vendor>;
  private budgets: Map<number, Budget>;
  private expenses: Map<number, Expense>;
  private packingLists: Map<number, PackingList>;
  private packingItems: Map<number, PackingItem>;
  private payments: Map<number, Payment>;
  
  currentUserId: number;
  currentTaskId: number;
  currentVendorId: number;
  currentBudgetId: number;
  currentExpenseId: number;
  currentPackingListId: number;
  currentPackingItemId: number;
  currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.vendors = new Map();
    this.budgets = new Map();
    this.expenses = new Map();
    this.packingLists = new Map();
    this.packingItems = new Map();
    this.payments = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentVendorId = 1;
    this.currentBudgetId = 1;
    this.currentExpenseId = 1;
    this.currentPackingListId = 1;
    this.currentPackingItemId = 1;
    this.currentPaymentId = 1;
    
    // Initialize with default budget
    this.setBudget({ amount: 20000 });
    
    // Initialize with sample data for demo purposes
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample tasks
    this.createTask({ 
      title: "Book venue", 
      dueDate: "2024-08-15", 
      priority: "High", 
      status: "Completed" 
    });
    this.createTask({ 
      title: "Hire photographer", 
      dueDate: "2024-09-01", 
      priority: "Medium", 
      status: "In Progress" 
    });
    this.createTask({ 
      title: "Order wedding cake", 
      dueDate: "2024-10-20", 
      priority: "Low", 
      status: "Not Started" 
    });
    this.createTask({ 
      title: "Send invitations", 
      dueDate: "2024-09-15", 
      priority: "High", 
      status: "In Progress" 
    });
    
    // Sample vendors
    this.createVendor({
      name: "Sunset Gardens",
      category: "Venue",
      contact: "John Smith",
      phone: "(555) 123-4567",
      email: "john@sunsetgardens.com"
    });
    this.createVendor({
      name: "Delicious Cakes",
      category: "Bakery",
      contact: "Mary Johnson",
      phone: "(555) 987-6543",
      email: "mary@deliciouscakes.com"
    });
    this.createVendor({
      name: "Floral Designs",
      category: "Florist",
      contact: "Sarah Williams",
      phone: "(555) 456-7890",
      email: "sarah@floraldesigns.com"
    });
    
    // Sample expenses
    this.createExpense({
      category: "Venue & Catering",
      item: "Wedding Venue Rental",
      vendor: "Sunset Gardens",
      amount: 5000
    });
    this.createExpense({
      category: "Venue & Catering",
      item: "Catering Service",
      vendor: "Gourmet Caterers",
      amount: 3000
    });
    this.createExpense({
      category: "Photography",
      item: "Photographer Package",
      vendor: "Capture Moments",
      amount: 2500
    });
    this.createExpense({
      category: "Attire",
      item: "Wedding Dress",
      vendor: "Elegant Bridal",
      amount: 1500
    });
    this.createExpense({
      category: "Other",
      item: "Transportation",
      vendor: "Luxury Limos",
      amount: 500
    });
    
    // Sample packing lists - using direct Map operations to avoid Promise issues
    const honeymoonListId = this.currentPackingListId++;
    const honeymoonList: PackingList = { 
      id: honeymoonListId,
      activity: "Honeymoon Trip",
      description: "Items to pack for our beach honeymoon"
    };
    this.packingLists.set(honeymoonListId, honeymoonList);
    
    const ceremonyListId = this.currentPackingListId++;
    const ceremonyList: PackingList = { 
      id: ceremonyListId,
      activity: "Wedding Ceremony",
      description: "Essential items for the wedding day"
    };
    this.packingLists.set(ceremonyListId, ceremonyList);
    
    // Sample packing items - using direct Map operations
    const swimsuitId = this.currentPackingItemId++;
    this.packingItems.set(swimsuitId, {
      id: swimsuitId,
      listId: honeymoonList.id,
      item: "Swimsuit",
      quantity: 2,
      packed: false
    });
    
    const sunscreenId = this.currentPackingItemId++;
    this.packingItems.set(sunscreenId, {
      id: sunscreenId,
      listId: honeymoonList.id,
      item: "Sunscreen",
      quantity: 1,
      packed: false
    });
    
    const passportId = this.currentPackingItemId++;
    this.packingItems.set(passportId, {
      id: passportId,
      listId: honeymoonList.id,
      item: "Passport",
      quantity: 2,
      packed: false
    });
    
    const ringsId = this.currentPackingItemId++;
    this.packingItems.set(ringsId, {
      id: ringsId,
      listId: ceremonyList.id,
      item: "Wedding rings",
      quantity: 2,
      packed: false
    });
    
    const vowsId = this.currentPackingItemId++;
    this.packingItems.set(vowsId, {
      id: vowsId,
      listId: ceremonyList.id,
      item: "Vows",
      quantity: 2,
      packed: false
    });
    
    // Sample payments - using direct Map operations
    const depositPaymentId = this.currentPaymentId++;
    this.payments.set(depositPaymentId, {
      id: depositPaymentId,
      vendorId: 1, // Sunset Gardens
      amount: 2000,
      date: "2024-06-01",
      description: "Initial deposit for venue",
      isPaid: true
    });
    
    const finalVenuePaymentId = this.currentPaymentId++;
    this.payments.set(finalVenuePaymentId, {
      id: finalVenuePaymentId,
      vendorId: 1, // Sunset Gardens
      amount: 3000,
      date: "2024-07-30",
      description: "Final payment for venue",
      isPaid: false
    });
    
    const cakeDepositId = this.currentPaymentId++;
    this.payments.set(cakeDepositId, {
      id: cakeDepositId,
      vendorId: 2, // Delicious Cakes
      amount: 200,
      date: "2024-08-15",
      description: "Deposit for wedding cake",
      isPaid: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }
  
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }
  
  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const vendor: Vendor = { ...insertVendor, id };
    this.vendors.set(id, vendor);
    return vendor;
  }
  
  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existingVendor = this.vendors.get(id);
    if (!existingVendor) return undefined;
    
    const updatedVendor: Vendor = { ...existingVendor, ...vendor };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }
  
  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }
  
  // Budget methods
  async getBudget(): Promise<Budget | undefined> {
    // Since we only have one budget, return the first one
    return Array.from(this.budgets.values())[0];
  }
  
  async setBudget(insertBudget: InsertBudget): Promise<Budget> {
    // Clear existing budgets
    this.budgets.clear();
    
    const id = this.currentBudgetId++;
    const budget: Budget = { ...insertBudget, id };
    this.budgets.set(id, budget);
    return budget;
  }
  
  async updateBudget(budget: InsertBudget): Promise<Budget | undefined> {
    const existingBudget = await this.getBudget();
    if (!existingBudget) return undefined;
    
    const updatedBudget: Budget = { ...existingBudget, ...budget };
    this.budgets.set(existingBudget.id, updatedBudget);
    return updatedBudget;
  }
  
  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = { ...insertExpense, id };
    this.expenses.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existingExpense = this.expenses.get(id);
    if (!existingExpense) return undefined;
    
    const updatedExpense: Expense = { ...existingExpense, ...expense };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // Bulk task creation
  async createTasks(tasks: InsertTask[]): Promise<Task[]> {
    const createdTasks: Task[] = [];
    for (const taskData of tasks) {
      const task = await this.createTask(taskData);
      createdTasks.push(task);
    }
    return createdTasks;
  }
  
  // Packing List methods
  async getPackingLists(): Promise<PackingList[]> {
    return Array.from(this.packingLists.values());
  }
  
  async getPackingList(id: number): Promise<PackingList | undefined> {
    return this.packingLists.get(id);
  }
  
  async createPackingList(insertList: InsertPackingList): Promise<PackingList> {
    const id = this.currentPackingListId++;
    const list: PackingList = { ...insertList, id };
    this.packingLists.set(id, list);
    return list;
  }
  
  async updatePackingList(id: number, list: Partial<InsertPackingList>): Promise<PackingList | undefined> {
    const existingList = this.packingLists.get(id);
    if (!existingList) return undefined;
    
    const updatedList: PackingList = { ...existingList, ...list };
    this.packingLists.set(id, updatedList);
    return updatedList;
  }
  
  async deletePackingList(id: number): Promise<boolean> {
    // Also delete all items associated with this list
    const itemsToDelete = Array.from(this.packingItems.values())
      .filter(item => item.listId === id)
      .map(item => item.id);
    
    itemsToDelete.forEach(itemId => this.packingItems.delete(itemId));
    return this.packingLists.delete(id);
  }
  
  // Packing Items methods
  async getPackingItems(listId: number): Promise<PackingItem[]> {
    return Array.from(this.packingItems.values())
      .filter(item => item.listId === listId);
  }
  
  async getPackingItem(id: number): Promise<PackingItem | undefined> {
    return this.packingItems.get(id);
  }
  
  async createPackingItem(insertItem: InsertPackingItem): Promise<PackingItem> {
    const id = this.currentPackingItemId++;
    const item: PackingItem = { ...insertItem, id };
    this.packingItems.set(id, item);
    return item;
  }
  
  async createPackingItems(items: InsertPackingItem[]): Promise<PackingItem[]> {
    const createdItems: PackingItem[] = [];
    for (const itemData of items) {
      const item = await this.createPackingItem(itemData);
      createdItems.push(item);
    }
    return createdItems;
  }
  
  async updatePackingItem(id: number, item: Partial<InsertPackingItem>): Promise<PackingItem | undefined> {
    const existingItem = this.packingItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem: PackingItem = { ...existingItem, ...item };
    this.packingItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deletePackingItem(id: number): Promise<boolean> {
    return this.packingItems.delete(id);
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPaymentsByVendor(vendorId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.vendorId === vendorId);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { ...insertPayment, id };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }
}

export const storage = new MemStorage();
