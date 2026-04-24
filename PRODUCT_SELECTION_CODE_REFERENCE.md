# Product Selection Feature - Code Reference Guide

## Quick Implementation Summary

### Files Modified/Created

1. **NEW**: `src/components/AdminSettings/ProductSelector.jsx`
   - Standalone reusable component for product selection
   - ~260 lines of React code
   - Uses axios for API calls
   - Toast notifications for user feedback

2. **MODIFIED**: `src/components/AdminSettings/index.jsx`
   - Added import for ProductSelector
   - Extended adForm state to include selectedProducts array
   - Updated fetchAds() to map products from API response
   - Updated addAd() to include product_ids in FormData
   - Updated updateAd() to include product_ids in FormData
   - Updated editAd() to load selectedProducts when editing
   - Updated resetAdForm() to clear selectedProducts
   - Integrated ProductSelector component in renderAdForm()

## Code Examples

### 1. ProductSelector Component Usage

```jsx
import ProductSelector from './ProductSelector';

// Inside your form component
<ProductSelector
  token={token}                    // Auth token from Redux store
  selectedProducts={adForm.selectedProducts}  // Array of selected products
  onProductsChange={(products) => 
    setAdForm(prev => ({ ...prev, selectedProducts: products }))
  }
  apiUrl={import.meta.env.VITE_API_URL}  // Base API URL
/>
```

### 2. Adding Product IDs to FormData

```javascript
// In addAd() or updateAd() function
const formData = new FormData();

// ... add other fields ...
formData.append('title', adForm.title);
formData.append('description', adForm.description);
formData.append('position', adForm.position);
formData.append('priority', adForm.priority.toString());

// Add product IDs dynamically
adForm.selectedProducts.forEach((product, index) => {
  formData.append(`product_ids[${index}]`, product.id);
});

// Send to API
const response = await axios.post(url, formData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 3. Updating State with Selected Products

```javascript
// Update adForm with products
setAdForm(prev => ({ 
  ...prev, 
  selectedProducts: products 
}));

// Get selectedProducts from adForm
const productIds = adForm.selectedProducts.map(p => p.id);
console.log('Selected Product IDs:', productIds);
// Output: ['019bae7c-60c7-7042-800c-e5b4e1fb951a', '019bac5c-8bc7-7178-96ee-99b2b25dfa65']
```

### 4. Fetching Products in ProductSelector

```javascript
const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${apiUrl}/api/admin/products`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      // response.data.data.data contains the products array
      setProducts(response.data.data.data || []);
    }
  } catch (error) {
    toast.error('Failed to fetch products');
    console.error('Fetch products error:', error);
  } finally {
    setLoading(false);
  }
};
```

### 5. Filtering Products (No Duplicates)

```javascript
// Filter products shown in dropdown
const filteredProducts = products.filter(product =>
  // 1. Check if product is NOT already selected (duplicate prevention)
  !selectedProducts.some(p => p.id === product.id) &&
  // 2. Check if product matches search term
  (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
);

// Result: Only shows products not yet selected, filtered by search
```

### 6. Adding Product with Duplicate Check

```javascript
const handleAddProduct = (product) => {
  // Check if product already exists
  if (selectedProducts.some(p => p.id === product.id)) {
    toast.warning(`${product.name} is already added`);
    return;  // Don't add it
  }

  // Add new product to selected products
  onProductsChange([...selectedProducts, {
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: product.price,
    image: product.image
  }]);

  setSearchTerm('');
  setShowDropdown(false);
  toast.success(`${product.name} added to ad`);
};
```

### 7. Removing Product

```javascript
const handleRemoveProduct = (productId) => {
  // Filter out the product from selectedProducts
  onProductsChange(selectedProducts.filter(p => p.id !== productId));
  toast.info('Product removed from ad');
};
```

### 8. Fetching Ads with Products

```javascript
const fetchAds = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/admin/ads`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      const adsData = response.data.data.data.map(ad => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        // ... other fields ...
        // NEW: Map products from API response
        products: (ad.products || []).map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.image
        }))
      }));
      
      setSettings(prev => ({ ...prev, ads: adsData }));
    }
  } catch (error) {
    console.error('Failed to fetch ads:', error);
  }
};
```

### 9. Loading Products when Editing

```javascript
const editAd = (ad) => {
  setEditingAd(ad);
  setAdForm({
    title: ad.title || '',
    description: ad.description || '',
    // ... other fields ...
    // Load existing products when editing
    selectedProducts: ad.products || []
  });
  setAdImagePreview(ad.image || '');
  setShowAdForm(true);
};
```

## API Integration Details

### Request: Create Ad with Products

```javascript
// Method: POST
// URL: /api/admin/ads
// Headers: Authorization: Bearer <token>

FormData {
  "title": "Summer Sale",
  "description": "<p>50% off selected items</p>",
  "type": "image",
  "position": "banner",
  "priority": "1",
  "starts_at": "2025-06-01",
  "ends_at": "2025-06-30",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "media_file": <binary>,
  "status": "active",
  "product_ids[0]": "019bae7c-60c7-7042-800c-e5b4e1fb951a",
  "product_ids[1]": "019bac5c-8bc7-7178-96ee-99b2b25dfa65",
  "product_ids[2]": "019bac55-9fa8-72c1-a4ad-8f66acbec340"
}
```

### Response: Create Ad Success

```json
{
  "success": true,
  "message": "Ad created successfully",
  "data": {
    "id": "019c89e6-d484-7182-b903-332251d75eab",
    "title": "Summer Sale",
    "description": "<p>50% off selected items</p>",
    "type": "image",
    "media_url": "ads/images/ad_1771840132_699c228437131.png",
    "position": "banner",
    "status": "active",
    "priority": 1,
    "starts_at": "2025-06-01T00:00:00.000000Z",
    "ends_at": "2025-06-30T00:00:00.000000Z",
    "created_at": "2026-02-23T09:48:52.000000Z",
    "products": [
      {
        "id": "019bae7c-60c7-7042-800c-e5b4e1fb951a",
        "name": "Canvas",
        "sku": "Canvas",
        "price": "3000.00",
        "image": "/storage/products/ddf9ed73-70d3-475c-af36-07a6ee337c9d.jpg"
      },
      {
        "id": "019bac5c-8bc7-7178-96ee-99b2b25dfa65",
        "name": "Derwent Graphic Charcoal Pencils (Set of 6)",
        "sku": "Derwent Graphic Charcoal Pencils (Set of 6)",
        "price": "7000.00",
        "image": "/storage/products/e9927277-034a-4662-bb3b-460c1b0a85a8.jpg"
      },
      {
        "id": "019bac55-9fa8-72c1-a4ad-8f66acbec340",
        "name": "Da Vinci Kolinsky Sable, Series 10 Maestro Round Brush",
        "sku": "Da Vinci Kolinsky Sable, Series 10 Maestro Round Brush",
        "price": "600.00",
        "image": "/storage/products/3d7f4e8c-f981-4ee6-b355-254328d526d4.jpg"
      }
    ]
  }
}
```

### Request: Update Ad with New Products

```javascript
// Method: POST
// URL: /api/admin/ads/{id}
// Headers: Authorization: Bearer <token>

FormData {
  "title": "Summer Sale - Updated",
  "description": "<p>60% off selected items</p>",
  "type": "image",
  "position": "banner",
  "priority": "2",
  "starts_at": "2025-06-01",
  "ends_at": "2025-07-31",
  "thumbnail_url": "https://example.com/thumbnail-new.jpg",
  "_method": "POST",
  
  // Product IDs (can be completely different set)
  "product_ids[0]": "019bac5c-8bc7-7178-96ee-99b2b25dfa65",
  "product_ids[1]": "019ba3f0-6097-7325-8e6f-40fc1c5baa24"
  // Note: First product removed, new product added
}
```

## Toast Notifications Used

```javascript
// Success
toast.success('Ad created successfully');
toast.success(`${product.name} added to ad`);
toast.success('Ad updated successfully');

// Error
toast.error('Failed to fetch products');
toast.error('Please fix the validation errors');
toast.error('Failed to create ad');
toast.error('Failed to update ad');

// Warning
toast.warning(`${product.name} is already added`);

// Info
toast.info('Product removed from ad');
```

## State Flow Example

### Initial State (New Ad)
```javascript
adForm = {
  title: '',
  description: '',
  position: 'banner',
  priority: 1,
  starts_at: '',
  ends_at: '',
  thumbnail_url: '',
  selectedProducts: []  // Empty array
}
```

### After Adding 2 Products
```javascript
adForm = {
  // ... same fields ...
  selectedProducts: [
    {
      id: '019bae7c-60c7-7042-800c-e5b4e1fb951a',
      name: 'Canvas',
      sku: 'Canvas',
      price: '3000.00',
      image: '/storage/products/ddf9ed73-70d3-475c-af36-07a6ee337c9d.jpg'
    },
    {
      id: '019bac5c-8bc7-7178-96ee-99b2b25dfa65',
      name: 'Derwent Graphic Charcoal Pencils (Set of 6)',
      sku: 'Derwent Graphic Charcoal Pencils (Set of 6)',
      price: '7000.00',
      image: '/storage/products/e9927277-034a-4662-bb3b-460c1b0a85a8.jpg'
    }
  ]
}
```

### After Removing 1 Product
```javascript
adForm = {
  // ... same fields ...
  selectedProducts: [
    {
      id: '019bae7c-60c7-7042-800c-e5b4e1fb951a',
      name: 'Canvas',
      sku: 'Canvas',
      price: '3000.00',
      image: '/storage/products/ddf9ed73-70d3-475c-af36-07a6ee337c9d.jpg'
    }
    // Derwent product removed
  ]
}
```

## Error Handling Example

```javascript
const addAd = async () => {
  if (!validateAdForm()) {
    toast.error('Please fix the validation errors');
    return;
  }

  try {
    setSaving(true);
    // ... build formData ...
    
    const response = await axios.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      await fetchAds();
      resetAdForm();  // Also clears selectedProducts
      toast.success('Ad created successfully');
    }
  } catch (error) {
    if (error.response?.status === 422) {
      // Server validation errors
      const serverErrors = error.response.data.errors;
      setFormErrors(serverErrors);
      
      Object.keys(serverErrors).forEach(field => {
        toast.error(`${field}: ${serverErrors[field][0]}`);
      });
    } else {
      // Other errors
      toast.error('Failed to create ad');
      console.error('Add ad error:', error);
    }
  } finally {
    setSaving(false);
  }
};
```

## Performance Optimization Notes

1. **Lazy Loading**: Products are only fetched when dropdown is opened
2. **Filtering**: Dropdown filters client-side (no new API calls during search)
3. **No Duplicate Calls**: Same product list used for entire session
4. **Image Loading**: Fallback error handling if product images fail to load
5. **Max Height Dropdown**: Prevents long product lists from taking up too much space

## Browser DevTools Testing

### Check Network Requests
```
Network Tab → Filter by "api/admin/products"
- Method: GET
- Status: 200
- Response: { success: true, data: { data: [...] } }
```

### Check Redux Store (if applicable)
```
DevTools → Check token is properly set
- auth.token should be available for requests
```

### Check Component State
```
React DevTools → AdminSettings Component
- adForm.selectedProducts should update when products added/removed
- properties: id, name, sku, price, image
```

## Debugging Tips

```javascript
// Log selected products
console.log('Selected Products:', adForm.selectedProducts);

// Log FormData contents (for debugging)
for (let pair of formData.entries()) {
  console.log(pair[0] + ': ' + pair[1]);
}

// Check if duplicate detection works
const isDuplicate = adForm.selectedProducts.some(p => p.id === productId);
console.log('Is Duplicate:', isDuplicate);

// Verify product IDs being sent
adForm.selectedProducts.forEach((product, index) => {
  console.log(`product_ids[${index}]: ${product.id}`);
});
```

## Common Issues & Solutions

### Issue: Products not loading in dropdown
**Solution**: 
- Verify token is valid
- Check API endpoint is correct
- Check network tab for 401/403 errors
- Ensure user has permission to view products

### Issue: Duplicate products appearing
**Solution**:
- Check filtering logic in ProductSelector
- Verify selectedProducts array is updating correctly
- Check if product IDs match exactly

### Issue: Selected products not sending to API
**Solution**:
- Verify FormData is being built correctly
- Check console for FormData contents
- Ensure parseInt/toString conversions are correct
- Check API endpoint accepts product_ids parameter

### Issue: Products not loading when editing
**Solution**:
- Verify fetchAds() maps products from API response
- Check editAd() function loads ad.products
- Verify ad.products exists in API response
