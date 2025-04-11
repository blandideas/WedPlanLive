// Direct database access with minimal dependencies
const { neon } = require('@neondatabase/serverless');

// Handler for direct database access
module.exports = async (req, res) => {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Configuration error",
        message: "DATABASE_URL environment variable is not set"
      });
    }

    // Create SQL client with Neon
    const sql = neon(process.env.DATABASE_URL);
    
    // Try to query the current time to verify connection
    const timeResult = await sql`SELECT NOW() as server_time`;
    
    // Try to get a list of tables to check schema
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    // Return successful response with database information
    return res.status(200).json({
      status: "success",
      message: "Direct database connection successful",
      serverTime: timeResult[0]?.server_time,
      tables: tablesResult.map(row => row.table_name),
      connectionType: "direct neon connection",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Return detailed error information
    return res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message || String(error),
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  }
};