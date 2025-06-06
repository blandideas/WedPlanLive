// Simple DB status check endpoint that doesn't rely on complex imports
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: "DATABASE_URL is not set",
        tables: [] 
      });
    }
    
    // Check database connection with minimal dependencies
    try {
      const sql = neon(process.env.DATABASE_URL);
      const tables = await sql`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname='public'
      `;
      
      return res.status(200).json({
        connected: true,
        databaseUrl: process.env.DATABASE_URL.substring(0, 15) + "...",
        tables: tables.map(t => t.tablename)
      });
    } catch (error) {
      return res.status(500).json({ 
        error: "Database connection failed", 
        details: error.message 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: "Error checking database status",
      details: error.message 
    });
  }
}