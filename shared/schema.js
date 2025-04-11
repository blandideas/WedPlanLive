// CommonJS version of schema.js for production deployment
const { pgTable, serial, text, integer, boolean, timestamp, varchar } = require('drizzle-orm/pg-core');

// Users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user').notNull()
});

// Tasks table
const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  dueDate: text('due_date'),
  priority: text('priority'),
  status: text('status').default('pending')
});

// Vendors table
const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  service: text('service').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  notes: text('notes')
});

// Budget table
const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull()
});

// Expenses table
const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  item: text('item').notNull(),
  vendor: text('vendor'),
  amount: integer('amount').notNull()
});

// Packing lists table
const packingLists = pgTable('packing_lists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description')
});

// Packing items table
const packingItems = pgTable('packing_items', {
  id: serial('id').primaryKey(),
  listId: integer('list_id').notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').default(1),
  packed: boolean('packed').default(false)
});

// Payments table
const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull(),
  amount: integer('amount').notNull(),
  date: text('date'),
  description: text('description'),
  paymentMethod: text('payment_method'),
  isPaid: boolean('is_paid').default(false)
});

// Export all tables
module.exports = {
  users,
  tasks,
  vendors,
  budgets,
  expenses,
  packingLists,
  packingItems,
  payments
};