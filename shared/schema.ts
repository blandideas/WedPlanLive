import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
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

// Vendor schema
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  category: true,
  contact: true,
  phone: true,
  email: true,
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
  vendor: text("vendor"),
  amount: doublePrecision("amount").notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  category: true,
  item: true,
  vendor: true,
  amount: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

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
