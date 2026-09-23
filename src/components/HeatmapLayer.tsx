import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export interface HeatPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  contribution: number; // 0..1+ (BR-05); >1 means over-delivered vs. estimate
  band: string; // human-readable label, e.g. "High impact" (NFR-06: not color-only)
}

interface Props {
  points: HeatPoint[];
  radiusKm: number; // BR-03: fixed 5km, but kept as a prop for clarity
  onHover?: (point: HeatPoint | null) => void;
}

// Colour ramp for zone intensity, built around the FoodFilled brand purple
// (#b558f3, sampled from the provided swatch, sits at the "high" stop).
// Still varies in lightness as well as hue (pale lilac -> violet -> deep
// plum) so meaning doesn't rely on hue alone — supports NFR-06 alongside
// the text legend and hover labels. Values are SNAPPED to the nearest stop
// (see colorForValue) rather than interpolated, for a blocky, banded look
// instead of a smooth gradient.
export const HEAT_STOPS: Array<{ v: number; rgb: [number, number, number] }> = [
  { v: 0, rgb: [247, 240, 253] },
  { v: 0.2, rgb: [224, 195, 250] },
  { v: 0.4, rgb: [199, 140, 247] },
  { v: 0.6, rgb: [181, 88, 243] },
  { v: 0.8, rgb: [138, 43, 199] },
  { v: 1, rgb: [88, 24, 130] },
];

function colorForValue(v: number): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, v));
  let nearest = HEAT_STOPS[0];
  let bestDist = Infinity;
  for (const stop of HEAT_STOPS) {
    const d = Math.abs(stop.v - clamped);
    if (d < bestDist) {
      bestDist = d;
      nearest = stop;
    }
  }
  const alpha = Math.round(20 + clamped * 150); // fade in from ~8% to ~67% opacity, so map labels stay legible underneath
  return [nearest.rgb[0], nearest.rgb[1], nearest.rgb[2], alpha];
}

// Grid cell size for the blocky renderer, and the minimum on-screen zone
// radius (matches the cell size so there's always at least one cell to
// paint / hover, and the hover hit-test matches what's visually drawn).
const CELL_PX = 18;

// Small equirectangular approximation — accurate enough at 5km scale.
function metersOffsetToLatLng(lat: number, lng: number, km: number, bearingDeg: number): [number, number] {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = ((km * Math.cos(rad)) / 111.32);
  const dLng = (km * Math.sin(rad)) / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lng + dLng];
}

export function HeatmapLayer({ points, radiusKm, onHover }: Props) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const canvas = L.DomUtil.create('canvas', 'food-rescue-heat-canvas') as HTMLCanvasElement;
    canvas.style.position = 'absolute';
    canvas.style.pointerEvents = 'none';
    map.getPanes().overlayPane!.appendChild(canvas);
    canvasRef.current = canvas;

    const redraw = () => {
      const size = map.getSize();
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
      canvas.width = size.x;
      canvas.height = size.y;

      const ctx = canvas.getContext('2d');
      if (!ctx || size.x <= 0 || size.y <= 0) return;
      ctx.clearRect(0, 0, size.x, size.y);

      const cell = CELL_PX; // coarse on purpose, for the blocky/banded look (not perf)
      const gridW = Math.max(1, Math.ceil(size.x / cell));
      const gridH = Math.max(1, Math.ceil(size.y / cell));
      const grid = new Float32Array(gridW * gridH);
      const zeroActivity: { cx: number; cy: number; r: number }[] = [];

      for (const p of pointsRef.current) {
        const layerPoint = map.latLngToLayerPoint([p.lat, p.lng]);
        const cx = layerPoint.x - topLeft.x;
        const cy = layerPoint.y - topLeft.y;

        const [edgeLat, edgeLng] = metersOffsetToLatLng(p.lat, p.lng, radiusKm, 90);
        const edgeLayerPoint = map.latLngToLayerPoint([edgeLat, edgeLng]);
        const edgeCanvasPoint = { x: edgeLayerPoint.x - topLeft.x, y: edgeLayerPoint.y - topLeft.y };
        const trueRadiusPx = Math.hypot(edgeCanvasPoint.x - cx, edgeCanvasPoint.y - cy);
        // Floor radius so zones stay legible when zoomed out to national scale
        // (a real 5km zone is genuinely a speck at that scale — this is a
        // deliberate UX affordance for the prototype, not a data change).
        // Floored to at least one grid cell so the blocky renderer always
        // has a cell centre to land on and paint.
        const radiusPx = Math.max(trueRadiusPx, cell);

        if (p.contribution <= 0) {
          zeroActivity.push({ cx, cy, r: radiusPx });
          continue;
        }

        if (cx + radiusPx < 0 || cx - radiusPx > size.x || cy + radiusPx < 0 || cy - radiusPx > size.y) {
          continue; // offscreen, skip
        }

        const contribution = Math.min(p.contribution, 1);
        const minGx = Math.max(0, Math.floor((cx - radiusPx) / cell));
        const maxGx = Math.min(gridW - 1, Math.ceil((cx + radiusPx) / cell));
        const minGy = Math.max(0, Math.floor((cy - radiusPx) / cell));
        const maxGy = Math.min(gridH - 1, Math.ceil((cy + radiusPx) / cell));

        for (let gy = minGy; gy <= maxGy; gy++) {
          for (let gx = minGx; gx <= maxGx; gx++) {
            const px = gx * cell + cell / 2;
            const py = gy * cell + cell / 2;
            const d = Math.hypot(px - cx, py - cy);
            if (d > radiusPx) continue;
            // BR-04: highest at centre, fading gradually to the edge
            const falloff = Math.pow(1 - d / radiusPx, 1.6);
            grid[gy * gridW + gx] += contribution * falloff;
          }
        }
      }

      // Render the blended grid (BR-11: overlaps combine intensities).
      const off = document.createElement('canvas');
      off.width = gridW;
      off.height = gridH;
      const offCtx = off.getContext('2d');
      if (offCtx) {
        const imgData = offCtx.createImageData(gridW, gridH);
        for (let i = 0; i < grid.length; i++) {
          const v = grid[i];
          if (v <= 0.001) continue;
          const [r, g, b, a] = colorForValue(v);
          imgData.data[i * 4] = r;
          imgData.data[i * 4 + 1] = g;
          imgData.data[i * 4 + 2] = b;
          imgData.data[i * 4 + 3] = a;
        }
        offCtx.putImageData(imgData, 0, 0);
        ctx.imageSmoothingEnabled = false; // blocky pixel edges, not a smooth blur
        ctx.drawImage(off, 0, 0, gridW, gridH, 0, 0, size.x, size.y);
      }

      // BR-10: zero-activity agencies still show their zone, at minimum intensity.
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(22,32,74,0.55)';
      ctx.fillStyle = 'rgba(22,32,74,0.06)';
      for (const z of zeroActivity) {
        ctx.beginPath();
        ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    };

    redraw();
    map.on('moveend zoomend resize', redraw);

    return () => {
      map.off('moveend zoomend resize', redraw);
      L.DomUtil.remove(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, radiusKm]);

  // Redraw when the underlying data changes (new delivery submitted, etc.)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    map.fire('moveend');
  }, [points, map]);

  // Simple hover detection via mousemove on the map (works over the canvas
  // since it has pointer-events: none).
  useEffect(() => {
    if (!onHover) return;
    const handler = (e: L.LeafletMouseEvent) => {
      let closest: HeatPoint | null = null;
      let closestDist = Infinity;
      for (const p of pointsRef.current) {
        const d = map.latLngToLayerPoint([p.lat, p.lng]).distanceTo(map.latLngToLayerPoint(e.latlng));
        const [edgeLat, edgeLng] = metersOffsetToLatLng(p.lat, p.lng, radiusKm, 90);
        const radiusPx = Math.max(
          map.latLngToLayerPoint([p.lat, p.lng]).distanceTo(map.latLngToLayerPoint([edgeLat, edgeLng])),
          CELL_PX,
        );
        if (d <= radiusPx && d < closestDist) {
          closest = p;
          closestDist = d;
        }
      }
      onHover(closest);
    };
    map.on('mousemove', handler);
    map.on('mouseout', () => onHover(null));
    return () => {
      map.off('mousemove', handler);
    };
  }, [map, onHover, radiusKm]);

  return null;
}
