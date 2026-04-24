# Delivery Fees Settings - Unified Key Implementation

## Overview
A new unified key `delivery_fees_settings` has been added to the settings system to handle all delivery fee configurations in a single JSON-serialized field. This allows fetching and editing delivery fees using the same settings endpoint.

## Changes Made

### 1. **Updated `fetchGeneralSettings()` Function**
- Added logic to first check for the new unified `delivery_fees_settings` key
- Falls back to individual keys (`delivery_weight_based_enabled`, `delivery_min_weight`, etc.) for backward compatibility
- Safely parses JSON data with error handling

**Key Logic:**
```javascript
if (apiData.delivery_fees_settings) {
  try {
    deliveryFeesData = JSON.parse(apiData.delivery_fees_settings);
  } catch (e) {
    // Fallback to individual keys
  }
}
```

### 2. **Updated `saveGeneralSettings()` Function**
- Now sends the new `delivery_fees_settings` key with JSON-stringified data
- Maintains individual keys for backward compatibility
- Both old and new keys are sent to the API

**New Setting Entry:**
```javascript
{ key: 'delivery_fees_settings', value: JSON.stringify(deliveryFees) }
```

## Data Structure

### Delivery Fees Settings Object
```javascript
{
  weightBased: {
    enabled: boolean,
    minimumWeight: number,
    fee: number
  },
  distanceBased: {
    enabled: boolean,
    minimumDistance: number,
    fee: number
  }
}
```

### Storage Format
In the database, it's stored as a JSON string:
```json
"{\"weightBased\":{\"enabled\":true,\"minimumWeight\":5,\"fee\":10},\"distanceBased\":{\"enabled\":false,\"minimumDistance\":1,\"fee\":0}}"
```

## API Endpoints

### Fetch Settings
**Endpoint:** `GET /api/admin/settings`

**Response includes:**
```json
{
  "success": true,
  "data": {
    "delivery_fees_settings": "{...JSON...}",
    "delivery_weight_based_enabled": "true",
    "delivery_min_weight": "5",
    ...
  }
}
```

### Save Settings
**Endpoint:** `POST /api/admin/settings`

**Request body (array):**
```json
[
  {
    "key": "delivery_fees_settings",
    "value": "{\"weightBased\":{...},\"distanceBased\":{...}}"
  },
  {
    "key": "delivery_weight_based_enabled",
    "value": "true"
  },
  ...
]
```

## Backward Compatibility

The implementation maintains full backward compatibility:
- Old individual keys are still fetched and processed
- Old individual keys are still saved to the database
- If `delivery_fees_settings` doesn't exist, the component falls back to individual keys
- Both old and new keys are sent during save operations

## Benefits

1. **Cleaner Data Model:** One key instead of 6 separate keys
2. **Easier to Manage:** All delivery fee settings are grouped together
3. **Better Scalability:** Easy to add new delivery fee types in the future
4. **Unified Editing:** Edit all delivery fees in one place
5. **Backward Compatible:** Works with existing database and API implementations

## Component Integration

The AdminSettings component automatically handles:
- Fetching delivery fees from the unified key
- Parsing and displaying in the UI
- Saving changes back to the unified key
- Maintaining backward compatibility with old keys

No additional changes needed in child components or other parts of the application.
