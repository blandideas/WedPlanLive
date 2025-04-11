#!/usr/bin/env node

/**
 * Cloudways Deployment Script
 * 
 * This script should be run on the Cloudways server after a Git pull to prepare the application.
 * It creates a production build and sets up the application for running in a Cloudways environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Utility functions
function log(message) {
  console.log(`[Cloudways Deploy] ${message}`);
}

function error(message) {
  console.error(`[Cloudways Deploy ERROR] ${message}`);
  process.exit(1);
}

// Create directory if it doesn't exist
function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

// Get environment variables
const PORT = process.env.PORT || 8080;
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Validate environment
log('Checking environment...');
if (!DATABASE_URL) {
  error('DATABASE_URL environment variable is required. Please set it in your Cloudways application settings.');
}

// Create .env file if it doesn't exist
log('Creating .env file...');
const envContent = `
# Environment Variables
NODE_ENV=${NODE_ENV}
PORT=${PORT}
DATABASE_URL=${DATABASE_URL}
`.trim();

fs.writeFileSync('.env', envContent);
log('Created .env file with required variables');

// Build the frontend
try {
  log('Building frontend...');
  // This will ensure node_modules are installed
  execSync('npm ci --only=production', { stdio: 'inherit' });
  
  // Use the bundled CommonJS file directly
  log('Setting up server for production...');
  
  // Create or update the production runner script
  const productionScript = `
#!/usr/bin/env node

// Simple production runner for Cloudways
require('./server/index-bundled.cjs');
`.trim();

  fs.writeFileSync('app.js', productionScript);
  fs.chmodSync('app.js', '755');
  log('Created app.js runner file');
  
  // Success message
  log('Deployment preparation complete!');
  log(`To start the application, run: NODE_ENV=production PORT=${PORT} node app.js`);
  
  // Check if running on Cloudways Application Startup Hook
  if (process.env.CLOUDWAYS_DEPLOYMENT === 'true') {
    log('Running as part of Cloudways deployment - starting application automatically');
    execSync(`NODE_ENV=production PORT=${PORT} node app.js`, { stdio: 'inherit' });
  }
  
} catch (error) {
  error(`Failed to prepare deployment: ${error.message}`);
}