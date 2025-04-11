// This file helps debug Neon database connection issues on Vercel
const { neon, neonConfig } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Configuration error",
        message: "DATABASE_URL environment variable is not set"
      });
    }

    // Configure Neon for better Vercel environment support
    neonConfig.fetchConnectionCache = true;
    neonConfig.useSecureWebSocket = true; // Use secure WebSockets
    
    // Try multiple connection approaches
    let result = {};
    
    try {
      // Approach 1: Direct connection using Neon
      const sql = neon(process.env.DATABASE_URL);
      const timeResult = await sql`SELECT NOW() as time`;
      result.direct = {
        status: "success",
        message: "Direct connection successful",
        time: timeResult[0]?.time
      };
    } catch (directError) {
      result.direct = {
        status: "error",
        message: directError.message || String(directError)
      };
    }
    
    // Additional database information
    try {
      const sql = neon(process.env.DATABASE_URL);
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      result.schema = {
        status: "success",
        tables: tablesResult.map(row => row.table_name)
      };
      
      // Get column info for tasks table if it exists
      if (tablesResult.some(row => row.table_name === 'tasks')) {
        const columnsResult = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'tasks'
          ORDER BY ordinal_position;
        `;
        
        result.schema.tasks = {
          columns: columnsResult.map(col => ({ 
            name: col.column_name, 
            type: col.data_type 
          }))
        };
        
        // Get sample data if available
        try {
          const sampleData = await sql`SELECT * FROM tasks LIMIT 3`;
          result.schema.tasks.sample = sampleData;
        } catch (sampleError) {
          result.schema.tasks.sample = { 
            error: sampleError.message || String(sampleError) 
          };
        }
      }
    } catch (schemaError) {
      result.schema = {
        status: "error",
        message: schemaError.message || String(schemaError)
      };
    }
    
    // Return all results
    return res.status(200).json({
      message: "Vercel database setup diagnostic",
      databaseUrl: process.env.DATABASE_URL ? "Present (value hidden)" : "Missing",
      timestamp: new Date().toISOString(),
      results: result,
      environment: {
        node: process.version,
        isVercel: process.env.VERCEL === "1",
        region: process.env.VERCEL_REGION || "unknown"
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database diagnostic failed",
      message: error.message || String(error),
      stack: error.stack
    });
  }
};