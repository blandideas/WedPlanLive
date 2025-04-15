// Production server startup script (CommonJS version)
const path = require('path');
const fs = require('fs');

// Set production environment
process.env.NODE_ENV = 'production';

// Load environment variables from .env file if present
try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config();
    console.log('Loaded environment variables from .env file');
  }
} catch (error) {
  console.warn('Warning: Unable to load .env file:', error.message);
}

// Function to determine if we should use TypeScript or JavaScript server file
function determineServerEntrypoint() {
  // Check for CJS version first
  const cjsPath = path.join(__dirname, 'server/index.cjs');
  if (fs.existsSync(cjsPath)) {
    console.log('Using CommonJS server: server/index.cjs');
    return cjsPath;
  }
  
  // Check if compiled JS file exists in dist directory
  const compiledPath = path.join(__dirname, 'dist/index.js');
  if (fs.existsSync(compiledPath)) {
    console.log('Using compiled server from dist directory');
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

try {
  require(serverEntrypoint);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}