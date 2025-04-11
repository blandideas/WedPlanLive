// Simple diagnostic API to test database connection
import { Pool } from 'pg';

export default async function handler(req, res) {
  try {
    const diagnosticInfo = {
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      databaseUrlProvided: !!process.env.DATABASE_URL,
      serverInfo: {
        platform: process.platform,
        nodeVersion: process.version,
      }
    };
    
    // Test database connection
    if (process.env.DATABASE_URL) {
      try {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false // Less strict for testing
          }
        });
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as time');
        diagnosticInfo.dbConnection = {
          success: true,
          timestamp: result.rows[0].time
        };
        client.release();
        await pool.end();
      } catch (dbError) {
        diagnosticInfo.dbConnection = {
          success: false,
          error: dbError.message
        };
      }
    } else {
      diagnosticInfo.dbConnection = {
        success: false,
        error: 'DATABASE_URL not provided'
      };
    }
    
    res.status(200).json(diagnosticInfo);
  } catch (error) {
    res.status(500).json({ 
      error: 'Diagnostic failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}