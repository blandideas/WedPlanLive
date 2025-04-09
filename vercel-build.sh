#!/bin/bash

# Run database migrations if we're in a production or preview environment
if [ "$VERCEL_ENV" = "production" ] || [ "$VERCEL_ENV" = "preview" ]; then
  echo "Running database migrations..."
  
  # Run the database push command
  npm run db:push
  
  echo "Database migrations completed"
fi

# Build the frontend using Vite
echo "Building frontend..."
vite build

# Build the serverless API
echo "Building serverless API..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully"