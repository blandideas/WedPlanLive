// Migrate database script for Vercel deployments
const { execSync } = require('child_process');

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Run database migration
async function main() {
  try {
    log('Starting database migration...');
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Run the migration (push schema to database)
    log('Pushing database schema...');
    execSync('npx drizzle-kit push:pg', { 
      stdio: 'inherit',
      env: process.env
    });
    
    log('Database migration completed successfully');
  } catch (error) {
    log(`Database migration failed: ${error.message}`);
    process.exit(1);
  }
}

main();