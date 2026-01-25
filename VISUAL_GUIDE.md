# Rider Dashboard - Implementation Visual Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RIDER DASHBOARD                          │
│                   (index.jsx)                               │
└────────────┬────────────────────────────────────┬───────────┘
             │                                    │
             ▼                                    ▼
    ┌───────────────────┐              ┌──────────────────┐
    │ useRiderOrders    │              │ Local State      │
    │ Hook              │              │ Management       │
    │                   │              │                  │
    │ - orders          │              │ - filterStatus   │
    │ - loading         │              │ - currentPage    │
    │ - error           │              └──────────────────┘
    │ - stats           │
    │ - pagination      │
    │ - updateStatus    │
    │ - getOrderStats   │
    │ - handlePageChange│
    └────────┬──────────┘
             │
             ▼
    ┌─────────────────────┐
    │   API Client        │
    │   (apiClient.js)    │
    │                     │
    │ Interceptors:       │
    │ - Auto token inject │
    │ - Error handling    │
    └────────┬────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │   Backend API Endpoints             │
    │                                     │
    │ GET /api/rider/orders               │
    │ PUT /api/rider/orders/{id}/status   │
    └─────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  User Mounts    │
│   Dashboard     │
└────────┬────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ useRiderOrders Hook         │
    │ Initializes with:           │
    │ - status: null              │
    │ - page: 1                   │
    │ - limit: 10                 │
    └────────┬────────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ API Call #1              │
    │ GET /api/rider/orders    │
    │ (Fetch initial orders)   │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Process Response         │
    │ - Store orders array     │
    │ - Calculate stats        │
    │ - Store pagination info  │
    │ - Set loading = false    │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Render Dashboard         │
    │ Display:                 │
    │ - Stats cards            │
    │ - Order cards            │
    │ - Filter buttons         │
    │ - Pagination controls    │
    └────────┬─────────────────┘
             │
    ┌────────┴─────────┬──────────────────────┐
    │                  │                      │
    ▼                  ▼                      ▼
User Clicks      User Clicks           User Clicks
Filter Button    Pagination            Action Button
    │                 │                      │
    ▼                 ▼                      ▼
setFilterStatus   setCurrentPage       updateOrderStatus()
    │                 │                      │
    └────────┬────────┴──────────────────────┘
             │
             ▼
    ┌───────────────────────────────────┐
    │ Re-fetch Orders                   │
    │ GET /api/rider/orders             │
    │ With updated filters/page/status  │
    └───────────────────────────────────┘
             │
             ▼
    ┌───────────────────────────────────┐
    │ Update Component State            │
    │ - New orders array                │
    │ - New pagination info             │
    │ - New stats                       │
    └───────────────────────────────────┘
             │
             ▼
    ┌───────────────────────────────────┐
    │ Re-render Dashboard               │
    │ Display updated orders            │
    └───────────────────────────────────┘
```

## 🎯 Component State & Props Flow

```
┌─────────────────────────────────────────────────┐
│         DispatchDashboard Component             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Local State:                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ filterStatus: null | 'pending' | ...     │  │
│  │ currentPage: 1                           │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Hook Call:                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ useRiderOrders({                         │  │
│  │   status: filterStatus,                  │  │
│  │   page: currentPage,                     │  │
│  │   limit: 10                              │  │
│  │ })                                       │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Destructured Values:                           │
│  ┌──────────────────────────────────────────┐  │
│  │ orders: Order[]                          │  │
│  │ loading: boolean                         │  │
│  │ error: string | null                     │  │
│  │ stats: StatsObject                       │  │
│  │ pagination: PaginationObject             │  │
│  │ updateOrderStatus: function              │  │
│  │ getOrderStats: function                  │  │
│  │ handlePageChange: function               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Render Output:                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ ├─ Page Header                           │  │
│  │ ├─ Stats Grid (4 cards)                  │  │
│  │ ├─ Filters + Order Cards (loading/error) │  │
│  │ ├─ Pagination Controls                   │  │
│  │ └─ Performance Metrics                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔄 Hook State Management

```
┌──────────────────────────────────────────────────────┐
│         useRiderOrders Hook Internal State           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ orders: Order[]                                      │
│ ├─ { id, customer_name, address, amount, ... }      │
│ └─ [...more orders...]                              │
│                                                      │
│ loading: boolean                                     │
│ ├─ true (during fetch)                              │
│ └─ false (fetch complete)                           │
│                                                      │
│ error: string | null                                │
│ ├─ null (no error)                                  │
│ └─ "Failed to fetch orders" (error message)         │
│                                                      │
│ stats: object                                        │
│ ├─ totalOrders: number                              │
│ ├─ pendingOrders: number                            │
│ ├─ inProgressOrders: number                         │
│ ├─ completedOrders: number                          │
│ └─ totalEarnings: number                            │
│                                                      │
│ pagination: object                                   │
│ ├─ currentPage: number                              │
│ ├─ lastPage: number                                 │
│ ├─ perPage: number                                  │
│ └─ total: number                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 📱 UI Component Hierarchy

```
DispatchDashboard
├── Dashboard Page Header
│   ├── Title: "Dispatch Dashboard"
│   └── Action Buttons (Start Shift, View Schedule)
│
├── Stats Grid (4 cards)
│   ├── Stat Card: Total Deliveries
│   ├── Stat Card: Earnings
│   ├── Stat Card: In Progress
│   └── Stat Card: Pending
│
├── Deliveries Section
│   ├── Section Header
│   │   ├── Title: "Assigned Deliveries"
│   │   └── Filter Buttons
│   │       ├── All (active by default)
│   │       ├── Pending
│   │       ├── In Progress
│   │       └── Completed
│   │
│   ├── Loading/Error/Empty State
│   │   ├── Loading Spinner (if loading)
│   │   ├── Error Alert (if error)
│   │   └── Info Alert (if no orders)
│   │
│   ├── Delivery Cards Grid (3 per row)
│   │   ├── Card 1
│   │   │   ├── Order ID
│   │   │   ├── Customer Name
│   │   │   ├── Address
│   │   │   ├── Time & Amount
│   │   │   └── Action Buttons
│   │   ├── Card 2
│   │   └── Card 3
│   │
│   └── Pagination Controls
│       ├── Previous Button
│       ├── Page Indicator
│       └── Next Button
│
└── Dispatch Overview
    ├── Map Section
    │   └── Map Placeholder
    └── Performance Metrics (4 cards)
        ├── Completed Today
        ├── In Progress Count
        ├── Pending Count
        └── Total Earnings
```

## 🔌 API Request/Response Flow

```
CLIENT REQUEST:
┌────────────────────────────────────────────┐
│ GET /api/rider/orders?                     │
│   status=pending&                          │
│   page=2&                                  │
│   limit=10&                                │
│   sort_by=created_at                       │
│                                            │
│ Headers:                                   │
│ - Authorization: Bearer {token}            │
│ - Content-Type: application/json           │
└────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│         SERVER PROCESSING                  │
│                                            │
│ 1. Authenticate user via token             │
│ 2. Get rider ID from auth                  │
│ 3. Query orders WHERE rider_id = {id}      │
│ 4. Filter WHERE status = 'pending'         │
│ 5. Sort by created_at DESC                 │
│ 6. Paginate (skip 10, take 10)             │
│ 7. Calculate stats for all rider orders    │
│ 8. Build response                          │
└────────────────────────────────────────────┘
             │
             ▼
SERVER RESPONSE:
┌────────────────────────────────────────────┐
│ {                                          │
│   "success": true,                         │
│   "message": "Orders fetched successfully",│
│   "data": [                                │
│     {                                      │
│       "id": 1,                             │
│       "order_number": "ORD-001",           │
│       "customer_name": "John Doe",         │
│       "delivery_address": "123 Main St",   │
│       "total_amount": 5000,                │
│       "status": "pending",                 │
│       "created_at": "2024-01-15T10:30:00Z" │
│     },                                     │
│     ...                                    │
│   ],                                       │
│   "meta": {                                │
│     "current_page": 2,                     │
│     "last_page": 5,                        │
│     "per_page": 10,                        │
│     "total": 50                            │
│   },                                       │
│   "stats": {                               │
│     "totalOrders": 50,                     │
│     "pendingOrders": 5,                    │
│     "inProgressOrders": 3,                 │
│     "completedOrders": 42,                 │
│     "totalEarnings": 250000                │
│   }                                        │
│ }                                          │
└────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│      CLIENT-SIDE PROCESSING                │
│                                            │
│ 1. Receive response                        │
│ 2. Validate success: true                  │
│ 3. Extract and set orders array            │
│ 4. Extract and set pagination info         │
│ 5. Extract and set stats                   │
│ 6. Update loading state to false           │
│ 7. Clear any previous errors               │
└────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│      COMPONENT RE-RENDER                   │
│                                            │
│ Display:                                   │
│ - Orders from data array                   │
│ - Page X of 5 pagination                   │
│ - Updated stats in cards                   │
│ - Enabled/disabled pagination buttons      │
└────────────────────────────────────────────┘
```

## 🚀 Order Status Update Flow

```
User Clicks "Start Delivery" Button
         │
         ▼
onClick → updateOrderStatus(orderId, 'in_progress')
         │
         ▼
┌──────────────────────────────────────┐
│ PUT /api/rider/orders/{orderId}/status
│ Body: { "status": "in_progress" }    │
│ Header: Authorization: Bearer {token}│
└──────────────────────────────────────┘
         │
         ▼
  ┌─────────────────┐
  │ Server Updates  │
  │ Order Status    │
  └────────┬────────┘
           │
           ▼
    ┌─────────────────┐
    │ Returns Updated │
    │ Order Object    │
    └────────┬────────┘
             │
             ▼
┌───────────────────────────────────┐
│ Hook Receives Response            │
│ - success: true                   │
│ - Updated order data              │
│ - Call refetch() automatically    │
└────────────┬────────────────────┘
             │
             ▼
┌───────────────────────────────────┐
│ Refetch Orders                    │
│ GET /api/rider/orders             │
└────────────┬────────────────────┘
             │
             ▼
┌───────────────────────────────────┐
│ Update State with Fresh Data      │
│ - New orders array                │
│ - Updated stats                   │
│ - Updated order statuses          │
└────────────┬────────────────────┘
             │
             ▼
┌───────────────────────────────────┐
│ Dashboard Re-renders              │
│ Shows order with 'in_progress'    │
│ status                            │
└───────────────────────────────────┘
```

## 🎨 Status Badge Styling

```
PENDING
┌──────────────────┐
│ pending          │  Yellow/warning background
│ (inactive state) │  User action required
└──────────────────┘

IN PROGRESS
┌──────────────────┐
│ in progress      │  Blue/info background
│ (active state)   │  Actively being delivered
└──────────────────┘

COMPLETED
┌──────────────────┐
│ completed        │  Green/success background
│ (finished state) │  Delivery complete
└──────────────────┘

FAILED
┌──────────────────┐
│ failed           │  Red/danger background
│ (error state)    │  Delivery failed
└──────────────────┘
```

---

**Version:** 1.0 | **Created:** November 14, 2025 | **Status:** Complete ✅
