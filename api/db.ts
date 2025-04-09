import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "../shared/schema";

// Create a database connection optimized for serverless
const connectionString = process.env.DATABASE_URL!;

// Neon serverless client
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });