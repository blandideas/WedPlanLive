// Production build script for Cloudways
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create necessary directories
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Main build process
try {
  console.log('Starting Cloudways production build...');
  
  // Build the frontend
  console.log('Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Create server output directory
  const serverOutputDir = path.join(__dirname, '../dist-server');
  createDirIfNotExists(serverOutputDir);
  
  // Build server TypeScript files
  console.log('Building server...');
  execSync(`npx esbuild server/**/*.ts --platform=node --packages=external --bundle --outdir=${serverOutputDir}`, 
    { stdio: 'inherit' });
  
  // Copy necessary files
  console.log('Copying production files...');
  fs.copyFileSync(
    path.join(__dirname, '../.env.example'), 
    path.join(__dirname, '../dist/.env.example')
  );
  
  console.log('Build completed successfully! Deploy the contents of both dist and dist-server directories.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}