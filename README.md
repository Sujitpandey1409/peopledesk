# PeopleDesk

A small employee directory for keeping names, work emails, and job roles in one place. Built with React, TypeScript, Express, and PostgreSQL.

## What it does

- Add, view, edit, and delete employee records.
- Search employees by name.
- Validate required fields and email addresses.
- Show clear loading, empty, and error states.
- Store employee records in PostgreSQL.

## Stack

- **Client:** React, TypeScript, Vite, Axios
- **API:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL with `pg`

## Project layout

```text
client/
  src/
    api/                 API requests
    components/          Employee form and directory table
    types/               Shared employee types
server/
  database/              PostgreSQL schema
  src/
    config/              Database connection and health check
    middleware/          Shared API error handling
    routes/              Employee endpoints
```

## Run locally

### Requirements

- Node.js and npm
- PostgreSQL

### 1. Create the database and table

Create the database in `psql`:

```sql
CREATE DATABASE peopledesk;
```

If the database already exists, skip the CREATE DATABASE command. From the repository root, apply the schema:

```bash
psql -U postgres -d peopledesk -f server/database/schema.sql
```

The schema uses `CREATE TABLE IF NOT EXISTS`, so it can be run again without creating a duplicate table.

### 2. Configure the API

Copy `server/.env.example` to `server/.env`, then set `DATABASE_URL` to your local PostgreSQL connection. The example also sets the API port and the local client origin.

### 3. Start the API

```bash
cd server
npm install
npm run dev
```

The API runs on port `5000` by default. Check `http://localhost:5000/health` to confirm it is running.

### 4. Start the client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite. The client uses `http://localhost:5000` by default; set `VITE_API_URL` when the API runs elsewhere.

## Deployment

For a reusable Render deployment checklist, environment-variable guide, verification steps, and platform notes, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/employees` | List employees |
| `POST` | `/employees` | Add an employee |
| `PUT` | `/employees/:id` | Update an employee |
| `DELETE` | `/employees/:id` | Remove an employee |
| `GET` | `/health` | Check the API |

Invalid input returns `400`, duplicate email addresses return `409`, and missing employee IDs return `404`.