# WedPlanLive - Wedding Planning Platform

A comprehensive wedding planning application that empowers couples to strategically manage their wedding preparation through intuitive digital tools.

## Features

- Task management with priorities and statuses
- Budget tracking and expense management
- Vendor management 
- Payment tracking
- Packing lists for wedding events and honeymoon

## Tech Stack

- **Frontend**: React, TypeScript, TanStack Query, React Hook Form, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM

## Development

To run this application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/blandideas/WedPlanLive.git
   cd WedPlanLive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your PostgreSQL connection string to `DATABASE_URL`

4. Run the application:
   ```bash
   npm run dev
   ```

5. The application will be available at `http://localhost:5000`

## Deployment

### Replit Deployment

This application is deployed and hosted on Replit at: [WedPlanLive on Replit](https://wedplanlive.replit.app).

To deploy your own instance:

1. Fork this repository to your Replit account
2. Make sure your application is running correctly in development mode
3. Click the "Deploy" button in the Replit UI
4. Follow the deployment wizard to configure your deployment
5. Replit will handle building and hosting your application

### Production Build

To build the application for production:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the frontend and server:
   ```bash
   npm run build
   ```

3. Start the server using:
   ```bash
   npm start
   ```

## Database Schema

The application uses the following data models:

- Tasks: Wedding preparation tasks with title, date, priority, and status
- Vendors: Wedding service providers with contact information
- Budget: Overall wedding budget
- Expenses: Categorized wedding expenses
- Packing Lists: Lists for different events/activities 
- Packing Items: Items within packing lists
- Payments: Payments made to vendors

## Migrating the Database

To apply database migrations:

```bash
npm run db:push
```

This will create or update the database tables based on the schema defined in `shared/schema.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request