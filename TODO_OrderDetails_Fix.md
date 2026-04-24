# OrderDetails Modal Integration - Make View Button Open Modal

Status: [NOT STARTED] ⏳

## Approved Plan Implementation Steps:

### 1. [✅] Update AdminOrders/index.jsx - Reverted to page navigation
### 2. [✅] Route to OrderDetails page component

- Add state: `showDetailsModal`, `selectedOrder`
- Update `handleViewDetails(order)`: `setShowDetailsModal(true); setSelectedOrder(order);`
- Import OrderDetails: `import OrderDetails from './OrderDetails';`
- Add useSelector for token: `const { token } = useSelector((state) => state.auth);`
- Render modal conditionally: `{showDetailsModal && <OrderDetails orderId={selectedOrder.id} userType={userType} token={token} onClose={() => setShowDetailsModal(false)} />}`

### 2. [ ] Polish OrderDetails.jsx (optional)
- Add prop validation if needed
- Ensure console logs for debug

### 3. [ ] Test
- Go to admin orders
- Click view 👁️ → Modal opens with order details
- Close modal → Back to list
- Verify data loads (check console)

### 4. [ ] Cleanup
- Remove navigate route if unused
- Update TODO_AdminOrderDetails.md if switching back to modal

Run `npm run dev` after each step. Mark [✅] as complete.
