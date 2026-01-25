# Admin System Documentation

## Overview
A comprehensive e-commerce admin system with Super Admin and Sub Admin roles, complete with branch management, product inventory, order processing, and rider assignment.

## User Roles

### 1. Super Admin
- **Full System Access**: Complete control over all features
- **Branch Management**: Create, edit, delete branches
- **Sub Admin Management**: Create sub admin users and assign them to branches
- **Product Management**: Full CRUD operations across all branches
- **Order Management**: View all orders, assign to riders, change status
- **Customer Management**: View, edit, delete customer accounts
- **Inventory Control**: Manage stock across all branches
- **Categories & Brands**: Full CRUD operations

### 2. Sub Admin (Branch Manager)
- **Branch-Specific Access**: Limited to assigned branch
- **Product Management**: CRUD operations for their branch only
- **Order Management**: View and manage orders for their branch
- **Inventory Control**: Manage stock for their branch
- **View-Only**: Categories, brands (cannot edit)

### 3. Dispatch Rider
- **Delivery Management**: View assigned deliveries
- **Schedule Management**: Manage availability and shifts
- **Profile Settings**: Update personal information

## Components Created

### Admin Components

#### 1. AdminProducts (`/admin/products`)
**Features:**
- Add, edit, delete, view products
- Filter by category, status, branch
- Search functionality
- Stock level indicators
- Branch-specific filtering for sub admins
- Responsive table with product images

**Fields:**
- Product Name, SKU, Category, Brand
- Price, Stock Quantity, Branch
- Status (Active/Inactive/Out of Stock)
- Description

#### 2. AdminCategories (`/admin/categories`)
**Features:**
- Add, edit, delete categories
- Auto-generate slugs
- Product count per category
- Status management

**Fields:**
- Name, Slug, Description, Status

#### 3. AdminBrands (`/admin/brands`)
**Features:**
- Add, edit, delete brands
- Product count per brand
- Status management

**Fields:**
- Name, Slug, Description, Status

#### 4. AdminBranches (`/admin/branches`)
**Features:**
- Add, edit, delete branches
- Assign sub admin managers
- View staff and product counts
- Contact information management

**Fields:**
- Branch Name, Code, Address
- Phone, Email, Manager
- Status

#### 5. AdminSubAdmins (`/admin/subadmins`)
**Features:**
- Create sub admin accounts
- Assign to branches
- Password management
- Status control (Active/Inactive)

**Fields:**
- First Name, Last Name, Email, Phone
- Branch Assignment, Role, Status
- Password (on creation)

#### 6. AdminCustomers (`/admin/customers`)
**Features:**
- View customer accounts
- Edit customer information
- Delete accounts
- View order history and cart items
- **Cart Counter**: Shows total items in cart from Redux store

**Fields:**
- Name, Email, Phone, Address
- Orders Count, Total Spent, Cart Items
- Status, Join Date

#### 7. AdminOrders (`/admin/orders`)
**Features:**
- View all orders (super admin) or branch orders (sub admin)
- Assign orders to riders
- Change order status (dropdown)
- Filter by status, branch
- View order details modal
- Rider availability checking

**Order Statuses:**
- Pending, Processing, Shipped, Delivered, Cancelled

**Fields:**
- Order ID, Customer, Items, Total
- Branch, Assigned Rider, Status
- Payment Status, Date

#### 8. AdminInventory (`/admin/inventory`)
**Features:**
- Monitor stock levels
- Restock items
- Adjust inventory (with reason)
- Low stock alerts
- Out of stock tracking
- Branch-specific filtering

**Stock Statuses:**
- In Stock (green)
- Low Stock (yellow)
- Out of Stock (red)

**Fields:**
- Product, SKU, Branch
- Current Stock, Min Stock, Reorder Point
- Last Restocked Date

### Dashboard Features

#### Navigation Sidebar
**Admin Menu:**
- Dashboard
- Products
- Categories
- Brands
- Orders
- Customers
- Inventory
- Branches
- Sub Admins
- Profile
- Settings

**Dispatch Menu:**
- Dashboard
- My Deliveries
- Schedule
- Earnings
- Performance
- Location
- Profile
- Settings

#### Dashboard Navbar
**Features:**
- User type indicator (Super Admin/Sub Admin/Dispatch Rider)
- Branch display (for sub admins)
- Cart counter (shows total items from Redux)
- Notifications badge
- Messages badge
- User dropdown menu
- Search bar
- Responsive mobile menu

### Profile Settings (`/admin/profile`, `/dispatch/profile`)
**Features:**
- Profile picture upload (with preview)
- Personal information editing
- Password change with strength indicator
- Role and branch display
- Stats display (for riders)

## Technical Implementation

### State Management
- Redux for cart state
- Local state for component data
- Props for user type and branch filtering

### Permissions System
```javascript
const canEdit = userType === 'admin';
const userBranch = userType === 'subadmin' ? 'Lagos Main' : null;
```

### Filtering Logic
- Super Admin: See all data across all branches
- Sub Admin: See only their branch data
- Automatic filtering based on `userBranch` prop

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 992px, 1200px
- Collapsible sidebar
- Mobile-optimized tables
- Touch-friendly buttons

## Routes

### Admin Routes
```
/admin/dashboard
/admin/products
/admin/categories
/admin/brands
/admin/orders
/admin/customers
/admin/inventory
/admin/branches
/admin/subadmins
/admin/profile
/admin/settings
```

### Dispatch Routes
```
/dispatch/dashboard
/dispatch/deliveries
/dispatch/schedule
/dispatch/settings
/dispatch/profile
```

## Styling
- Consistent Jumia-inspired design
- Orange brand color (#f68b1e)
- Light theme with white cards
- Subtle shadows and borders
- Smooth transitions and hover effects

## Data Flow

### Product Management
1. Super Admin creates product → Assigns to branch
2. Sub Admin can only manage products in their branch
3. Inventory automatically updates stock status

### Order Management
1. Order created → Status: Pending
2. Admin assigns to rider → Status: Processing
3. Rider accepts → Status: Shipped
4. Delivery completed → Status: Delivered

### Branch Assignment
1. Super Admin creates branch
2. Super Admin creates sub admin
3. Super Admin assigns sub admin to branch
4. Sub admin can only access their branch data

## Key Features

### Cart Integration
- Redux store integration
- Real-time cart count in navbar
- Visible in customer management section

### User Type Display
- Navbar shows current user type
- Branch name for sub admins
- Role description in dropdown

### Professional UI/UX
- Clean, modern interface
- Intuitive navigation
- Clear visual hierarchy
- Consistent spacing and typography
- Loading states and error handling
- Confirmation dialogs for destructive actions

## Future Enhancements
- Real API integration
- Authentication system
- Real-time notifications
- Advanced analytics
- Export functionality
- Bulk operations
- Image upload for products
- Email notifications
- Activity logs
- Advanced reporting

## Usage

### For Super Admin
1. Login as super admin
2. Create branches
3. Create sub admin accounts
4. Assign sub admins to branches
5. Manage products, categories, brands
6. Monitor orders and assign to riders
7. Manage inventory across all branches

### For Sub Admin
1. Login as sub admin
2. View assigned branch
3. Manage products for branch
4. Process orders for branch
5. Manage inventory for branch
6. View customers and analytics

### For Dispatch Rider
1. Login as rider
2. View assigned deliveries
3. Manage schedule and availability
4. Update delivery status
5. Track earnings and performance

## Notes
- All components are fully responsive
- Data is currently mock data (ready for API integration)
- User permissions are enforced at component level
- Branch filtering is automatic based on user type
- Cart counter updates in real-time from Redux store