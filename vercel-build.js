// This script runs during the Vercel build process to push database schema changes
const { execSync } = require('child_process');

// Only run migrations on production/preview builds
// This prevents running migrations during development builds
if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
  console.log('Running database migrations...');
  
  try {
    // Execute the database push command
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
    // We don't exit with an error code because we still want the build to complete
    // even if migrations fail - you might want to change this behavior
  }
} else {
  console.log('Skipping database migrations in development environment');
}