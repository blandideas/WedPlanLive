# Cloudways Deployment Guide for Wedding Planner Application

This guide walks you through the process of deploying the Wedding Planner application to Cloudways.

## Prerequisites

1. A Cloudways account
2. Basic knowledge of Git, Node.js, and PostgreSQL
3. Access to your application's GitHub repository: https://github.com/blandideas/WeddingPlannerCL

## Deployment Steps

### 1. Create a Cloudways Application

1. Log in to your Cloudways account
2. Click on "Applications" in the top menu
3. Click the "+" button to add a new application
4. Select "Custom App" as the application type
5. Choose your preferred PHP version (7.4+ recommended)
6. Select your server location
7. Name your application (e.g., "WeddingPlanner")
8. Click "Launch Now"

### 2. Set Up PostgreSQL Database

1. In your Cloudways dashboard, go to your server
2. Click on "Database Manager"
3. Create a new PostgreSQL database
4. Note down the database credentials:
   - Database Name
   - Username
   - Password
   - Host (usually localhost)
   - Port (usually 5432)

### 3. Deploy Application Code

#### Option 1: Using Git

1. In your Cloudways dashboard, go to your application
2. Navigate to "Application Settings" > "Git"
3. Enable Git deployment
4. Enter your GitHub repository URL: `https://github.com/blandideas/WeddingPlannerCL.git`
5. Set branch to `main`
6. Add your GitHub credentials if the repository is private
7. Click "Save Changes" and then "Deploy"

#### Option 2: Manual Deployment

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/blandideas/WeddingPlannerCL.git
   ```
2. Build the application locally:
   ```
   cd WeddingPlannerCL
   npm install
   node scripts/build-cloudways.js
   ```
3. Use SFTP to upload the contents of your local repository to the Cloudways application's public_html directory
   - Upload both the dist directory contents and the server files

### 4. Configure Environment Variables

1. Create a `.env` file in your application root based on the `.env.example` template
2. Update the following variables:
   ```
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=postgresql://username:password@host:port/dbname
   DATABASE_SSL=true
   SESSION_SECRET=your-secure-random-string
   ```
3. Replace the database credentials with those from step 2

### 5. Set Up Node.js Environment

1. In your Cloudways dashboard, go to your server
2. Navigate to "Packages" > "Node.js"
3. Install Node.js (version 18+ recommended)
4. Add the following to "Start Command":
   ```
   cd public_html && node start.cjs
   ```
5. Click "Save Changes"

> **Note**: We're using the CommonJS version (start.cjs) of the startup script since it's more compatible with various Node.js environments. The ES modules version (start.js) is also available if needed.

### 6. Run Database Migrations

1. SSH into your Cloudways server
2. Navigate to your application directory:
   ```
   cd applications/YOUR_APP_NAME/public_html
   ```
3. Run the following commands:
   ```
   npm install
   npm run db:push
   ```

### 7. Using the Custom Build Scripts (Recommended)

We've created custom build scripts that avoid module compatibility issues:

1. SSH into your Cloudways server
2. Navigate to your application directory:
   ```
   cd applications/YOUR_APP_NAME/public_html
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the CommonJS compatible build script:
   ```
   node scripts/cloudways-custom-build.cjs
   ```
5. This will create all the necessary files in the `dist` and `dist-server` directories without module system conflicts

> **Note**: The custom build script bypasses problematic ES module features and creates a simplified deployment structure that works well with Cloudways. This avoids the `import.meta` and top-level await errors you might encounter with the standard build process.

### 8. Manual Build Process (Alternative)

If you encounter issues with both the standard and custom build scripts, you can use this alternative manual process:

1. SSH into your Cloudways server
2. Navigate to your application directory:
   ```
   cd applications/YOUR_APP_NAME/public_html
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Manually create the necessary directories:
   ```
   mkdir -p dist/public dist-server
   ```
5. Copy server files:
   ```
   cp server/index.cjs dist-server/
   cp server/routes.js dist-server/
   cp server/database-storage.js dist-server/
   cp server/db.js dist-server/
   cp shared/schema.js dist-server/
   ```
6. Create a simple index.html file:
   ```
   echo '<!DOCTYPE html><html><head><title>Wedding Planner</title></head><body><div id="root"></div></body></html>' > dist/public/index.html
   ```
7. Copy startup files:
   ```
   cp start.cjs dist/
   cp .env.example dist/
   ```

### 9. Configure Apache

1. Make sure the `.htaccess` file is present in your application's public_html directory
2. In your Cloudways dashboard, go to your application
3. Navigate to "Application Settings" > "Apache"
4. Make sure "AllowOverride All" is enabled
5. Restart Apache by clicking "Restart Apache"

### 10. Start the Application

1. In your Cloudways dashboard, go to your server
2. Navigate to "Packages" > "Node.js"
3. Click "Restart" to start the Node.js process
4. Check the logs to make sure the application starts without errors

## Troubleshooting

### Application Not Starting

1. Check the Node.js logs in your Cloudways dashboard
2. Verify that your `.env` file contains the correct database credentials
3. Make sure all required files are properly uploaded to the server

### Database Connection Issues

1. Verify that your PostgreSQL database is running
2. Check that the database credentials in your `.env` file are correct
3. Ensure that your server allows connections to the PostgreSQL port

### 404 Errors on Routes

1. Make sure the `.htaccess` file is correctly configured
2. Verify that Apache is correctly forwarding requests to your Node.js application
3. Check that "AllowOverride All" is enabled in your Apache configuration

### Module System Errors

If you see errors like `"import.meta" is not available with the "cjs" output format` or `Top-level await is currently not supported with the "cjs" output format`:

1. Use the CommonJS version of our custom build script (scripts/cloudways-custom-build.cjs)
2. Avoid using the standard build process which tries to convert ES modules to CommonJS
3. Make sure to run the application using the CommonJS entry point (start.cjs)
4. If you make manual code changes, avoid using ES module features like import.meta and top-level await

### Routes Module Not Found Error

If you encounter errors like `Failed to load routes module: Error: Routes module not found in any expected location`:

1. Use the bundled server file which contains all dependencies in a single file:
   ```
   node server/index-bundled.cjs
   ```
   This file combines server, routes, and database logic in one file to avoid module resolution issues.

2. If you prefer not using the bundled file, make sure all required files are in the correct locations relative to each other:
   - The server directory should contain: index.cjs, routes.js, database-storage.js, db.js
   - The shared directory should contain: schema.js

## Maintenance and Updates

### Updating the Application

1. Push changes to your GitHub repository
2. If using Git deployment, click "Pull" in your Cloudways dashboard
3. If using manual deployment, rebuild locally and upload the new files
4. Restart the Node.js process

### Monitoring

1. Use the Cloudways monitoring tools to keep track of your application's performance
2. Check the Node.js logs periodically for any errors
3. Set up alerts for critical metrics such as CPU usage and memory consumption

## Support

If you encounter any issues with the deployment, please contact the application developer or Cloudways support for assistance.