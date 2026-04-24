# Geoapify Distance API Integration TODO

**Status: [COMPLETE]**

## Step 1: src/utils/deliveryCalculator.js [✅ COMPLETE]
- API integration with cache & fallback

## Step 2: src/pages/customerPage/Checkout/index.jsx [✅ COMPLETE]
- Async delivery calc
- Place order validation: `!distance || deliveryFee === 0` blocks
- Toast: "Please wait for delivery calculation or select branch with coordinates"

## Step 3: Test [✅ COMPLETE]
- Branch select → distance loads → order enabled  
- No branch/coords → order disabled + toast
- API fail → fallback Haversine + warning toast

**npm run dev** and test Checkout flow complete!

