// New Geoapify Routing API wrapper
// GET /v1/routing?waypoints=lat1,lng1|lat2,lng2&mode=drive&apiKey=...

const API_KEY = '349ee85cf1884643a5258ee8c15c8f5b';
const distanceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const calculateDriveDistance = async (branchLat, branchLng, customerLat, customerLng) => {
  const key = `${branchLat.toFixed(5)},${branchLng.toFixed(5)}-${customerLat.toFixed(5)},${customerLng.toFixed(5)}`;
  
  const cached = distanceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.distance;
  }

  try {
    const waypoints = `${branchLat.toFixed(6)},${branchLng.toFixed(6)}|${customerLat.toFixed(6)},${customerLng.toFixed(6)}`;
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const distance = data.features?.[0]?.properties?.distance || 0; // meters → convert to km
    const distanceKm = distance / 1000;

    distanceCache.set(key, { distance: distanceKm, timestamp: Date.now() });
    return distanceKm;
  } catch (error) {
    console.warn('Routing API failed:', error);
    throw error;
  }
};

