/**
 * Delivery calculator using Google Maps Distance Matrix API
 * Calls the Google Maps API endpoint directly
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// In-memory cache
const distanceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate distance using Google Maps Distance Matrix API
 * Direct endpoint call to Google Maps API
 * @param {number} branchLat - Branch latitude
 * @param {number} branchLng - Branch longitude  
 * @param {number} customerLat - Customer latitude
 * @param {number} customerLng - Customer longitude
 * @returns {Promise<number>} Distance in km
 */
export const calculateDistanceGoogleMaps = async (branchLat, branchLng, customerLat, customerLng) => {
  // Parse to numbers safely
  const bLat = parseFloat(branchLat) || 0;
  const bLng = parseFloat(branchLng) || 0;
  const cLat = parseFloat(customerLat) || 0;
  const cLng = parseFloat(customerLng) || 0;

  const key = `${bLat.toFixed(5)},${bLng.toFixed(5)}-${cLat.toFixed(5)},${cLng.toFixed(5)}`;
  
  // Check cache
  const cached = distanceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.distance;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not configured');
    throw new Error('Google Maps API key not configured');
  }

  try {
    // Use Google Routes API (New API replacing Legacy Distance Matrix)
    // Documentation: https://developers.google.com/maps/documentation/routes/compute_route_directions
    const requestBody = {
      origin: {
        location: {
          latLng: { latitude: bLat, longitude: bLng }
        }
      },
      destination: {
        location: {
          latLng: { latitude: cLat, longitude: cLng }
        }
      },
      travelMode: "DRIVE"
    };

    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();

    // Check if a route was found
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found between these locations');
    }

    // Distance is returned in meters, convert to km
    const distanceInMeters = data.routes[0].distanceMeters || 0;
    const distanceInKm = distanceInMeters / 1000;

    // Cache the result
    distanceCache.set(key, { distance: distanceInKm, timestamp: Date.now() });
    return distanceInKm;
  } catch (error) {
    console.error('Google Maps Routes API error:', error.message);
    throw error;
  }
};

/**
 * Main interface - uses Google Maps Distance Matrix API
 * @returns {Promise<number>}
 */
export const calculateDistance = async (lat1, lon1, lat2, lon2) => {
  return await calculateDistanceGoogleMaps(lat1, lon1, lat2, lon2);
};

/**
 * Parse delivery fees settings from JSON string
 * @param {string} settingsJson - JSON string of delivery fees settings
 * @returns {object} Parsed settings object
 */
export const parseDeliverySettings = (settingsJson) => {
  try {
    if (!settingsJson) {
      return {
        weightBased: { enabled: false, minimumWeight: 0, fee: 0 },
        distanceBased: { enabled: false, minimumDistance: 0, fee: 0 }
      };
    }
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error parsing delivery settings:', error);
    return {
      weightBased: { enabled: false, minimumWeight: 0, fee: 0 },
      distanceBased: { enabled: false, minimumDistance: 0, fee: 0 }
    };
  }
};

/**
 * Calculate delivery fee based ONLY on weight and distance (NO base fee)
 * - Weight Fee: Applied only if weight > 0 and weight-based fee is enabled
 * - Distance Fee: Applied only if distance > 0 and distance-based fee is enabled
 * - Total Fee: Sum of applicable weight and distance fees
 * @param {object} settings - System settings
 * @param {number} totalWeight - Total weight of products in cart
 * @param {number} distance - Distance in kilometers
 * @returns {object} Calculation result with breakdown
 */
export const calculateDeliveryFee = (settings, totalWeight, distance) => {
  const deliverySettings = parseDeliverySettings(settings?.delivery_fees_settings);
  
  const weightBased = deliverySettings.weightBased || { enabled: false, minimumWeight: 0, fee: 0 };
  const distanceBased = deliverySettings.distanceBased || { enabled: false, minimumDistance: 0, fee: 0 };

  let weightFee = 0;
  let distanceFee = 0;
  let totalDeliveryFee = 0;

  // Calculate weight fee (only if weight > 0 and weight-based fee is enabled)
  if (weightBased.enabled && totalWeight > 0 && weightBased.minimumWeight > 0) {
    const weightUnits = totalWeight / weightBased.minimumWeight;
    weightFee = weightBased.fee * weightUnits;
  }

  // Calculate distance fee (only if distance > 0 and distance-based fee is enabled)
  if (distanceBased.enabled && distance > 0 && distanceBased.minimumDistance > 0) {
    const distanceUnits = distance / distanceBased.minimumDistance;
    distanceFee = distanceBased.fee * distanceUnits;
  }

  // Total fee is sum of weight and distance fees (NO base fee)
  totalDeliveryFee = weightFee + distanceFee;

  return {
    baseFee: 0, // Base fee is NOT used
    weightFee,
    distanceFee,
    totalFee: totalDeliveryFee,
    breakdown: {
      baseDeliveryFee: 0, // Base fee explicitly set to 0
      weightFee,
      distanceFee,
      weightBased: {
        enabled: weightBased.enabled && totalWeight > 0,
        minimumWeight: weightBased.minimumWeight,
        feePerUnit: weightBased.fee,
        totalWeight
      },
      distanceBased: {
        enabled: distanceBased.enabled && distance > 0,
        minimumDistance: distanceBased.minimumDistance,
        feePerUnit: distanceBased.fee,
        distance: distance.toFixed(2)
      }
    }
  };
};

/**
 * Get total weight from cart items
 * @param {array} cart - Cart items array
 * @returns {number} Total weight
 */
export const getTotalWeight = (cart) => {
  if (!cart || cart.length === 0) return 0;
  
  return cart.reduce((total, item) => {
    const weight = item.product?.weight || 
                  item.product?.product_weight || 
                  item.weight || 
                  0;
    const quantity = item.qty || item.quantity || 1;
    return total + (parseFloat(weight) * quantity);
  }, 0);
};

export default {
  calculateDistance,
  parseDeliverySettings,
  calculateDeliveryFee,
  getTotalWeight
};

