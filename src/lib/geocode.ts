// -----------------------------------------------------------------------
// MOCK GEOCODER — prototype only.
//
// FR-07 requires that an address typed by an admin is automatically turned
// into a map location. A real implementation would call a geocoding API
// (e.g. Google/Mapbox/OpenStreetMap Nominatim) from the backend. This
// prototype has no backend, so it simulates that lookup against a small
// dictionary of recognisable Australian places. Any address that contains
// one of these place names resolves to a location near it (with a small
// deterministic offset so multiple agencies in the same suburb don't stack
// exactly on top of each other). Anything else fails, mirroring BR-08.
// -----------------------------------------------------------------------

export interface GeocodeResult {
  lat: number;
  lng: number;
  matchedPlace: string;
}

interface PlaceEntry {
  aliases: string[];
  lat: number;
  lng: number;
}

const PLACES: PlaceEntry[] = [
  // Greater Melbourne / St Kilda area (NFP home region)
  { aliases: ['st kilda east', 'st. kilda east'], lat: -37.8636, lng: 145.0025 },
  { aliases: ['st kilda west'], lat: -37.868, lng: 144.976 },
  { aliases: ['st kilda'], lat: -37.8676, lng: 144.9808 },
  { aliases: ['elwood'], lat: -37.8825, lng: 144.9877 },
  { aliases: ['balaclava'], lat: -37.8695, lng: 145.0007 },
  { aliases: ['windsor'], lat: -37.8556, lng: 144.9934 },
  { aliases: ['prahran'], lat: -37.8495, lng: 144.9926 },
  { aliases: ['south yarra'], lat: -37.8386, lng: 144.9926 },
  { aliases: ['albert park'], lat: -37.8438, lng: 144.9587 },
  { aliases: ['port melbourne'], lat: -37.8351, lng: 144.9412 },
  { aliases: ['southbank'], lat: -37.8226, lng: 144.9648 },
  { aliases: ['docklands'], lat: -37.8154, lng: 144.9469 },
  { aliases: ['melbourne cbd', 'melbourne vic 3000', 'melbourne, vic'], lat: -37.8136, lng: 144.9631 },
  { aliases: ['carlton'], lat: -37.8, lng: 144.9667 },
  { aliases: ['fitzroy'], lat: -37.7986, lng: 144.9784 },
  { aliases: ['richmond'], lat: -37.8183, lng: 144.9946 },
  { aliases: ['collingwood'], lat: -37.8033, lng: 144.9881 },
  { aliases: ['footscray'], lat: -37.8007, lng: 144.9006 },
  { aliases: ['sunshine'], lat: -37.7885, lng: 144.8324 },
  { aliases: ['brunswick'], lat: -37.7669, lng: 144.9599 },
  { aliases: ['preston'], lat: -37.7402, lng: 144.9995 },
  { aliases: ['dandenong'], lat: -37.9878, lng: 145.2149 },
  { aliases: ['frankston'], lat: -38.1423, lng: 145.1215 },
  { aliases: ['geelong'], lat: -38.1499, lng: 144.3617 },
  { aliases: ['ballarat'], lat: -37.5622, lng: 143.8503 },
  { aliases: ['bendigo'], lat: -36.7570, lng: 144.2794 },
  { aliases: ['shepparton'], lat: -36.3833, lng: 145.4 },
  { aliases: ['warrnambool'], lat: -38.3818, lng: 142.4874 },

  // Other state capitals, for testing the Australia-wide view
  { aliases: ['sydney'], lat: -33.8688, lng: 151.2093 },
  { aliases: ['newcastle'], lat: -32.9283, lng: 151.7817 },
  { aliases: ['brisbane'], lat: -27.4698, lng: 153.0251 },
  { aliases: ['gold coast'], lat: -28.0167, lng: 153.4 },
  { aliases: ['perth'], lat: -31.9505, lng: 115.8605 },
  { aliases: ['adelaide'], lat: -34.9285, lng: 138.6007 },
  { aliases: ['hobart'], lat: -42.8821, lng: 147.3272 },
  { aliases: ['darwin'], lat: -12.4634, lng: 130.8456 },
  { aliases: ['canberra'], lat: -35.2809, lng: 149.13 },
];

// Deterministic pseudo-random offset (roughly -1.5km..1.5km) derived from
// the address text, so re-geocoding the same address always lands in the
// same spot, but two different addresses in the same suburb don't overlap.
function offsetFromString(input: string): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  const a = (hash % 1000) / 1000 - 0.5; // -0.5..0.5
  const b = ((hash >> 10) % 1000) / 1000 - 0.5;
  const KM_TO_DEG_LAT = 1 / 111;
  const KM_TO_DEG_LNG = 1 / 90;
  return { dLat: a * 1.5 * KM_TO_DEG_LAT, dLng: b * 1.5 * KM_TO_DEG_LNG };
}

/**
 * Simulates an address -> lat/lng geocoding API call.
 * Resolves after a short delay so the UI can show a realistic "locating…" state.
 */
export async function mockGeocodeAddress(address: string): Promise<GeocodeResult | null> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 350));

  const normalized = address.trim().toLowerCase();
  if (!normalized) return null;

  let best: { place: PlaceEntry; alias: string } | null = null;
  for (const place of PLACES) {
    for (const alias of place.aliases) {
      if (normalized.includes(alias)) {
        if (!best || alias.length > best.alias.length) {
          best = { place, alias };
        }
      }
    }
  }

  if (!best) return null;

  const { dLat, dLng } = offsetFromString(normalized);
  return {
    lat: best.place.lat + dLat,
    lng: best.place.lng + dLng,
    matchedPlace: best.alias,
  };
}
