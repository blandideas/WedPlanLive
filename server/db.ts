import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Create a database connection
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
}

let client: any;
let db: any;

try {
  console.log("Attempting to connect to database...");
  
  client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for better compatibility
    ssl: true, // Always enable SSL for database connections
    onnotice: msg => console.log("DB notice:", msg),
    debug: (connection, query, params, types) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log("DB query:", query);
      }
    },
  });
  
  db = drizzle(client, { schema });
  
  console.log("Database connection established successfully");
} catch (error) {
  console.error("Failed to establish database connection:", error);
}

export { db };