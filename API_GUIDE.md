# Smart Logistics API — Quick Guide

This guide explains how the API works in plain language with simple examples.

---

## 1) Core Concepts

**Warehouse**
- A storage location with a maximum capacity.
- Types: `STANDARD` or `COLD_STORAGE`.

**Item**
- A product with a SKU and a storage requirement.
- Requirements: `STANDARD` or `COLD`.

**Inventory**
- The quantity of an item stored in a warehouse.
- One record per item + warehouse pair.

---

## 2) Business Rules (In Simple Terms)

- Cold items **cannot** go into Standard warehouses.
- You can’t add or transfer stock if it **exceeds capacity**.
- Transfers are **atomic**: either everything moves or nothing moves.
- Transfers must match the **SKU** to prevent ghost stock.
- Warehouses can only be deleted if **empty**.

---

## 3) Base URL

Local:
```
http://localhost:3000/api/v1
```

Production:
```
https://smart-logistics-api-cb2c.onrender.com/api/v1
```

---

## 4) Common Workflows

### A) Add stock to a warehouse
**Request**
```
POST /inventory/add
```
**Body**
```json
{
  "warehouseId": 1,
  "itemId": 1,
  "quantity": 5
}
```

**What happens**
- Checks if warehouse and item exist.
- Ensures cold items aren’t placed in standard storage.
- Ensures capacity isn’t exceeded.
- Updates inventory quantity.

---

### B) Transfer stock between warehouses
**Request**
```
POST /inventory/transfer
```
**Body**
```json
{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "itemId": 1,
  "sku": "ABC-12345-X",
  "quantity": 3
}
```

**What happens**
- Ensures source has enough stock.
- Ensures destination has capacity.
- Ensures cold/standard rules are respected.
- Ensures SKU matches the item (ghost stock prevention).
- Moves stock in a single transaction.

---

### C) Get inventory report (paginated)
**Request**
```
GET /inventory/report?page=1&limit=10
```

**What you get**
- Warehouse summaries
- Current occupancy and percent full
- Items list with `lowStock` flag

---

### D) Get a single record
**Warehouse**
```
GET /warehouses/:id
```

**Item**
```
GET /items/:id
```

**Item by SKU**
```
GET /items/sku/:sku
```

**Inventory**
```
GET /inventory/:id
```

---

### E) Delete a warehouse (soft delete)
```
DELETE /warehouses/:id
```

**Rule**
- Only works if the warehouse has **no inventory**.
- Otherwise returns an error.

---

## 5) Example Error Response

```json
{
  "error": "INSUFFICIENT_CAPACITY",
  "message": "Destination warehouse capacity exceeded.",
  "code": 422
}
```

---

## 6) Quick Testing Checklist

✅ Add stock to a standard warehouse  
✅ Try adding a cold item to standard (should fail)  
✅ Transfer with insufficient stock (should fail)  
✅ Transfer exceeding capacity (should fail)  
✅ Delete a warehouse with inventory (should fail)  
✅ Get report with pagination (works)

---

If you want this expanded with diagrams or Postman examples, tell me and I’ll add them.
