// Diagnostic function to identify Vercel serverless issues
const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  // Test data for basic serverless function execution
  const diagnosticResults = {
    serverless: {
      status: "success",
      message: "Basic serverless function execution is working"
    },
    environment: {
      status: "pending",
      message: "Checking environment variables",
      variables: {}
    },
    database: {
      status: "pending",
      message: "Database connection not tested yet",
      connection: null,
      query: null
    }
  };

  try {
    // Check environment variables
    const envVars = {
      // List only that a variable exists, never show the actual value for security
      DATABASE_URL: process.env.DATABASE_URL ? "Set (value hidden)" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_REGION: process.env.VERCEL_REGION
    };

    diagnosticResults.environment.variables = envVars;
    
    if (!process.env.DATABASE_URL) {
      diagnosticResults.environment.status = "error";
      diagnosticResults.environment.message = "DATABASE_URL environment variable is not set";
    } else {
      diagnosticResults.environment.status = "success";
      diagnosticResults.environment.message = "Required environment variables are set";
    }

    // Only test database if we have connection string
    if (process.env.DATABASE_URL) {
      try {
        // Test database connection
        const startTime = Date.now();
        const sql = neon(process.env.DATABASE_URL);
        
        diagnosticResults.database.connection = {
          status: "success",
          message: "Database connection established",
          time: `${Date.now() - startTime}ms`
        };

        // Test a simple query
        const queryStartTime = Date.now();
        const result = await sql`SELECT NOW() as time`;
        
        diagnosticResults.database.query = {
          status: "success",
          message: "Successfully executed query",
          time: `${Date.now() - queryStartTime}ms`,
          result: result && result.length ? `Current time: ${result[0].time}` : "No result returned"
        };

        diagnosticResults.database.status = "success";
        diagnosticResults.database.message = "Database connection and query successful";
      } catch (dbError) {
        // Database connection or query failed
        diagnosticResults.database.status = "error";
        diagnosticResults.database.message = "Database error: " + (dbError.message || String(dbError));
        
        if (dbError.code) {
          diagnosticResults.database.errorCode = dbError.code;
        }
        
        // Check for common issues
        const errorMsg = dbError.message || "";
        if (errorMsg.includes("certificate")) {
          diagnosticResults.database.suggestion = "SSL certificate issue detected. Make sure your connection string uses ?sslmode=require";
        } else if (errorMsg.includes("password") || errorMsg.includes("authentication")) {
          diagnosticResults.database.suggestion = "Authentication issue detected. Check username and password in your connection string";
        } else if (errorMsg.includes("timeout") || errorMsg.includes("timed out")) {
          diagnosticResults.database.suggestion = "Connection timeout. Check network settings and firewall rules on your database";
        } else if (errorMsg.includes("unreachable") || errorMsg.includes("could not connect")) {
          diagnosticResults.database.suggestion = "Host unreachable. Verify your host address and that the database allows connections from Vercel's IP range";
        }
      }
    }

    // Additional serverless environment information
    diagnosticResults.serverInfo = {
      timestamp: new Date().toISOString(),
      vercelInfo: {
        isVercel: process.env.VERCEL === "1",
        region: process.env.VERCEL_REGION,
        environment: process.env.VERCEL_ENV
      },
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    };

    // Return the complete diagnostic results
    return res.status(200).json(diagnosticResults);
  } catch (error) {
    // Something unexpected happened in our diagnostic code
    return res.status(500).json({
      error: "Diagnostic function failed",
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};