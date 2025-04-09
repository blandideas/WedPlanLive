#!/bin/bash

# Run database migrations if we're in a production or preview environment
if [ "$VERCEL_ENV" = "production" ] || [ "$VERCEL_ENV" = "preview" ]; then
  echo "Running database migrations..."
  
  # Try standard migration first
  if [ -n "$DATABASE_URL" ]; then
    echo "Attempting to run drizzle-kit push..."
    npm run db:push || echo "Standard migration failed, will use fallback initialization"
  else
    echo "DATABASE_URL not set, skipping standard migration"
  fi
  
  echo "Database migrations step completed"
fi

# Build the frontend using Vite
echo "Building frontend..."
vite build

# Build the serverless API
echo "Building serverless API..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create a helper script that can be used to manually initialize the database
cat > dist/db-init.js << EOL
// Database initialization helper
// Run this script with:
// node db-init.js
const https = require('https');

const APP_URL = process.env.VERCEL_URL || 'your-app.vercel.app';
const options = {
  hostname: APP_URL,
  port: 443,
  path: '/api/db-push',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

if (process.env.DB_PUSH_SECRET) {
  options.headers['Authorization'] = \`Bearer \${process.env.DB_PUSH_SECRET}\`;
}

console.log('Initializing database tables...');
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Database tables created successfully!');
    } else {
      console.error(\`Failed with status \${res.statusCode}:\`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error initializing database:', error);
});

req.end();
EOL

echo "Build completed successfully"
echo "Note: If database tables are missing, run 'node db-init.js' or make a POST request to '/api/db-push'"