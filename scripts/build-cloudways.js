// Production build script for Cloudways
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
  
  // Also copy our custom CommonJS files for deployment
  console.log('Copying CommonJS server files for Cloudways...');
  
  const serverFiles = [
    'server/routes.js',
    'server/database-storage.js',
    'server/db.js',
    'shared/schema.js'
  ];
  
  serverFiles.forEach(file => {
    const source = path.join(__dirname, '..', file);
    const destination = path.join(__dirname, '../dist-server', path.basename(file));
    
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`Copied ${file} to dist-server`);
    } else {
      console.warn(`Warning: Could not find ${file}`);
    }
  });
  
  console.log('Build completed successfully! Deploy the contents of both dist and dist-server directories.');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}