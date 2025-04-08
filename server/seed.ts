import { db } from "./db";
import {
  users, tasks, vendors, budgets, expenses, packingLists, packingItems, payments
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed tasks
  const sampleTasks = [
    { title: "Book venue", dueDate: "2024-08-15", priority: "High", status: "Completed" },
    { title: "Send invitations", dueDate: "2024-09-01", priority: "Medium", status: "In Progress" },
    { title: "Order wedding cake", dueDate: "2024-10-15", priority: "Medium", status: "Not Started" },
    { title: "Book photographer", dueDate: "2024-09-15", priority: "High", status: "Not Started" },
    { title: "Choose wedding dress", dueDate: "2024-07-30", priority: "High", status: "Completed" },
  ];
  
  console.log("Inserting tasks...");
  await db.insert(tasks).values(sampleTasks).onConflictDoNothing();
  
  // Seed vendors
  const sampleVendors = [
    { name: "Sunset Gardens", category: "Venue", contact: "John Smith", phone: "555-123-4567", email: "info@sunsetgardens.com" },
    { name: "Delicious Cakes", category: "Catering", contact: "Mary Johnson", phone: "555-987-6543", email: "orders@deliciouscakes.com" },
    { name: "Elegant Florals", category: "Decor", contact: "Susan Williams", phone: "555-456-7890", email: "susan@elegantflorals.com" },
    { name: "Flash Photography", category: "Photography", contact: "Mike Brown", phone: "555-789-0123", email: "mike@flashphotography.com" },
  ];
  
  console.log("Inserting vendors...");
  await db.insert(vendors).values(sampleVendors).onConflictDoNothing();
  
  // Seed budget
  console.log("Inserting budget...");
  await db.insert(budgets).values({ amount: 20000 }).onConflictDoNothing();
  
  // Seed expenses
  const sampleExpenses = [
    { category: "Venue & Catering", item: "Wedding venue rental", vendor: "Sunset Gardens", amount: 8000 },
    { category: "Attire", item: "Wedding dress", vendor: "Bridal Dreams", amount: 2500 },
    { category: "Decorations", item: "Flowers", vendor: "Elegant Florals", amount: 1500 },
    { category: "Photography", item: "Photographer", vendor: "Flash Photography", amount: 3000 },
    { category: "Entertainment", item: "DJ services", vendor: "Music Masters", amount: 1200 },
  ];
  
  console.log("Inserting expenses...");
  await db.insert(expenses).values(sampleExpenses).onConflictDoNothing();
  
  // Seed packing lists
  const samplePackingLists = [
    { activity: "Honeymoon Trip", description: "Everything needed for our two-week trip to Bali" },
    { activity: "Wedding Ceremony", description: "Items to bring to the ceremony venue" },
  ];
  
  console.log("Inserting packing lists...");
  let packingListResults;
  try {
    packingListResults = await db.insert(packingLists).values(samplePackingLists).returning();
  } catch (error) {
    console.error("Error inserting packing lists:", error);
    // Check if the packing lists already exist
    packingListResults = await db.select().from(packingLists);
  }
  
  // Seed packing items (only if we have lists)
  if (packingListResults && packingListResults.length > 0) {
    const honeymoonList = packingListResults.find(list => list.activity === "Honeymoon Trip");
    const ceremonyList = packingListResults.find(list => list.activity === "Wedding Ceremony");
    
    const honeymoonItems = honeymoonList ? [
      { listId: honeymoonList.id, item: "Swimsuit", quantity: 2, packed: false },
      { listId: honeymoonList.id, item: "Passport", quantity: 1, packed: true },
      { listId: honeymoonList.id, item: "Sunscreen", quantity: 1, packed: false },
      { listId: honeymoonList.id, item: "Camera", quantity: 1, packed: false },
    ] : [];
    
    const ceremonyItems = ceremonyList ? [
      { listId: ceremonyList.id, item: "Wedding rings", quantity: 2, packed: true },
      { listId: ceremonyList.id, item: "Vows", quantity: 2, packed: false },
      { listId: ceremonyList.id, item: "Marriage license", quantity: 1, packed: false },
    ] : [];
    
    const allItems = [...honeymoonItems, ...ceremonyItems];
    
    if (allItems.length > 0) {
      console.log("Inserting packing items...");
      await db.insert(packingItems).values(allItems).onConflictDoNothing();
    }
  }
  
  // Seed payments
  const samplePayments = [
    { vendorId: 1, amount: 2000, date: "2024-07-01", description: "Venue deposit", isPaid: true },
    { vendorId: 2, amount: 500, date: "2024-08-15", description: "Cake deposit", isPaid: false },
    { vendorId: 3, amount: 750, date: "2024-09-01", description: "Flowers down payment", isPaid: false },
  ];
  
  console.log("Inserting payments...");
  await db.insert(payments).values(samplePayments).onConflictDoNothing();
  
  console.log("Database seeding completed successfully!");
}

// Run seed function
seed()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });