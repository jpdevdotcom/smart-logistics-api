# Smart Logistics API

Inventory and warehouse management API with strict business rules, atomic transfers, cold-storage enforcement, and paginated reporting.

## Tech Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Language         | TypeScript            |
| Runtime          | Node.js 20+           |
| ORM              | Prisma                |
| Validation       | Zod                   |
| Database         | PostgreSQL (Supabase) |
| Package Manager  | npm                   |
| Containerization | Docker                |
| Unit Test        | Vitest                |

## Requirements

| Dependency | Version           |
| ---------- | ----------------- |
| Node.js    | 20+               |
| npm        | bundled with Node |
| PostgreSQL | Supabase          |

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

### Run locally

```bash
npm run start:dev
```

### Docker Compose

```bash
# Build and Start
docker compose up -d --build
```

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

```json
{
  "error": "COLD_ITEM_WRONG_WAREHOUSE",
  "message": "Cold items cannot be stored in Standard warehouses.",
  "code": 422
}
```

---

## Business Rules

- **Cold storage** — Cold items cannot be stored in or transferred to Standard warehouses.
- **Atomic transfers** — Transfers are all-or-nothing; any failure leaves stock untouched.
- **Ghost stock prevention** — SKU mismatch between source inventory and transfer request is caught and rejected.
- **Paginated reports** — `/inventory/report` accepts `page` and `limit` query params.
- **Safe deletion** — Warehouses can only be deleted when empty; non-empty returns `422`.
