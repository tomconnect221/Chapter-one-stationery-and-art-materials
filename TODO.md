# Multi-Color Support for AdminProducts - Implementation Steps

## Plan Overview
✅ Plan approved: Add multi-color support (max 10 colors) with nice chips UI in add/edit forms. Send as `colors[]` array to backend.

## Steps (to be marked as completed)

### Step 1: Update index.jsx - State & API Logic ✅
- Rename `color` → `colors: []` in state init (handleAdd/handleEdit).
- Update fetchProducts mapping for backward compat: `colors: Array.isArray(product.colors) ? product.colors : product.color ? [product.color] : []`.
- handleSave: Loop `selectedProduct.colors.forEach(c => formData.append('colors[]', c))`; remove single color append.
- Update ProductForm prop: `colors={selectedProduct.colors}` , `onColorsChange={(colors) => setSelectedProduct({...selectedProduct, colors})}`.
- Clear `formErrors.color`.

### Step 2: Update ProductForm.jsx - Multi-Color UI ✅
- Add `colors`, `onColorsChange` props.
- Replace single color row with chips list + add button.
- Color picker modal: color input + hex text + add button (validate hex format).
- Chip: color swatch + hex code + remove X.
- Enforce max 10 colors; disable add if reached.
- Inline styles for chips/picker to match pf- theme.

### Step 3: Update ProductView.jsx - Multi-Color Display ✅
- Update specs color section: Show multiple swatches + comma-separated list.
- Fallback to single if string.

### Step 4: Test Implementation [PENDING]
- Add product with 3+ colors, edit, view list/ProductView.
- Verify FormData sends `colors[]=...`.
- Test max 10 limit.
- Run `npm run dev`.

### Step 5: Cleanup & Complete [PENDING]
- Update table/list previews if needed.
- Mark all steps ✅.
- attempt_completion.

**Current Progress: 0/5 steps completed**

