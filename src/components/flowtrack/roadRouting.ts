import { LatLngTuple } from "leaflet";

const roadRouteCache = new Map<string, LatLngTuple[]>();

function routeCacheKey(waypoints: LatLngTuple[]) {
  return waypoints.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join("|");
}

export async function getRoadRoute(waypoints: LatLngTuple[]): Promise<LatLngTuple[]> {
  if (waypoints.length < 2) {
    return waypoints;
  }

  const cacheKey = routeCacheKey(waypoints);
  const cached = roadRouteCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const coordinates = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return waypoints;
    }

    const data = await response.json();
    const geometry = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(geometry) || geometry.length < 2) {
      return waypoints;
    }

    const snappedRoute = geometry.map((point: [number, number]) => [point[1], point[0]] as LatLngTuple);
    roadRouteCache.set(cacheKey, snappedRoute);
    return snappedRoute;
  } catch {
    return waypoints;
  }
}
