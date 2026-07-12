# FarmFlo – Smart Farm Integrated Management System

A full-stack smart farm management platform for dairy, goat, and poultry operations.

## Tech Stack

- **Frontend:** React 18, Vite, Bootstrap 5, Chart.js
- **Backend:** Node.js, Express, Sequelize
- **Database:** MySQL

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

**Option A – SQL file:**
```bash
mysql -u root -p < database/schema.sql
```

**Option B – Sequelize init (creates tables + seed data):**
```bash
cd server
# Set DB_PASSWORD in .env first
npm run init-db
```

### 2. Backend

```bash
cd server
cp ../.env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Default Login

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@farmflo.com  | Admin@123 |
| User  | user@farmflo.com   | User@123  |

## Features

- JWT authentication with role-based access (Admin / User)
- Farm, Cow, Goat, Poultry management
- Feed inventory, Milk & Egg production tracking
- Health records, Vaccinations, Breeding management
- Sales, Customers, Expenses, Income
- Dashboard with charts and analytics
- Reports (PDF, Excel, CSV, Print)
- AI-powered predictions and recommendations
- Smart notifications and activity logs
- Database backup/restore (Admin)
- Dark/Light theme

## Environment Variables

See `.env.example` for all configuration options.

## API

Backend runs on http://localhost:5000  
Health check: `GET /api/health`
