# Smart Logistics API

Inventory and warehouse management API with strict business rules, atomic transfers, cold-storage enforcement, and paginated reporting.

---

## Documentation

- `API_GUIDE.md` — Quick guide and examples
- `API_WORKFLOWS.md` — How the API works (end-to-end flows)

---

## Business Rules

- **Cold storage** — Cold items cannot be stored in or transferred to Standard warehouses.
- **Atomic transfers** — Transfers are all-or-nothing; any failure leaves stock untouched.
- **Ghost stock prevention** — SKU mismatch between source inventory and transfer request is caught and rejected.
- **Input validation** — All request bodies are validated via Zod schemas before hitting the database.
- **Paginated reports** — `/inventory/report` accepts `page` and `limit` query params.
- **Safe deletion** — Warehouses can only be deleted when empty; non-empty returns `422`.

---

## Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Language         | TypeScript                     |
| Runtime          | Node.js 20+                    |
| ORM              | Prisma                         |
| Validation       | Zod                            |
| Database         | PostgreSQL (Supabase or local) |
| Package Manager  | npm                            |
| Containerization | Docker                         |
| Unit Test        | Vitest                         |
| Hosting          | Render                         |

---

## Requirements

| Dependency | Version           |
| ---------- | ----------------- |
| Node.js    | 20+               |
| npm        | bundled with Node |
| PostgreSQL | Supabase or local |

---

## Hosted API

The API is deployed on Render and publicly accessible at:

```
https://smart-logistics-api-cb2c.onrender.com
```

---

## Postman Documentation

| Environment | Base URL                                        | Docs                                                       |
| ----------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Local       | `http://localhost:3000`                         | https://documenter.getpostman.com/view/29373209/2sBXikoWmf |
| Production  | `https://smart-logistics-api-cb2c.onrender.com` | https://documenter.getpostman.com/view/29373209/2sBXikoWvW |

---

## Environment

Create two `.env` files at the project root:

**.env.development**

```env
DATABASE_URL=postgresql://user:pass@host:5432/postgres
```

**.env.production**

```env
DATABASE_URL=postgresql://user:pass@host:5432/postgres
```

### Database Setup

You have two options for the database:

#### Option A — Use the provided Supabase instance (recommended for local dev)

A shared Supabase instance is available for local development. The `DATABASE_URL` has been sent to you via email — just paste it into your `.env.development` file.

#### Option B — Create your own Supabase instance

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection String** and select **Session Pooler**
3. Copy the connection string and set it as your `DATABASE_URL`
4. Open the **SQL Editor** in your Supabase dashboard and run the following to create a dedicated Prisma user:

```sql
create user "prisma" with password 'your_strong_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
grant pg_signal_backend to prisma;
```

5. Update your `DATABASE_URL` to use the `prisma` user credentials:

```env
DATABASE_URL=postgresql://prisma:your_strong_password@your-supabase-host:5432/postgres
```

---

## Install

```bash
npm install
```

---

## Development

### Prisma

```bash
# Generate client
npm run prisma:dev -- generate

# Run migrations
npm run prisma:dev -- migrate dev

# Seed database (destructive — wipes and repopulates)
npm run prisma:seed

# Open Prisma Studio at localhost:5555
npm run prisma:dev -- studio -- --port 5555
```

### Running the Server

There are two ways to run the API locally. **Docker Compose is recommended.**

#### Option A — Docker Compose (Recommended)

Docker Compose is the preferred way to run this project locally. It handles the environment, networking, and container lifecycle in one command — no need to manually pass env vars or manage ports.

```bash
docker compose up -d --build
```

> Server runs at `http://localhost:3000`

#### Option B — Run directly with Node

Use this only if you prefer not to use Docker or are debugging outside of a container. Requires Node.js 20+ and a running PostgreSQL instance configured in `.env.development`.

```bash
npm run start:dev
```

> Server runs at `http://localhost:3000`

---

## Production

### Prisma

```bash
# Deploy migrations
npm run prisma:prod -- migrate deploy

# Generate client
npm run prisma:prod -- generate

# Open Prisma Studio — use with caution (live data)
npm run prisma:prod -- studio -- --port 5555
```

### Run

```bash
npm run build
npm run start:prod
```

---

## Tests

```bash
npm test
```

### Test Coverage

#### POST /inventory/add

| Scenario                        | Status |
| ------------------------------- | ------ |
| Success                         | 200    |
| Cold Item in Standard Warehouse | 400    |
| Capacity Exceeded               | 400    |
| Invalid Body                    | 400    |
| Warehouse and Item Not Found    | 404    |
| Item Not Found                  | 404    |
| Warehouse Not Found             | 404    |

#### POST /inventory/transfer

| Scenario                        | Status |
| ------------------------------- | ------ |
| Success                         | 200    |
| Insufficient Stock              | 400    |
| Destination Capacity Exceeded   | 400    |
| Cold Item to Standard Warehouse | 400    |
| SKU Mismatch (Ghost Stock)      | 400    |
| Invalid Body                    | 400    |
| Source Warehouse Not Found      | 404    |
| Destination Warehouse Not Found | 404    |
| Item Not Found                  | 404    |

#### GET /inventory/report

| Scenario | Status |
| -------- | ------ |
| Success  | 200    |

#### GET /inventory/:id, /items/:id, /items/sku/:sku, /warehouses/:id

| Scenario                        | Status |
| ------------------------------- | ------ |
| Get Item By ID — Success        | 200    |
| Get Item By ID — Not Found      | 404    |
| Get Item By SKU — Success       | 200    |
| Get Item By SKU — Not Found     | 404    |
| Get Warehouse By ID — Success   | 200    |
| Get Warehouse By ID — Not Found | 404    |
| Get Inventory By ID — Success   | 200    |
| Get Inventory By ID — Not Found | 404    |

#### DELETE /warehouses/:id

| Scenario                  | Status |
| ------------------------- | ------ |
| Success (Empty Warehouse) | 200    |
| Inventory Not Empty       | 422    |
| Not Found                 | 404    |
| Invalid ID                | 422    |

---

## API Endpoints

Base path: `/api/v1`

| Environment | Base URL                                               |
| ----------- | ------------------------------------------------------ |
| Local       | `http://localhost:3000/api/v1`                         |
| Production  | `https://smart-logistics-api-cb2c.onrender.com/api/v1` |

### Inventory

| Method | Path                                | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| `POST` | `/inventory/add`                    | Add stock to a warehouse           |
| `POST` | `/inventory/transfer`               | Atomic transfer between warehouses |
| `GET`  | `/inventory/report?page=1&limit=20` | Paginated inventory report         |
| `GET`  | `/inventory/:id`                    | Get inventory record by ID         |

### Items

| Method | Path              | Description     |
| ------ | ----------------- | --------------- |
| `GET`  | `/items/:id`      | Get item by ID  |
| `GET`  | `/items/sku/:sku` | Get item by SKU |

### Warehouses

| Method   | Path              | Description                 |
| -------- | ----------------- | --------------------------- |
| `GET`    | `/warehouses/:id` | Get warehouse by ID         |
| `DELETE` | `/warehouses/:id` | Soft delete — only if empty |

---

## Error Format

All validation errors are caught by Zod and returned in a consistent shape:

```json
{
  "error": "COLD_ITEM_WRONG_WAREHOUSE",
  "message": "Cold items cannot be stored in Standard warehouses.",
  "code": 422
}
```
