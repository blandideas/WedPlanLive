// This file can be used with a Vercel deployment hook to run migrations
import { exec } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Simple auth check - can be enhanced with proper authentication
export default async function handler(req, res) {
  // You can add a secret key check here for added security
  if (req.headers['x-vercel-signature'] !== process.env.MIGRATION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('Starting database migration...');
    
    // Run the database migration command
    exec('npm run db:push', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      
      if (stderr) {
        console.error(`Migration stderr: ${stderr}`);
      }
      
      console.log(`Migration stdout: ${stdout}`);
      console.log('Database migration completed successfully');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Database migration completed successfully' 
      });
    });
  } catch (error) {
    console.error('Error running migration:', error);
    return res.status(500).json({ 
      error: 'Failed to run database migration', 
      details: error.message 
    });
  }
}