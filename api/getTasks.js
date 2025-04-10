// Standalone API endpoint for getting tasks
const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the database URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ 
        error: 'DATABASE_URL environment variable is not set' 
      });
    }
    
    // Create the database connection
    const sql = neon(dbUrl);
    
    // Get all tasks directly using SQL
    const tasks = await sql`
      SELECT id, title, due_date, priority, status
      FROM tasks
      ORDER BY id DESC
    `;
    
    // Return the tasks
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching tasks',
      message: error.message || String(error),
      stack: error.stack
    });
  }
}