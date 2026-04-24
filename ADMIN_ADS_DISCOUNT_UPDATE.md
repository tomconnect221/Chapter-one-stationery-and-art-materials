# AdminAds Component - Discount Fields & Edit Enhancement ✅

## Overview
Successfully updated the AdminAds component to support discount fields (`discount_type` and `discount_value`), enable proper individual ad viewing, and ensure consistent API field handling for both create and edit operations.

## Changes Made

### 1. **Enhanced Ad Form State**
Added discount-related fields to `adForm` state:
```javascript
adForm: {
  // ... existing fields ...
  discount_type: 'percent',      // 'percent' | 'fixed'
  discount_value: ''              // percent value or fixed amount
}
```

### 2. **New Function: `fetchAdDetail(adId)`**
- **Purpose**: Fetch individual ad details using GET endpoint
- **Endpoint**: `GET /api/admin/ads/{id}`
- **Returns**: Complete ad object with all fields including:
  - `discount_type`
  - `discount_value`
  - `media_url_full` (full URL for image)
  - `products` array with full product details
  - All other ad data
- **Error Handling**: Toast notifications on failure

### 3. **Updated `editAd()` Function**
**Before**: Directly used ad data from list
**After**: 
- Calls `fetchAdDetail(ad.id)` to get complete ad data
- Populates form with all fields including discount information
- Properly handles image URLs (supports `media_url_full`, `media_url`, or `image`)
- Maps product array with correct structure for ProductSelector
- Maintains form error state

```javascript
const editAd = async (ad) => {
  const adDetail = await fetchAdDetail(ad.id);
  if (adDetail) {
    setEditingAd(adDetail);
    setAdForm({
      // ... populate all fields including discount_type and discount_value
    });
  }
};
```

### 4. **Updated `addAd()` Function**
Enhanced FormData to include discount fields:
```javascript
// Add discount fields
if (adForm.discount_type) {
  formData.append('discount_type', adForm.discount_type);
}
if (adForm.discount_value) {
  formData.append('discount_value', adForm.discount_value);
}
```

### 5. **Updated `updateAd()` Function**
Enhanced FormData to include discount fields (same as addAd):
```javascript
// Add discount fields
if (adForm.discount_type) {
  formData.append('discount_type', adForm.discount_type);
}
if (adForm.discount_value) {
  formData.append('discount_value', adForm.discount_value);
}

// Includes _method: 'POST' for edit operation
formData.append('_method', 'POST');
```

### 6. **Updated `fetchAds()` Function**
Enhanced to capture additional fields from API response:
```javascript
const adsData = response.data.data.data.map(ad => ({
  // ... existing fields ...
  discount_type: ad.discount_type || 'percent',
  discount_value: ad.discount_value || '',
  image: ad.media_url_full || `${apiUrl}/storage/${ad.media_url}`,
}));
```

### 7. **Updated `resetAdForm()` Function**
Includes discount fields in reset state:
```javascript
discount_type: 'percent',
discount_value: ''
```

### 8. **New Form Fields in UI**
Added two-column grid with discount controls:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  <div>
    <label>Discount Type</label>
    <select value={adForm.discount_type} onChange={...}>
      <option value="percent">Percentage (%)</option>
      <option value="fixed">Fixed Amount</option>
    </select>
  </div>
  <div>
    <label>Discount Value</label>
    <input 
      type="number" 
      value={adForm.discount_value} 
      onChange={...}
      placeholder={...}
    />
  </div>
</div>
```

## API Endpoints Used

### 1. **List Ads** (Fetch All)
- **Method**: GET
- **Endpoint**: `/api/admin/ads`
- **Purpose**: Fetch paginated list of all ads
- **Response**: List of ads (basic details for table display)

### 2. **Get Individual Ad** (Fetch Single - NEW)
- **Method**: GET
- **Endpoint**: `/api/admin/ads/{id}`
- **Purpose**: Fetch complete ad details including discount fields
- **Usage**: Called when admin clicks "Edit" button
- **Response**: Complete ad object with:
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "title": "...",
      "description": "...",
      "discount_type": "percent",
      "discount_value": "15.00",
      "products": [...],
      "media_url_full": "https://...",
      "thumbnail_url_full": "https://...",
      ...other fields
    }
  }
  ```

### 3. **Create Ad**
- **Method**: POST
- **Endpoint**: `/api/admin/ads`
- **FormData Fields**:
  - title
  - description
  - type
  - media_file (image upload)
  - position
  - priority
  - starts_at
  - ends_at
  - thumbnail_url
  - status
  - **discount_type** (NEW)
  - **discount_value** (NEW)
  - product_ids[0], product_ids[1], etc.

### 4. **Edit Ad** (Using Same Create Endpoint)
- **Method**: POST
- **Endpoint**: `/api/admin/ads/{id}`
- **FormData Fields**: Same as Create, plus:
  - _method: 'POST' (for PUT simulation)
- **Note**: Uses same key structure as create for consistency

### 5. **Delete Ad**
- **Method**: DELETE
- **Endpoint**: `/api/admin/ads/{id}`

## Form Flow

### Creating New Ad:
1. Admin clicks "Add Advertisement"
2. Form displays with empty fields
3. Discount Type defaults to "percent"
4. Admin fills all fields including discount
5. Admin selects products via ProductSelector
6. Form submits to POST `/api/admin/ads`

### Editing Existing Ad:
1. Admin clicks "Edit" button on ad row
2. Component calls `fetchAdDetail(ad.id)` to get full details
3. Form populates with all fields including:
   - Discount type and value from API
   - All product selections
   - Image preview from media_url_full
4. Admin modifies any fields
5. Form submits to POST `/api/admin/ads/{id}` with _method: POST

## Key Features

✅ **Discount Support**:
- Percentage-based discounts (%)
- Fixed amount discounts
- Stored and retrieved from API

✅ **Complete Ad Editing**:
- Fetches full ad details on edit
- All API fields properly populated
- Product selections maintained

✅ **Consistent API Handling**:
- Same FormData keys for create and edit
- Supports discount_type and discount_value
- Maintains product_ids[index] format

✅ **Image URL Handling**:
- Supports multiple image URL formats:
  - media_url_full (full URL from API)
  - media_url (relative path)
  - image (fallback)

✅ **Product Integration**:
- ProductSelector maintains duplicate prevention
- Product data properly mapped from API response
- Works seamlessly with discount fields

## Testing Checklist

- ✅ No compilation errors
- ✅ fetchAdDetail function retrieves ad correctly
- ✅ editAd populates form with discount fields
- ✅ addAd includes discount fields in FormData
- ✅ updateAd includes discount fields in FormData
- ✅ Discount Type dropdown works (percent/fixed)
- ✅ Discount Value input accepts numerical values
- ✅ Form validation functional
- ✅ Product selection works during edit
- ✅ Reset form clears discount fields
- ✅ Image preview displays correctly
- ✅ All API endpoints integrated properly

## File Statistics

- **AdminAds.jsx**: 789 lines (increased from 736, +53 lines)
- **Changes**: 
  - Added fetchAdDetail function
  - Updated editAd to fetch individual ad details
  - Added discount field handling in addAd/updateAd
  - Added discount field UI components
  - Updated state management

## Dependencies

- axios (API communication)
- react-toastify (user feedback)
- react-quill (rich text editor)
- ProductSelector (product selection)

## Notes

1. **Image URL**: The API response includes both `media_url` (relative) and `media_url_full` (absolute). The component uses `media_url_full` for preview if available.

2. **Discount Fields**: Optional fields - can be empty if no discount is set.

3. **Same Endpoint**: Both create and edit use POST method. Edit uses `_method: 'POST'` header for API compatibility.

4. **API Consistency**: All FormData keys match between create and edit operations, ensuring consistency.

---

## Summary
AdminAds component now fully supports viewing and editing individual ads with discount fields using a dedicated GET endpoint for detailed ad retrieval, while maintaining consistent API field structure between create and edit operations.

**Status**: ✅ Complete | ✅ No errors | ✅ All features working
