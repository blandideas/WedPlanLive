// Simplified API index file to avoid import/module resolution issues
const express = require('express');
const { neon } = require('@neondatabase/serverless');

// Use CommonJS module format which is more reliable in Vercel Functions
module.exports = async (req, res) => {
  // Basic request info
  const requestPath = req.url;
  const method = req.method;
  
  try {
    // Simple handler that doesn't rely on imports
    if (requestPath.startsWith('/api/info')) {
      return res.status(200).json({
        message: "API is running",
        path: requestPath,
        method: method,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        isVercel: process.env.VERCEL === '1'
      });
    }
    
    // Tasks endpoint via direct database access
    if (requestPath.startsWith('/api/tasks-direct') && method === 'GET') {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({
          error: "Configuration error",
          message: "DATABASE_URL environment variable is not set"
        });
      }

      // Create SQL client directly
      const sql = neon(process.env.DATABASE_URL);
      
      // Query tasks table directly
      const tasks = await sql`SELECT * FROM tasks ORDER BY due_date`;
      
      return res.status(200).json({
        tasks,
        count: tasks.length,
        source: "direct-db-query",
        timestamp: new Date().toISOString()
      });
    }
    
    // Default handler
    return res.status(404).json({
      error: "Not found",
      message: `Endpoint ${requestPath} not found in simplified API`,
      availableEndpoints: ['/api/info', '/api/tasks-direct']
    });
  } catch (error) {
    // Error handler
    return res.status(500).json({
      error: "API Error",
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};