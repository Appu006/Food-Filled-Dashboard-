import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import type { HeatPoint } from './HeatmapLayer';

// Fixed-size pin (standard map convention — pins stay a constant on-screen
// size regardless of zoom, unlike the heat zones underneath them, which
// scale with real-world distance per BR-03).
const PIN_ICON = L.divIcon({
  className: '',
  html: `
    <svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 1.5C7.1 1.5 2 6.9 2 13.4c0 8.3 11 20 11.4 20.5.3.3.9.3 1.2 0C15 33.4 26 21.7 26 13.4 26 6.9 20.9 1.5 14 1.5z"
            fill="#fe9f4b" stroke="#14140f" stroke-width="2.2" stroke-linejoin="round" />
      <circle cx="14" cy="13.5" r="5" fill="#ffffff" stroke="#14140f" stroke-width="1.6" />
    </svg>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  tooltipAnchor: [0, -30],
});

export function AgencyPinsLayer({ points }: { points: HeatPoint[] }) {
  return (
    <>
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={PIN_ICON}>
          <Tooltip direction="top" offset={[0, -2]}>
            <span className="font-semibold">{p.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
