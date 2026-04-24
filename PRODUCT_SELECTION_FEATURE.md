# Admin Ads - Product Selection Feature

## Overview
This feature enables admins to add products to advertisements, establishing a relationship between ads and products. When an ad is created or updated with selected products, those products are associated with the ad via the `product_ids` parameter sent to the backend API.

## Features Implemented

### 1. **Product Selector Component** (`ProductSelector.jsx`)
A reusable, user-friendly component that provides:

#### Search Functionality
- **Real-time product search** by product name or SKU
- Dropdown list that filters as you type
- Shows product image, name, SKU, and price in the dropdown

#### Product Selection
- Click on any product in the dropdown to add it to the ad
- Selected products display with a visual badge/card showing:
  - Product image
  - Product name (with ellipsis for long names)
  - Product price

#### Duplicate Prevention
- **Automatically prevents duplicate products** - if a product is already selected, it cannot be added again
- Toast notification warns users: "Product is already added"
- Only unselected products appear in the dropdown

#### Product Removal
- **Remove button** on each selected product card for easy deletion
- Toast notification confirms removal

#### Visual Indicators
- Count of selected products displayed
- Info message showing duplicate prevention
- Warning state if no products are added yet

### 2. **Updated AdminSettings Component**

#### State Management
```javascript
adForm: {
  title: '',
  description: '',
  position: 'banner',
  priority: 1,
  starts_at: '',
  ends_at: '',
  thumbnail_url: '',
  selectedProducts: [] // NEW: Array of selected product objects
}
```

#### API Integration
- **Fetching Products**: Via ProductSelector component
  - Endpoint: `GET /api/admin/products`
  - Returns paginated list of all products

- **Creating Ads with Products**:
  - Endpoint: `POST /api/admin/ads`
  - Payload includes `product_ids[0]`, `product_ids[1]`, etc.
  - Example: 
    ```
    product_ids[0]: "019bae7c-60c7-7042-800c-e5b4e1fb951a"
    product_ids[1]: "019bac5c-8bc7-7178-96ee-99b2b25dfa65"
    ```

- **Updating Ads with Products**:
  - Endpoint: `POST /api/admin/ads/{id}`
  - Same payload structure as creation
  - Supports updating product associations without changing other ad fields

- **Fetching Ads with Products**:
  - Endpoint: `GET /api/admin/ads`
  - Response includes `products` array with all associated products
  - Products are loaded when editing an ad

## How to Use

### Adding an Ad with Products

1. **Navigate to Admin Settings** → Ads tab
2. **Click "Add New Advertisement"** button
3. **Fill in basic ad details**:
   - Title
   - Description
   - Position (Banner, Sidebar, Footer, Popup)
   - Priority (number)
   - Start/End Dates
   - Image Upload
   - Link URL (thumbnail_url)

4. **Add Products**:
   - Scroll to "Add Products to Ad" section
   - Click the search input
   - Type product name or SKU
   - Select products from dropdown
   - Products appear as cards below the search input

5. **Remove Products** (if needed):
   - Click "Remove" button on any product card

6. **Save the Ad**:
   - Click "Add Advertisement" button
   - All selected products are automatically sent to the API

### Editing an Ad with Products

1. **Navigate to Admin Settings** → Ads tab
2. **Click Edit icon** on any existing ad
3. **ProductSelector component** will:
   - Display all currently selected products
   - Allow adding new products
   - Allow removing existing products
4. **Save changes** with "Update Advertisement" button

## API Payload Structure

### Create Ad with Products
```javascript
FormData {
  title: "First Ads",
  description: "This is the first ads",
  type: "image",
  position: "banner",
  priority: "1",
  starts_at: "2025-10-22",
  ends_at: "2025-10-31",
  thumbnail_url: "https://...",
  media_file: <File>,
  status: "active",
  product_ids[0]: "019bae7c-60c7-7042-800c-e5b4e1fb951a",
  product_ids[1]: "019bac5c-8bc7-7178-96ee-99b2b25dfa65"
}
```

### Expected API Response
```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": {
    "id": "019c89e6-d484-7182-b903-332251d75eab",
    "title": "First Ads",
    "products": [
      {
        "id": "019bac5c-8bc7-7178-96ee-99b2b25dfa65",
        "name": "Derwent Graphic Charcoal Pencils (Set of 6)",
        "price": "7000.00",
        "image": "/storage/products/e9927277-034a-4662-bb3b-460c1b0a85a8.jpg"
      },
      {
        "id": "019bae7c-60c7-7042-800c-e5b4e1fb951a",
        "name": "Canvas",
        "price": "3000.00",
        "image": "/storage/products/ddf9ed73-70d3-475c-af36-07a6ee337c9d.jpg"
      }
    ]
  }
}
```

## File Structure

```
src/components/AdminSettings/
├── index.jsx (Updated)
│   ├── Imports ProductSelector component
│   ├── Updated adForm state with selectedProducts
│   ├── Updated fetchAds() to map products array
│   ├── Updated addAd() to send product_ids
│   ├── Updated updateAd() to send product_ids
│   ├── Updated editAd() to load selected products
│   ├── Updated resetAdForm() to clear selectedProducts
│   └── Integrated ProductSelector in renderAdForm()
│
└── ProductSelector.jsx (New Component)
    ├── Product fetching from API
    ├── Search/filter functionality
    ├── Dropdown UI with product details
    ├── Selected products display
    ├── Remove product functionality
    └── Duplicate prevention logic
```

## Key Features Breakdown

### 1. **No Duplicate Products**
```javascript
// In ProductSelector component:
const filteredProducts = products.filter(product =>
  !selectedProducts.some(p => p.id === product.id) && // Prevents duplicates
  (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
);

// Also validates when adding:
if (selectedProducts.some(p => p.id === product.id)) {
  toast.warning(`${product.name} is already added`);
  return;
}
```

### 2. **User-Friendly Interface**
- **Dropdown search**: Filters 15+ products as you type
- **Product preview cards**: Shows image, name, SKU, price
- **Clear selection UI**: Blue badges for selected products
- **Toast notifications**: Real-time feedback for all actions
- **Empty states**: Helpful messages when no products found or selected

### 3. **Error Handling**
- Server validation errors are caught and displayed
- User-friendly toast messages for all operations
- Form validation prevents submission with errors

## Component Props

### ProductSelector Component
```typescript
interface ProductSelectorProps {
  token: string;                    // Auth token
  selectedProducts: Product[];      // Array of selected products
  onProductsChange: (products: Product[]) => void;  // Callback on selection
  apiUrl: string;                  // Base API URL
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  image: string;
}
```

## Testing the Feature

### Test Case 1: Add Single Product to Ad
1. Create new ad
2. Search for "Canvas"
3. Select "Canvas" product
4. Save ad
5. Verify product appears in API response

### Test Case 2: Add Multiple Products
1. Create new ad
2. Add "Canvas", "Da Vinci Brush", and "Pencils"
3. Verify all 3 products are selected
4. Save ad
5. Check all product_ids are sent correctly

### Test Case 3: Prevent Duplicates
1. Create new ad
2. Add "Canvas" product
3. Try to add "Canvas" again
4. Verify warning toast appears
5. Verify "Canvas" doesn't appear in dropdown

### Test Case 4: Edit Ad with Products
1. Create ad with 2 products
2. Open ad for editing
3. Verify both products are loaded
4. Remove one product
5. Save changes
6. Verify only 1 product remains

### Test Case 5: Remove Products
1. Create ad with 3 products
2. Click Remove on middle product
3. Verify product is removed
4. Verify removed product can now be added again

## Browser Compatibility
- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design

## Performance Notes
- Products are lazy-loaded only when dropdown is opened
- Dropdown has max-height with overflow scroll for large product lists
- Images are loaded from CDN with fallback error handling
- No duplicate API calls for product fetching per session

## Future Enhancements
1. Batch product selection with checkboxes
2. Product categories filter
3. Product availability filtering (in stock only)
4. Product sorting options (by price, name, etc.)
5. Quick add buttons for featured/bestselling products
6. Product quantity management if needed
7. Product notes/variant selection
