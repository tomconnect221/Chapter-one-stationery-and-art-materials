# Homeslider Update Plan - COMPLETED

## Task - COMPLETED
- ✅ Remove any cache loading from Homeslider component
- ✅ Fetch slider data fresh from endpoint (like ads)
- ✅ Remove hardcoded/demo fallback data - all should come from endpoint
- ✅ Combined slider with ads in new layout

## Changes made:
1. ✅ Removed hardcoded fallback content in error state - now returns `null`
2. ✅ Removed hardcoded fallback content in no-sliders state - now returns `null`
3. ✅ Already had cache-busting in API calls (`?_t=${timestamp}`)
4. ✅ Follows the same pattern as InContentAds
5. ✅ Created combined SliderWithAds component in homepage/index.jsx

## New Layout:
- **Laptop view (≥992px)**: Slider on LEFT (8 cols), 4 ads in column on RIGHT (4 cols)
- **Mobile view (<992px)**: All in slider carousel (sliders + ads combined)

## Files edited:
- src/pages/customerPage/homepage/Homeslider.jsx
- src/pages/customerPage/homepage/index.jsx
