// Database status check API
import { Pool } from 'pg';

export default async function handler(req, res) {
  const statusInfo = {
    timestamp: new Date().toISOString(),
    databaseCheck: {
      database_url_provided: !!process.env.DATABASE_URL
    }
  };

  // Only attempt connection if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    try {
      console.log("Attempting database connection check...");
      
      // Create database connection with SSL enabled
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Less strict for testing
        }
      });

      // Test connection
      const client = await pool.connect();
      console.log("Successfully connected to database");
      
      // Check if tables exist
      const tableCheckQueries = [
        { table: 'tasks', query: 'SELECT COUNT(*) FROM tasks' },
        { table: 'budgets', query: 'SELECT COUNT(*) FROM budgets' },
        { table: 'expenses', query: 'SELECT COUNT(*) FROM expenses' }
      ];
      
      statusInfo.tables = {};
      
      for (const check of tableCheckQueries) {
        try {
          const result = await client.query(check.query);
          statusInfo.tables[check.table] = {
            exists: true,
            count: parseInt(result.rows[0].count, 10)
          };
        } catch (tableError) {
          console.error(`Error checking ${check.table} table:`, tableError.message);
          statusInfo.tables[check.table] = {
            exists: false,
            error: tableError.message
          };
        }
      }
      
      // Clean up
      client.release();
      await pool.end();
      
      statusInfo.databaseCheck.connected = true;
      
    } catch (error) {
      console.error("Database connection error:", error.message);
      statusInfo.databaseCheck.connected = false;
      statusInfo.databaseCheck.error = error.message;
    }
  }
  
  res.status(200).json(statusInfo);
}