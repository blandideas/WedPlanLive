// Production server startup script
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create require function
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = 'production';

// Load environment variables from .env file if present
try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    dotenv.config();
    console.log('Loaded environment variables from .env file');
  }
} catch (error) {
  console.warn('Warning: Unable to load .env file:', error.message);
}

// Function to determine if we should use TypeScript or JavaScript server file
function determineServerEntrypoint() {
  // Check if compiled JS file exists in dist-server directory
  const compiledPath = path.join(__dirname, 'dist-server/index.js');
  if (fs.existsSync(compiledPath)) {
    console.log('Using compiled server from dist-server directory');
    return compiledPath;
  }
  
  // Fall back to the server directory
  const serverPath = path.join(__dirname, 'server/index.js');
  if (fs.existsSync(serverPath)) {
    console.log('Using server/index.js');
    return serverPath;
  }
  
  console.error('No server entrypoint found! Please build the server first.');
  process.exit(1);
}

// Start the server
console.log('Starting wedding planner application in production mode...');
const serverEntrypoint = determineServerEntrypoint();

// We need to use dynamic import for ES modules
import(serverEntrypoint)
  .catch(err => {
    console.error('Failed to start server:', err);
    
    // If ES modules import fails, try CommonJS require as fallback
    try {
      console.log('Trying CommonJS require as fallback...');
      require(serverEntrypoint);
    } catch (requireErr) {
      console.error('Both ES modules and CommonJS loading failed:', requireErr);
      process.exit(1);
    }
  });