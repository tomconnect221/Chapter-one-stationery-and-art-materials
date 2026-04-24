/**
 * Google Places API utility for address autocomplete and geocoding
 * Uses Google Places API v1 endpoints for text search and place details
 */

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Search for addresses using Google Places Text Search API
 * @param {string} query - The search query (address or place name)
 * @returns {Promise<Array>} Array of place suggestions
 */
export const searchAddresses = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: "en"
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.places) {
      return [];
    }

    // Format the response to match expected structure
    return data.places.map(place => ({
      id: place.id,
      displayName: place.displayName?.text || "",
      formattedAddress: place.formattedAddress || "",
      display_name: place.formattedAddress || place.displayName?.text || ""
    }));
  } catch (error) {
    console.error("Address search error:", error);
    return [];
  }
};

/**
 * Get detailed information about a place including coordinates
 * @param {string} placeId - The Google Place ID
 * @returns {Promise<Object>} Place details including location coordinates and address components
 */
export const getPlaceDetails = async (placeId) => {
  if (!placeId || !GOOGLE_PLACES_API_KEY) {
    console.error("Place ID or API key missing");
    return null;
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,location,addressComponents&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      displayName: data.displayName?.text || "",
      formattedAddress: data.formattedAddress || "",
      latitude: data.location?.latitude,
      longitude: data.location?.longitude,
      addressComponents: data.addressComponents || [],
      // Parse address components for easy access
      parsedComponents: parseAddressComponents(data.addressComponents || [])
    };
  } catch (error) {
    console.error("Get place details error:", error);
    return null;
  }
};

/**
 * Parse address components from Google Places API response
 * @param {Array} components - Google Places address components array
 * @returns {Object} Parsed address components
 */
const parseAddressComponents = (components) => {
  const parsed = {
    street_number: "",
    route: "",
    locality: "",
    administrative_area_level_1: "",
    postal_code: "",
    country: ""
  };

  components.forEach(component => {
    const types = component.types || [];
    
    if (types.includes("street_number")) {
      parsed.street_number = component.shortText || "";
    } else if (types.includes("route")) {
      parsed.route = component.longText || "";
    } else if (types.includes("locality")) {
      parsed.locality = component.longText || "";
    } else if (types.includes("administrative_area_level_1")) {
      parsed.administrative_area_level_1 = component.shortText || "";
    } else if (types.includes("postal_code")) {
      parsed.postal_code = component.shortText || "";
    } else if (types.includes("country")) {
      parsed.country = component.longText || "";
    }
  });

  return parsed;
};

/**
 * Extract city, state, and postal code from place details
 * @param {Object} placeDetails - Place details from getPlaceDetails
 * @returns {Object} Extracted address parts {city, state, postal_code}
 */
export const extractAddressParts = (placeDetails) => {
  if (!placeDetails || !placeDetails.parsedComponents) {
    return { city: "", state: "", postal_code: "" };
  }

  const { parsedComponents } = placeDetails;

  return {
    city: parsedComponents.locality || "",
    state: parsedComponents.administrative_area_level_1 || "",
    postal_code: parsedComponents.postal_code || ""
  };
};
