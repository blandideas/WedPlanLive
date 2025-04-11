// CommonJS version of database-storage for production deployment
const { eq } = require('drizzle-orm');
const { db } = require('./db.js');
const schema = require('../shared/schema.js');

/**
 * Database storage implementation using Drizzle ORM
 */
class DatabaseStorage {
  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<object|undefined>} User or undefined if not found
   */
  async getUser(id) {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username to look up
   * @returns {Promise<object|undefined>} User or undefined if not found
   */
  async getUserByUsername(username) {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {object} insertUser - User data to insert
   * @returns {Promise<object>} Created user
   */
  async createUser(insertUser) {
    try {
      const [user] = await db.insert(schema.users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   * @returns {Promise<Array<object>>} Array of tasks
   */
  async getTasks() {
    try {
      console.log('Fetching tasks from database');
      const tasks = await db.select().from(schema.tasks);
      console.log(`Successfully fetched ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      console.error('Error in getTasks:', error);
      throw error;
    }
  }

  /**
   * Get task by ID
   * @param {number} id - Task ID
   * @returns {Promise<object|undefined>} Task or undefined if not found
   */
  async getTask(id) {
    try {
      const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);
      return task;
    } catch (error) {
      console.error('Error in getTask:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param {object} insertTask - Task data to insert
   * @returns {Promise<object>} Created task
   */
  async createTask(insertTask) {
    try {
      const [task] = await db.insert(schema.tasks).values(insertTask).returning();
      return task;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }

  /**
   * Create multiple tasks
   * @param {Array<object>} insertTasks - Array of tasks to insert
   * @returns {Promise<Array<object>>} Array of created tasks
   */
  async createTasks(insertTasks) {
    try {
      const tasks = await db.insert(schema.tasks).values(insertTasks).returning();
      return tasks;
    } catch (error) {
      console.error('Error in createTasks:', error);
      throw error;
    }
  }

  /**
   * Update a task
   * @param {number} id - Task ID
   * @param {object} updateTask - Task data to update
   * @returns {Promise<object|undefined>} Updated task or undefined if not found
   */
  async updateTask(id, updateTask) {
    try {
      const [task] = await db.update(schema.tasks)
        .set(updateTask)
        .where(eq(schema.tasks.id, id))
        .returning();
      return task;
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteTask(id) {
    try {
      const [task] = await db.delete(schema.tasks)
        .where(eq(schema.tasks.id, id))
        .returning();
      return !!task;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  }

  /**
   * Get all vendors
   * @returns {Promise<Array<object>>} Array of vendors
   */
  async getVendors() {
    try {
      const vendors = await db.select().from(schema.vendors);
      return vendors;
    } catch (error) {
      console.error('Error in getVendors:', error);
      throw error;
    }
  }

  /**
   * Get vendor by ID
   * @param {number} id - Vendor ID
   * @returns {Promise<object|undefined>} Vendor or undefined if not found
   */
  async getVendor(id) {
    try {
      const [vendor] = await db.select().from(schema.vendors).where(eq(schema.vendors.id, id)).limit(1);
      return vendor;
    } catch (error) {
      console.error('Error in getVendor:', error);
      throw error;
    }
  }

  /**
   * Create a new vendor
   * @param {object} insertVendor - Vendor data to insert
   * @returns {Promise<object>} Created vendor
   */
  async createVendor(insertVendor) {
    try {
      const [vendor] = await db.insert(schema.vendors).values(insertVendor).returning();
      return vendor;
    } catch (error) {
      console.error('Error in createVendor:', error);
      throw error;
    }
  }

  /**
   * Update a vendor
   * @param {number} id - Vendor ID
   * @param {object} updateVendor - Vendor data to update
   * @returns {Promise<object|undefined>} Updated vendor or undefined if not found
   */
  async updateVendor(id, updateVendor) {
    try {
      const [vendor] = await db.update(schema.vendors)
        .set(updateVendor)
        .where(eq(schema.vendors.id, id))
        .returning();
      return vendor;
    } catch (error) {
      console.error('Error in updateVendor:', error);
      throw error;
    }
  }

  /**
   * Delete a vendor
   * @param {number} id - Vendor ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteVendor(id) {
    try {
      const [vendor] = await db.delete(schema.vendors)
        .where(eq(schema.vendors.id, id))
        .returning();
      return !!vendor;
    } catch (error) {
      console.error('Error in deleteVendor:', error);
      throw error;
    }
  }

  /**
   * Get the budget
   * @returns {Promise<object|undefined>} Budget or undefined if not found
   */
  async getBudget() {
    try {
      console.log('Fetching budget from database');
      const [budget] = await db.select().from(schema.budgets).limit(1);
      console.log(`Found ${budget ? 1 : 0} budget entries`);
      return budget;
    } catch (error) {
      console.error('Error in getBudget:', error);
      throw error;
    }
  }

  /**
   * Set the budget
   * @param {object} insertBudget - Budget data to insert
   * @returns {Promise<object>} Created budget
   */
  async setBudget(insertBudget) {
    try {
      const [budget] = await db.insert(schema.budgets).values(insertBudget).returning();
      return budget;
    } catch (error) {
      console.error('Error in setBudget:', error);
      throw error;
    }
  }

  /**
   * Update the budget
   * @param {object} insertBudget - Budget data to update
   * @returns {Promise<object|undefined>} Updated budget or undefined if not found
   */
  async updateBudget(insertBudget) {
    try {
      const [budget] = await db.select().from(schema.budgets).limit(1);
      
      if (!budget) {
        return undefined;
      }
      
      const [updatedBudget] = await db.update(schema.budgets)
        .set(insertBudget)
        .where(eq(schema.budgets.id, budget.id))
        .returning();
      
      return updatedBudget;
    } catch (error) {
      console.error('Error in updateBudget:', error);
      throw error;
    }
  }

  /**
   * Get all expenses
   * @returns {Promise<Array<object>>} Array of expenses
   */
  async getExpenses() {
    try {
      console.log('Fetching expenses from database');
      const expenses = await db.select().from(schema.expenses);
      console.log(`Successfully fetched ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      console.error('Error in getExpenses:', error);
      throw error;
    }
  }

  /**
   * Get expense by ID
   * @param {number} id - Expense ID
   * @returns {Promise<object|undefined>} Expense or undefined if not found
   */
  async getExpense(id) {
    try {
      const [expense] = await db.select().from(schema.expenses).where(eq(schema.expenses.id, id)).limit(1);
      return expense;
    } catch (error) {
      console.error('Error in getExpense:', error);
      throw error;
    }
  }

  /**
   * Create a new expense
   * @param {object} insertExpense - Expense data to insert
   * @returns {Promise<object>} Created expense
   */
  async createExpense(insertExpense) {
    try {
      const [expense] = await db.insert(schema.expenses).values(insertExpense).returning();
      return expense;
    } catch (error) {
      console.error('Error in createExpense:', error);
      throw error;
    }
  }

  /**
   * Update an expense
   * @param {number} id - Expense ID
   * @param {object} updateExpense - Expense data to update
   * @returns {Promise<object|undefined>} Updated expense or undefined if not found
   */
  async updateExpense(id, updateExpense) {
    try {
      const [expense] = await db.update(schema.expenses)
        .set(updateExpense)
        .where(eq(schema.expenses.id, id))
        .returning();
      return expense;
    } catch (error) {
      console.error('Error in updateExpense:', error);
      throw error;
    }
  }

  /**
   * Delete an expense
   * @param {number} id - Expense ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteExpense(id) {
    try {
      const [expense] = await db.delete(schema.expenses)
        .where(eq(schema.expenses.id, id))
        .returning();
      return !!expense;
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      throw error;
    }
  }

  /**
   * Get all packing lists
   * @returns {Promise<Array<object>>} Array of packing lists
   */
  async getPackingLists() {
    try {
      const packingLists = await db.select().from(schema.packingLists);
      return packingLists;
    } catch (error) {
      console.error('Error in getPackingLists:', error);
      throw error;
    }
  }

  /**
   * Get packing list by ID
   * @param {number} id - Packing list ID
   * @returns {Promise<object|undefined>} Packing list or undefined if not found
   */
  async getPackingList(id) {
    try {
      const [packingList] = await db.select().from(schema.packingLists).where(eq(schema.packingLists.id, id)).limit(1);
      return packingList;
    } catch (error) {
      console.error('Error in getPackingList:', error);
      throw error;
    }
  }

  /**
   * Create a new packing list
   * @param {object} insertList - Packing list data to insert
   * @returns {Promise<object>} Created packing list
   */
  async createPackingList(insertList) {
    try {
      const [packingList] = await db.insert(schema.packingLists).values(insertList).returning();
      return packingList;
    } catch (error) {
      console.error('Error in createPackingList:', error);
      throw error;
    }
  }

  /**
   * Update a packing list
   * @param {number} id - Packing list ID
   * @param {object} updateList - Packing list data to update
   * @returns {Promise<object|undefined>} Updated packing list or undefined if not found
   */
  async updatePackingList(id, updateList) {
    try {
      const [packingList] = await db.update(schema.packingLists)
        .set(updateList)
        .where(eq(schema.packingLists.id, id))
        .returning();
      return packingList;
    } catch (error) {
      console.error('Error in updatePackingList:', error);
      throw error;
    }
  }

  /**
   * Delete a packing list
   * @param {number} id - Packing list ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePackingList(id) {
    try {
      const [packingList] = await db.delete(schema.packingLists)
        .where(eq(schema.packingLists.id, id))
        .returning();
      return !!packingList;
    } catch (error) {
      console.error('Error in deletePackingList:', error);
      throw error;
    }
  }

  /**
   * Get all packing items for a list
   * @param {number} listId - Packing list ID
   * @returns {Promise<Array<object>>} Array of packing items
   */
  async getPackingItems(listId) {
    try {
      const packingItems = await db.select().from(schema.packingItems).where(eq(schema.packingItems.listId, listId));
      return packingItems;
    } catch (error) {
      console.error('Error in getPackingItems:', error);
      throw error;
    }
  }

  /**
   * Get packing item by ID
   * @param {number} id - Packing item ID
   * @returns {Promise<object|undefined>} Packing item or undefined if not found
   */
  async getPackingItem(id) {
    try {
      const [packingItem] = await db.select().from(schema.packingItems).where(eq(schema.packingItems.id, id)).limit(1);
      return packingItem;
    } catch (error) {
      console.error('Error in getPackingItem:', error);
      throw error;
    }
  }

  /**
   * Create a new packing item
   * @param {object} insertItem - Packing item data to insert
   * @returns {Promise<object>} Created packing item
   */
  async createPackingItem(insertItem) {
    try {
      const [packingItem] = await db.insert(schema.packingItems).values(insertItem).returning();
      return packingItem;
    } catch (error) {
      console.error('Error in createPackingItem:', error);
      throw error;
    }
  }

  /**
   * Create multiple packing items
   * @param {Array<object>} insertItems - Array of packing items to insert
   * @returns {Promise<Array<object>>} Array of created packing items
   */
  async createPackingItems(insertItems) {
    try {
      const packingItems = await db.insert(schema.packingItems).values(insertItems).returning();
      return packingItems;
    } catch (error) {
      console.error('Error in createPackingItems:', error);
      throw error;
    }
  }

  /**
   * Update a packing item
   * @param {number} id - Packing item ID
   * @param {object} updateItem - Packing item data to update
   * @returns {Promise<object|undefined>} Updated packing item or undefined if not found
   */
  async updatePackingItem(id, updateItem) {
    try {
      const [packingItem] = await db.update(schema.packingItems)
        .set(updateItem)
        .where(eq(schema.packingItems.id, id))
        .returning();
      return packingItem;
    } catch (error) {
      console.error('Error in updatePackingItem:', error);
      throw error;
    }
  }

  /**
   * Delete a packing item
   * @param {number} id - Packing item ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePackingItem(id) {
    try {
      const [packingItem] = await db.delete(schema.packingItems)
        .where(eq(schema.packingItems.id, id))
        .returning();
      return !!packingItem;
    } catch (error) {
      console.error('Error in deletePackingItem:', error);
      throw error;
    }
  }

  /**
   * Get all payments
   * @returns {Promise<Array<object>>} Array of payments
   */
  async getPayments() {
    try {
      const payments = await db.select().from(schema.payments);
      return payments;
    } catch (error) {
      console.error('Error in getPayments:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a vendor
   * @param {number} vendorId - Vendor ID
   * @returns {Promise<Array<object>>} Array of payments
   */
  async getPaymentsByVendor(vendorId) {
    try {
      const payments = await db.select().from(schema.payments).where(eq(schema.payments.vendorId, vendorId));
      return payments;
    } catch (error) {
      console.error('Error in getPaymentsByVendor:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<object|undefined>} Payment or undefined if not found
   */
  async getPayment(id) {
    try {
      const [payment] = await db.select().from(schema.payments).where(eq(schema.payments.id, id)).limit(1);
      return payment;
    } catch (error) {
      console.error('Error in getPayment:', error);
      throw error;
    }
  }

  /**
   * Create a new payment
   * @param {object} insertPayment - Payment data to insert
   * @returns {Promise<object>} Created payment
   */
  async createPayment(insertPayment) {
    try {
      const [payment] = await db.insert(schema.payments).values(insertPayment).returning();
      return payment;
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  }

  /**
   * Update a payment
   * @param {number} id - Payment ID
   * @param {object} updatePayment - Payment data to update
   * @returns {Promise<object|undefined>} Updated payment or undefined if not found
   */
  async updatePayment(id, updatePayment) {
    try {
      const [payment] = await db.update(schema.payments)
        .set(updatePayment)
        .where(eq(schema.payments.id, id))
        .returning();
      return payment;
    } catch (error) {
      console.error('Error in updatePayment:', error);
      throw error;
    }
  }

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePayment(id) {
    try {
      const [payment] = await db.delete(schema.payments)
        .where(eq(schema.payments.id, id))
        .returning();
      return !!payment;
    } catch (error) {
      console.error('Error in deletePayment:', error);
      throw error;
    }
  }
}

// Create and export instance
module.exports = { DatabaseStorage };