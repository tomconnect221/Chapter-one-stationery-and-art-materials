# Rider Dashboard Data Fetching Implementation

## Overview
The rider dashboard has been updated to fetch real orders assigned to the rider from the backend API. This document outlines the implementation and how to use it.

## Files Created/Modified

### 1. New Hook: `src/hooks/useRiderOrders.js`
A custom React hook that handles all order-related operations for riders.

**Features:**
- Fetch all orders assigned to the rider
- Filter orders by status (pending, in_progress, completed, etc.)
- Pagination support
- Order status updates
- Real-time statistics (completed, pending, in progress, failed orders)
- Total earnings calculation

**Usage:**
```jsx
import useRiderOrders from '../hooks/useRiderOrders';

const MyComponent = () => {
  const { 
    orders,           // Array of order objects
    loading,          // Boolean - loading state
    error,            // String - error message if any
    stats,            // Object with totalOrders, earnings, etc.
    pagination,       // Pagination info (currentPage, lastPage, etc.)
    updateOrderStatus, // Function to update order status
    getOrderStats,    // Function to get order statistics
    handlePageChange, // Function to handle pagination
    refetch           // Function to manually refetch orders
  } = useRiderOrders({ 
    status: 'pending',  // Optional: filter by status
    page: 1,            // Optional: page number
    limit: 10,          // Optional: items per page
    sortBy: 'created_at' // Optional: sort field
  });
};
```

**Hook Returns:**
```javascript
{
  orders: Array,              // Orders array with full details
  loading: Boolean,           // Fetching state
  error: String|null,         // Error message
  stats: {
    totalOrders: Number,
    pendingOrders: Number,
    inProgressOrders: Number,
    completedOrders: Number,
    totalEarnings: Number
  },
  pagination: {
    currentPage: Number,
    lastPage: Number,
    perPage: Number,
    total: Number
  },
  handlePageChange: Function,
  updateOrderStatus: Function,
  getOrdersByStatus: Function,
  getOrderStats: Function,
  refetch: Function,
  setOrders: Function
}
```

### 2. Updated Component: `src/pages/Dashboard/riderPage/RiderDashboard/index.jsx`
The rider dashboard component now:
- Uses the `useRiderOrders` hook to fetch data
- Displays real order data instead of mock data
- Implements status filtering with reactive updates
- Shows loading, error, and empty states
- Includes pagination controls
- Displays real earnings and order metrics
- Supports order status updates with buttons

**Key Features Implemented:**
1. **Dynamic Stats Cards** - Shows actual order counts and earnings
2. **Status Filtering** - Filter orders by pending, in-progress, completed
3. **Order Cards** - Display full order information with customer details
4. **Action Buttons** - Start/complete deliveries with status updates
5. **Pagination** - Navigate through multiple pages of orders
6. **Real-time Updates** - Stats update when orders are fetched or status changed

## API Endpoints Required

The following backend endpoints are expected:

### 1. Fetch Rider Orders
```
GET /api/rider/orders?status={status}&page={page}&limit={limit}&sort_by={sortBy}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    {
      "id": 1,
      "order_number": "ORD-001",
      "customer_name": "John Doe",
      "delivery_address": "123 Main St",
      "total_amount": 5000,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  },
  "stats": {
    "totalOrders": 50,
    "pendingOrders": 5,
    "inProgressOrders": 3,
    "completedOrders": 42,
    "totalEarnings": 250000
  }
}
```

### 2. Update Order Status
```
PUT /api/rider/orders/{orderId}/status
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "in_progress",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

## Implementation Details

### Order Status Flow
The system supports the following order statuses:
- `pending` - Order assigned to rider, awaiting action
- `in_progress` - Delivery in progress
- `completed` - Delivery completed
- `failed` - Delivery failed
- `cancelled` - Order cancelled

### Data Fetching Strategy
1. **Initial Load** - Automatically fetches orders when component mounts
2. **Filter Change** - Refetches orders when status filter changes
3. **Pagination** - Fetches new page when page number changes
4. **Status Update** - Automatically refetches to get fresh data

### Error Handling
- Network errors display an error alert to the user
- Failed API requests log errors to console
- User-friendly error messages guide the rider
- Errors don't prevent the UI from rendering

### Loading States
- Loading spinner displays while fetching
- Empty state message when no orders exist
- Error message when API calls fail

## Component State Management

```jsx
const [filterStatus, setFilterStatus] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
```

- `filterStatus` - Current status filter (null = all statuses)
- `currentPage` - Current pagination page

## Button Actions

**Start Delivery** (for pending/assigned orders):
```jsx
onClick={() => updateOrderStatus(delivery.id, 'in_progress')}
```

**Complete Delivery** (for in-progress orders):
```jsx
onClick={() => updateOrderStatus(delivery.id, 'completed')}
```

## Usage Example

```jsx
import DispatchDashboard from './pages/Dashboard/riderPage/RiderDashboard';

function App() {
  return <DispatchDashboard />;
}
```

## Testing

To test the implementation:
1. Ensure your backend API is running
2. Set the `VITE_API_URL` environment variable
3. The rider must be authenticated (token in localStorage)
4. Orders assigned to the rider will display automatically

## Future Enhancements

- Add real-time updates with WebSocket
- Implement Google Maps integration
- Add delivery proof/signature capture
- Track delivery time metrics
- Add customer communication features
- Implement earnings reports and analytics
