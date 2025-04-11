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
   cd public_html && node start.js
   ```
5. Click "Save Changes"

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

### 7. Configure Apache

1. Make sure the `.htaccess` file is present in your application's public_html directory
2. In your Cloudways dashboard, go to your application
3. Navigate to "Application Settings" > "Apache"
4. Make sure "AllowOverride All" is enabled
5. Restart Apache by clicking "Restart Apache"

### 8. Start the Application

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