// Production server entry point for Cloudways
const express = require('express');
const path = require('path');
const fs = require('fs');

// Try to load routes module - could be in different locations based on build
let registerRoutes;
try {
  // First try TypeScript compiled version (if available)
  registerRoutes = require('./routes.js').registerRoutes;
} catch (error) {
  try {
    // Fall back to CommonJS routes if TypeScript version fails
    const routesModule = require('./routes');
    registerRoutes = routesModule.registerRoutes || routesModule.default?.registerRoutes;
    
    if (!registerRoutes) {
      throw new Error('registerRoutes function not found in routes module');
    }
  } catch (fallbackError) {
    console.error('Failed to load routes module:', fallbackError);
    process.exit(1);
  }
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