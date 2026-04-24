# Product Selection Feature - Visual Guide

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN SETTINGS - ADS TAB                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Click "Add New Ad" │
                    └──────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │     AD FORM RENDERS WITH SECTIONS           │
        ├─────────────────────────────────────────────┤
        │ 1. Basic Info (Title, Position, Priority)   │
        │ 2. Dates (Start/End)                        │
        │ 3. Description (Rich Text Editor)           │
        │ 4. Image Upload                             │
        │ 5. Link URL                                 │
        │ 6. ⭐ PRODUCT SELECTOR COMPONENT ⭐         │
        │ 7. Active Checkbox                          │
        │ 8. Submit Button                            │
        └─────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   PRODUCT SELECTOR COMPONENT FLOW      │
        ├────────────────────────────────────────┤
        │ User clicks search input box           │
        │         │                              │
        │         ▼                              │
        │ Fetch products from API                │
        │ GET /api/admin/products                │
        │         │                              │
        │         ▼                              │
        │ Display dropdown with products         │
        │         │                              │
        │         ▼                              │
        │ User types to search                   │
        │ (filters by name or SKU)               │
        │         │                              │
        │         ▼                              │
        │ Click product to select                │
        │         │                              │
        │         ▼                              │
        │ ✓ Check if duplicate                   │
        │   - If duplicate: Show warning toast   │
        │   - If new: Add to selectedProducts    │
        │         │                              │
        │         ▼                              │
        │ Show product cards with Remove btn     │
        │ (repeat for each product added)        │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Fill remaining ad form fields        │
        │  (if not already filled)              │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Click "Add Advertisement" Button     │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Format FormData Payload:             │
        │  - All ad fields                      │
        │  - product_ids[0], [1], [2], etc.    │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  POST /api/admin/ads                  │
        │  (Send to Backend)                    │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Backend Validation & Creation        │
        │  - Create ad record                   │
        │  - Link products via product_ids      │
        │  - Create pivot table records         │
        └──────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  Response with ID & linked products  │
        │  Show success toast                   │
        │  Fetch & refresh ads list             │
        └──────────────────────────────────────┘
```

## Product Selector Component - Detailed View

```
┌────────────────────────────────────────────────────────────┐
│         PRODUCT SELECTOR COMPONENT (ProductSelector.jsx)   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Search Input (Searchable dropdown)                   │ │
│  │ Placeholder: "Search products by name or SKU..."     │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                │
│        ┌──────────────────┼──────────────────┐             │
│        │                  │                  │             │
│        ▼                  ▼                  ▼             │
│    ┌────────┐        ┌────────┐        ┌────────┐        │
│    │ Canvas │        │ Brush  │        │Pencils │        │
│    │SKU: XY │        │SKU: AB │        │SKU: MN │        │
│    │₦3000   │        │₦600    │        │₦7000   │        │
│    └────────┘        └────────┘        └────────┘        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Selected Products (2 items)                          │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │                                                │  │ │
│  │ │  [Image]  Canvas          ₦3000   [Remove]   │  │ │
│  │ │                                                │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ┌────────────────────────────────────────────────┐  │ │
│  │ │                                                │  │ │
│  │ │  [Image]  Brush            ₦600   [Remove]   │  │ │
│  │ │                                                │  │ │
│  │ └────────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │ ℹ️ Duplicate products cannot be added.             │ │
│  │    Each product appears only once per ad.          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Dropdown Interaction States

### State 1: Closed
```
┌──────────────────────────────────────┐
│ 🔍 Search products by name or SKU... │ ◄── Closed dropdown
└──────────────────────────────────────┘
```

### State 2: Open (No Filter)
```
┌──────────────────────────────────────┐
│ 🔍 Search products by name or SKU... │ ◄── Open dropdown
├──────────────────────────────────────┤
│ [Image] Canvas - ₦3000 - Canvas     │ ◄── Product item
├──────────────────────────────────────┤
│ [Image] Brush - ₦600 - Da Vinci     │
├──────────────────────────────────────┤
│ [Image] Pencils - ₦7000 - Derwent   │
├──────────────────────────────────────┤
│ [Image] Watercolor - ₦4000 - Senn... │
└──────────────────────────────────────┘
```

### State 3: With Search Filter
```
┌──────────────────────────────────────┐
│ 🔍 Canvas                            │ ◄── User typed "Canvas"
├──────────────────────────────────────┤
│ [Image] Canvas - ₦3000 - Canvas     │ ◄── Only matching product
└──────────────────────────────────────┘
```

### State 4: Duplicate Prevention
```
┌──────────────────────────────────────┐
│ 🔍 Canvas                            │ ◄── User typed "Canvas"
├──────────────────────────────────────┤
│ (empty - Canvas already selected)    │ ◄── So it's hidden!
└──────────────────────────────────────┘

Toast appears: "⚠️ Canvas is already added"
```

## Data Flow Diagram

```
┌────────────────────────────┐
│   Admin Interface (React)    │
│  - Create/Edit Ad Form      │
│  - ProductSelector Component │
└────────────────────────────┘
         │
         │ Fetch Products
         ▼
┌────────────────────────────┐
│    API: /api/admin/products │  ◄── Returns: List of all products
└────────────────────────────┘
         │
         │ Create/Update Ad
         ▼
┌────────────────────────────┐
│  API: /api/admin/ads        │  ◄── Send: FormData with:
│  Method: POST               │      - Ad fields
└────────────────────────────┘      - product_ids array
         │
         │ Response
         ▼
┌────────────────────────────┐
│   Ad with Linked Products   │  ◄── Returns: Ad + products array
│   - id                      │
│   - title                   │
│   - products: [             │
│     { id, name, price, ... }│
│   ]                         │
└────────────────────────────┘
         │
         │ Update UI
         ▼
┌────────────────────────────┐
│  Display Success Message    │
│  Show ad with products      │
│  on ads list                │
└────────────────────────────┘
```

## Product Card Component (Visual)

### Normal State
```
┌─────────────────────────────────────────────────┐
│  [Product Image: 40x40px]  Canvas        ₦3000  │
│                            SKU: Canvas          │
└─────────────────────────────────────────────────┘
```

### With Remove Button
```
┌──────────────────────────────────────────────────────────┐
│  [Product Image]  Canvas        ₦3000   [Remove Button]  │
│                   SKU: Canvas                             │
└──────────────────────────────────────────────────────────┘  
```

### Hover State (Dropdown Item)
```
┌──────────────────────────────────────────────────────────┐
│  [Product Image]  Canvas √         ₦3000                 │  ◄── Background highlight
│                   SKU: Canvas      (selected indicator)   │
└──────────────────────────────────────────────────────────┘
```

## State Management Structure

```
AdminSettings Component State:
├── adForm: {
│   ├── title: string
│   ├── description: string
│   ├── position: string
│   ├── priority: number
│   ├── starts_at: string
│   ├── ends_at: string
│   ├── thumbnail_url: string
│   ├── imageFile: File | null
│   ├── active: boolean
│   ├── type: string
│   └── selectedProducts: [      ◄──── NEW
│       ├── id: string
│       ├── name: string
│       ├── sku: string
│       ├── price: string
│       └── image: string
│   ]
│
├── editingAd: object | null     ◄──── Used when editing
├── showAdForm: boolean
├── formErrors: object
└── ... (other ad-related states)

ProductSelector Component Props:
├── token: string
├── selectedProducts: array (from adForm)
├── onProductsChange: callback (updates adForm)
└── apiUrl: string
```

## Error Handling Flow

```
User Action
    │
    ▼
┌─────────────────────────┐
│ Validate Form (Client)  │
└─────────────────────────┘
    │
    ├─ Has Errors ─────────────────────┐
    │                                  ▼
    │                          ┌──────────────────┐
    │                          │ Show Error Toast  │
    │                          │ Highlight Fields  │
    │                          └──────────────────┘
    │                                  
    └─ Valid ─────────────────────────┐
                                      ▼
                              ┌──────────────────┐
                              │ Send to Backend   │
                              │ POST /api/admin/ads
                              └──────────────────┘
                                      │
                                      ▼
                              ┌──────────────────┐
                              │ Server Response   │
                              └──────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
           Success (2xx)      Server Error         Validation Error
                    │         (422/5xx)            (422 with details)
                    │              │                   │
                    ▼              ▼                   ▼
              ┌──────────┐  ┌────────────┐   ┌──────────────────┐
              │ Success  │  │ Error Toast│   │ Show Field Errors│
              │ Refresh  │  │ Log Error  │   │ Toast Messages   │
              │ UI       │  │            │   │                  │
              └──────────┘  └────────────┘   └──────────────────┘
```

## Key Interactions Summary

| Action | Component | Result |
|--------|-----------|--------|
| **Click input** | ProductSelector | Fetch products, open dropdown, show all products |
| **Type "Canvas"** | ProductSelector | Filter dropdown by name/SKU match |
| **Click product** | ProductSelector | Add to selectedProducts (if not duplicate) |
| **Duplicate found** | ProductSelector | Show warning toast, don't add product |
| **Click Remove** | ProductSelector | Remove from selectedProducts array |
| **Edit existing ad** | AdminSettings | Load adForm with existing selectedProducts |
| **Submit form** | AdminSettings | Send product_ids in FormData to backend |
| **Fetch ads** | AdminSettings | API response includes products array |
