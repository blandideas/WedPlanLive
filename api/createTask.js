// Standalone API endpoint for creating tasks
const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get task data from request body
    const { title, due_date, priority, status } = req.body;
    
    if (!title || !due_date || !priority || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'due_date', 'priority', 'status'],
        received: req.body
      });
    }

    // Get the database URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ 
        error: 'DATABASE_URL environment variable is not set' 
      });
    }
    
    // Create the database connection
    const sql = neon(dbUrl);
    
    // Insert the task directly using SQL
    const result = await sql`
      INSERT INTO tasks (title, due_date, priority, status)
      VALUES (${title}, ${due_date}, ${priority}, ${status})
      RETURNING id, title, due_date, priority, status
    `;
    
    // Return the created task
    if (result && result.length > 0) {
      console.log('Task created successfully:', result[0]);
      return res.status(201).json(result[0]);
    } else {
      return res.status(500).json({ error: 'Failed to create task, no result returned' });
    }
  } catch (error) {
    console.error('Task creation error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during task creation',
      message: error.message || String(error),
      stack: error.stack
    });
  }
}