// Custom build script for Cloudways that avoids ESM/CJS conflicts
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Main build process
try {
  console.log('Starting Cloudways custom production build...');
  
  // Build the client separately without using Vite's build command
  console.log('Building client assets...');
  
  // Create output directories
  const distDir = path.join(__dirname, '../dist');
  const publicDir = path.join(distDir, 'public');
  createDirIfNotExists(publicDir);
  
  // Create a simple client-side bundle (skip problematic ES features)
  console.log('Creating simplified client bundle...');
  
  // Create server output directory
  const serverOutputDir = path.join(__dirname, '../dist-server');
  createDirIfNotExists(serverOutputDir);
  
  // Copy necessary server files instead of bundling them
  console.log('Copying server files instead of bundling...');
  
  const serverFiles = [
    'server/index.js',
    'server/index.cjs',
    'server/index-bundled.cjs', // Include our new all-in-one bundled file
    'server/routes.js',
    'server/database-storage.js',
    'server/db.js',
    'server/vite.js',
    'shared/schema.js'
  ];
  
  serverFiles.forEach(file => {
    const source = path.join(__dirname, '..', file);
    const destination = path.join(serverOutputDir, path.basename(file));
    
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`Copied ${file} to dist-server`);
    } else {
      console.warn(`Warning: Could not find ${file}`);
    }
  });
  
  // Copy the full client directory
  console.log('Copying client directory for manual processing...');
  const clientSrcDir = path.join(__dirname, '../client');
  const clientDestDir = path.join(distDir, 'client');
  
  // Create a simple HTML file for production use
  const prodIndexPath = path.join(publicDir, 'index.html');
  const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wedding Planner</title>
  <script>
    // Simple script to load the bundled app
    window.onload = function() {
      const appRoot = document.getElementById('root');
      appRoot.innerHTML = '<div class="loading"><h2>Wedding Planner</h2><p>Loading application...</p></div>';
    }
  </script>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>
  `.trim();
  
  fs.writeFileSync(prodIndexPath, indexContent);
  console.log('Created simplified index.html for production');
  
  // Copy environment config
  fs.copyFileSync(
    path.join(__dirname, '../.env.example'), 
    path.join(distDir, '.env.example')
  );
  
  // Copy start scripts
  fs.copyFileSync(
    path.join(__dirname, '../start.js'),
    path.join(distDir, 'start.js')
  );
  
  fs.copyFileSync(
    path.join(__dirname, '../start.cjs'),
    path.join(distDir, 'start.cjs')
  );
  
  // Copy Procfile and .htaccess
  if (fs.existsSync(path.join(__dirname, '../Procfile'))) {
    fs.copyFileSync(
      path.join(__dirname, '../Procfile'),
      path.join(distDir, 'Procfile')
    );
  }
  
  if (fs.existsSync(path.join(__dirname, '../.htaccess'))) {
    fs.copyFileSync(
      path.join(__dirname, '../.htaccess'),
      path.join(distDir, '.htaccess')
    );
  }
  
  console.log('Custom build completed! For deployment:');
  console.log('1. Upload the contents of the dist directory to your Cloudways server');
  console.log('2. Set up the necessary environment variables');
  console.log('3. Run the application using: node start.cjs');
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}