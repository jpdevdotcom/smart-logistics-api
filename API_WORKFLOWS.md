# Smart Logistics API — How It Works

This document explains the API using simple, real-world flows. Use it alongside Postman collections for hands-on testing.

---

## Base URLs

Local:
```
http://localhost:3000/api/v1
```

Production:
```
https://smart-logistics-api-cb2c.onrender.com/api/v1
```

---

## Flow 1: Add Inventory

**Goal:** Put stock into a warehouse while enforcing storage rules and capacity.

**Endpoint**
```
POST /inventory/add
```

**Request body**
```json
{
  "warehouseId": 1,
  "itemId": 1,
  "quantity": 10
}
```

**What happens**
- Validates the request body.
- Confirms warehouse and item exist.
- Blocks cold items in standard warehouses.
- Blocks if capacity would be exceeded.
- Creates or increments inventory.

---

## Flow 2: Transfer Inventory

**Goal:** Move stock from one warehouse to another safely.

**Endpoint**
```
POST /inventory/transfer
```

**Request body**
```json
{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "itemId": 1,
  "sku": "ABC-12345-X",
  "quantity": 5
}
```

**What happens**
- Runs in a single database transaction (all-or-nothing).
- Ensures source stock is enough.
- Ensures destination has capacity.
- Enforces cold/standard compatibility.
- Validates the SKU matches the item (ghost stock protection).

---

## Flow 3: Inventory Report (Paginated)

**Goal:** Get a warehouse summary with occupancy and item details.

**Endpoint**
```
GET /inventory/report?page=1&limit=10
```

**What you get**
- Each warehouse with `total_capacity`, `current_occupancy`, and `percent_full`.
- A list of items in that warehouse.
- `lowStock` flag for quantities below 10.

---

## Flow 4: Lookup by ID or SKU

**Goal:** Retrieve a single record.

**Endpoints**
```
GET /inventory/:id
GET /items/:id
GET /items/sku/:sku
GET /warehouses/:id
```

Use these for detail screens or validation checks.

---

## Flow 5: Delete Warehouse (Soft Delete)

**Goal:** Remove a warehouse only if it is empty.

**Endpoint**
```
DELETE /warehouses/:id
```

**What happens**
- Verifies the warehouse exists.
- Checks that inventory is empty.
- Marks the warehouse as deleted.

---

## Error Shape

All errors follow the same structure (status code varies by scenario):
```json
{
  "error": "ERROR_CODE",
  "message": "Readable explanation",
  "code": 400
}
```

---

If you want a Postman example set for each flow, tell me and I will add it.
