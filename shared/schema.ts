import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(), // High, Medium, Low
  status: text("status").notNull(), // Not Started, In Progress, Completed
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  dueDate: true,
  priority: true,
  status: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Packing List schema
export const packingLists = pgTable("packing_lists", {
  id: serial("id").primaryKey(),
  activity: text("activity").notNull(),
  description: text("description").notNull().default(""),
});

export const insertPackingListSchema = createInsertSchema(packingLists).pick({
  activity: true,
  description: true,
}).extend({
  description: z.string().optional().transform(val => val || null),
});

export type InsertPackingList = z.infer<typeof insertPackingListSchema>;
export type PackingList = typeof packingLists.$inferSelect;

// Packing Items schema
export const packingItems = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull().default(1),
  packed: boolean("packed").notNull().default(false),
});

export const insertPackingItemSchema = createInsertSchema(packingItems).pick({
  listId: true,
  item: true,
  quantity: true,
  packed: true,
}).extend({
  quantity: z.number().optional().transform(val => val || 1),
  packed: z.boolean().optional().transform(val => val || false),
});

export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;
export type PackingItem = typeof packingItems.$inferSelect;

// Vendor schema
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  contact: text("contact").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  category: true,
  contact: true,
  phone: true,
  email: true,
}).extend({
  contact: z.string().optional().transform(val => val || null),
  phone: z.string().optional().transform(val => val || null),
  email: z.string().optional().transform(val => val || null),
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Budget and Expense schemas
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  amount: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  vendor: text("vendor").notNull().default(""),
  amount: doublePrecision("amount").notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  category: true,
  item: true,
  vendor: true,
  amount: true,
}).extend({
  vendor: z.string().optional().transform(val => val || null),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: text("date").notNull(), // Using text since we're working with string dates
  description: text("description").notNull().default(""),
  isPaid: boolean("is_paid").notNull().default(false),
});

export const insertPaymentSchema = createInsertSchema(payments, {
  isPaid: z.boolean(),
}).pick({
  vendorId: true,
  amount: true,
  date: true,
  description: true,
  isPaid: true,
}).extend({
  description: z.string().optional().transform(val => val || ""),
  isPaid: z.boolean().optional().transform(val => val || false),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Original user schema (keeping this from the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
