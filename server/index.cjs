// Production server entry point for Cloudways (CommonJS)
const express = require('express');
const path = require('path');
const fs = require('fs');

// Try to load routes module - could be in different locations based on build
let registerRoutes;
try {
  // Get the parent directory (where this file resides)
  const currentDir = __dirname;
  const parentDir = path.dirname(currentDir);
  
  // Build a more comprehensive list of possible locations
  const possibleLocations = [
    // Current directory
    path.join(currentDir, 'routes.js'),
    
    // Parent directory
    path.join(parentDir, 'server/routes.js'),
    
    // Common build directories
    path.join(parentDir, 'dist-server/routes.js'),
    path.join(parentDir, 'dist/server/routes.js'),
    
    // Absolute paths
    path.resolve(process.cwd(), 'server/routes.js'),
    path.resolve(process.cwd(), 'routes.js'),
    path.resolve(process.cwd(), 'dist-server/routes.js'),
    
    // Fallback to Node.js resolution
    './routes.js',
    './server/routes.js',
    '../server/routes.js',
  ];
  
  // Log search locations for debugging
  console.log('Searching for routes module in the following locations:');
  possibleLocations.forEach(loc => console.log(' - ' + loc));
  
  let routesFound = false;
  let errorMessages = [];
  
  for (const location of possibleLocations) {
    try {
      // Check if file exists before requiring
      if (fs.existsSync(location)) {
        console.log(`File exists at ${location}, attempting to require...`);
        const routesModule = require(location);
        
        if (routesModule && (routesModule.registerRoutes || routesModule.default?.registerRoutes)) {
          registerRoutes = routesModule.registerRoutes || routesModule.default.registerRoutes;
          console.log(`✅ Successfully loaded routes module from ${location}`);
          routesFound = true;
          break;
        } else {
          console.log(`File at ${location} exists but doesn't export registerRoutes function`);
        }
      }
    } catch (e) {
      errorMessages.push(`Error loading ${location}: ${e.message}`);
      // Continue trying other locations
    }
  }
  
  if (!routesFound) {
    console.error('Failed to find routes module. Errors encountered:');
    errorMessages.forEach(msg => console.error(` - ${msg}`));
    throw new Error('Routes module not found in any expected location');
  }
} catch (error) {
  console.error('Failed to load routes module:', error);
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Determine dist directory
const distDir = path.join(__dirname, '../dist');
const altDistDir = path.join(process.cwd(), 'dist');
const useDistDir = fs.existsSync(distDir) ? distDir : altDistDir;

// Log application startup details
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Using static files from: ${useDistDir}`);

// Serve static files from the React app
app.use(express.static(useDistDir));

// Register API routes and start server
async function startServer() {
  try {
    console.log('Attempting to connect to database...');
    
    // Register API routes
    const server = await registerRoutes(app);
    
    // Serve static files and implement SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(useDistDir, 'index.html');
      
      // Check if the file exists to prevent errors
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application is not built properly. Static files not found.');
      }
    });
    
    // Global error handler
    app.use((err, _req, res, _next) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
    
    // Get port from environment or use default (8080 for Cloudways)
    const PORT = process.env.PORT || 8080;
    
    // Start listening on all interfaces
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();