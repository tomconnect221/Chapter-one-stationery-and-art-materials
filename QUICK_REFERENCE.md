# Quick Reference - Rider Dashboard Data Fetching

## 🎯 What Was Implemented

✅ **Custom Hook** - `useRiderOrders.js` for managing rider order data
✅ **Dashboard Update** - Real data fetching instead of mock data
✅ **Filtering** - Filter orders by status
✅ **Pagination** - Navigate through order pages
✅ **Status Updates** - Change order status with button clicks
✅ **Statistics** - Real-time order and earnings stats
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Visual feedback during data fetch

## 📁 Files Created/Modified

| File | Purpose |
|------|---------|
| `src/hooks/useRiderOrders.js` | ⭐ NEW - Custom hook for order management |
| `src/pages/Dashboard/riderPage/RiderDashboard/index.jsx` | UPDATED - Now uses real data |
| `RIDER_DASHBOARD_IMPLEMENTATION.md` | Documentation and usage guide |
| `BACKEND_API_REFERENCE.md` | Backend implementation examples |
| `IMPLEMENTATION_SUMMARY.md` | Complete overview and troubleshooting |
| `QUICK_REFERENCE.md` | This file |

## 🚀 Quick Start

### 1. Import the Hook
```jsx
import useRiderOrders from '../hooks/useRiderOrders';
```

### 2. Use in Component
```jsx
const { orders, loading, error } = useRiderOrders({ page: 1 });
```

### 3. Access Data
```jsx
orders.map(order => (
  <div key={order.id}>
    {order.customer_name} - {order.delivery_address}
  </div>
))
```

## 🔌 API Endpoints Needed

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/rider/orders` | Fetch assigned orders |
| PUT | `/api/rider/orders/{id}/status` | Update order status |

## 📊 Hook Return Values

```javascript
const {
  orders,                // Order objects array
  loading,              // true while fetching
  error,                // error message or null
  stats,                // { totalOrders, pendingOrders, ... }
  pagination,           // { currentPage, lastPage, ... }
  updateOrderStatus,    // async function
  getOrderStats,        // calculate stats
  handlePageChange,     // change page
  refetch               // manual refetch
} = useRiderOrders({ status, page, limit });
```

## 🎛️ Hook Options

```javascript
useRiderOrders({
  status: 'pending',      // Filter by status (optional)
  page: 1,                // Current page (default: 1)
  limit: 10,              // Items per page (default: 10)
  sortBy: 'created_at'    // Sort field (default: 'created_at')
})
```

## 📦 Order Object Properties

```javascript
{
  id: Number,
  order_number: String,
  customer_name: String,
  delivery_address: String,
  total_amount: Number,
  status: String,           // pending, in_progress, completed, failed
  created_at: String        // ISO datetime
}
```

## 🔄 Order Status Flow

```
pending → in_progress → completed
                     ↓
                    failed
                     ↓
                  cancelled
```

## 💾 State Management

Component uses local state for:
- `filterStatus` - Current status filter
- `currentPage` - Current pagination page

Hook manages:
- Orders data
- Loading state
- Error state
- Pagination info
- Statistics

## 🎯 Function Usage Examples

### Update Order Status
```jsx
await updateOrderStatus(orderId, 'in_progress');
// Automatically refetches orders
```

### Get Stats from Orders
```jsx
const stats = getOrderStats();
// Returns: { total, pending, inProgress, completed, failed }
```

### Change Page
```jsx
handlePageChange(2);  // Go to page 2
```

### Manual Refetch
```jsx
refetch();  // Fetch orders again
```

## ⚡ Dashboard Features Implemented

| Feature | Status |
|---------|--------|
| Fetch assigned orders | ✅ |
| Filter by status | ✅ |
| Pagination | ✅ |
| Update order status | ✅ |
| Show loading state | ✅ |
| Show error state | ✅ |
| Show empty state | ✅ |
| Display stats | ✅ |
| Real-time earnings | ✅ |
| Action buttons | ✅ |

## 🔐 Authentication

Uses existing auth system:
- Token from `localStorage`
- User ID from Redux store
- Automatic header injection via `apiClient`

No additional auth config needed!

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No orders show | Check API endpoint exists |
| Loading spinner stuck | Check browser console for errors |
| Buttons don't work | Verify PUT endpoint is set up |
| Auth errors | Check token is in localStorage |
| CORS errors | Check API CORS configuration |

## 📱 Dashboard Layout

```
┌─────────────────────────────────────┐
│         Page Header                 │
├─────────────────────────────────────┤
│    Stats Cards (4 cards)            │
├─────────────────────────────────────┤
│   Filters: All | Pending | ...      │
├─────────────────────────────────────┤
│   Order Cards (3 per row)           │
│   ┌──────────┐ ┌──────────┐        │
│   │ Order 1  │ │ Order 2  │ ...    │
│   └──────────┘ └──────────┘        │
├─────────────────────────────────────┤
│  Pagination: Previous | Page X | Next│
├─────────────────────────────────────┤
│   Map Section | Performance Section │
└─────────────────────────────────────┘
```

## 🎨 Order Card Elements

- Order ID
- Customer Name
- Delivery Address
- Time (formatted)
- Amount (formatted as currency)
- Status Badge
- Action Buttons (Start/Complete/Details)
- Navigation Button

## 📈 Statistics Displayed

1. **Total Deliveries** - Count of all assigned orders
2. **Earnings** - Total delivery fees + today's earnings
3. **In Progress** - Count of active deliveries
4. **Pending** - Count of pending deliveries

Plus Performance Metrics:
- Completed Today
- In Progress Count
- Pending Count
- Total Earnings

## 🔍 Data Transformation

Raw API data is automatically:
- ✅ Formatted with currency symbols (₦)
- ✅ Dates formatted to readable time
- ✅ Status text formatted (replace underscore, capitalize)
- ✅ Null values handled with defaults
- ✅ Numbers localized with thousand separators

## 📞 Need to Implement?

Backend endpoints required:

### GET /api/rider/orders
Returns all orders for authenticated rider
- Query params: status, page, limit, sort_by
- Response includes: data, meta (pagination), stats

### PUT /api/rider/orders/{id}/status
Update single order status
- Body: { "status": "in_progress" }
- Response: updated order data

See `BACKEND_API_REFERENCE.md` for full implementation guides!

## ✅ Testing Checklist

- [ ] Backend API endpoints are implemented
- [ ] VITE_API_URL env variable is set
- [ ] User is logged in
- [ ] Orders exist for this rider
- [ ] Status filtering works
- [ ] Pagination loads different pages
- [ ] Status update buttons work
- [ ] Error handling displays messages
- [ ] Loading spinner appears during fetch
- [ ] Currency formatting displays correctly

---

**Last Updated:** November 14, 2025
**Version:** 1.0
**Status:** Ready for testing ✅
