import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HeatmapLayer, type HeatPoint } from './HeatmapLayer';
import { IMPACT_RADIUS_KM } from '../lib/calculations';
import { Info } from 'lucide-react';

type ViewMode = 'australia' | 'victoria';

const VIEW_LABELS: Record<ViewMode, string> = { australia: 'Australia', victoria: 'Victoria' };

// Fallback framing used when there's no data to fit bounds to yet.
const AUSTRALIA_FALLBACK: [number, number][] = [
  [-10.5, 113],
  [-43.8, 154],
];
const VICTORIA_FALLBACK: [number, number][] = [
  [-39.2, 140.9],
  [-33.9, 150.0],
];

// Rough Victoria bounding box, used to decide which agencies count as
// "in Victoria" for the zoomed-in view (US-07). The same underlying data
// as the Australia view — just a different scope/zoom (see Dependencies).
function isInVictoria(p: HeatPoint) {
  return p.lat <= -33.9 && p.lat >= -39.2 && p.lng >= 140.9 && p.lng <= 150.0;
}

const LEGEND = [
  { label: 'No activity yet', swatch: 'rgba(100,116,110,0.15)', dashed: true },
  { label: 'Low impact', swatch: 'rgb(255,208,111)' },
  { label: 'Moderate impact', swatch: 'rgb(247,148,51)' },
  { label: 'High impact', swatch: 'rgb(224,84,43)' },
  { label: 'Very high impact', swatch: 'rgb(163,28,28)' },
];

function FlyToView({ view, points }: { view: ViewMode; points: HeatPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const relevant = view === 'victoria' ? points.filter(isInVictoria) : points;
    const fallback = view === 'victoria' ? VICTORIA_FALLBACK : AUSTRALIA_FALLBACK;
    const latLngs: [number, number][] = relevant.length ? relevant.map((p) => [p.lat, p.lng]) : fallback;
    const bounds = L.latLngBounds(latLngs);
    map.flyToBounds(bounds, {
      padding: [56, 56],
      maxZoom: view === 'victoria' ? 13 : 6,
      duration: 0.9,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, map]);
  return null;
}

export function HeatMapView({ points, compact = false }: { points: HeatPoint[]; compact?: boolean }) {
  const [view, setView] = useState<ViewMode>('victoria');
  const [hovered, setHovered] = useState<HeatPoint | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 bg-emerald-50/60 px-4 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-emerald-950">Impact heatmap</h2>
          <p className="text-xs text-emerald-800/70">
            Zone intensity = share of each agency's monthly food supply that came from this NFP.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-emerald-700/30 text-sm">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                view === key ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {VIEW_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative ${compact ? 'h-[360px]' : 'h-[520px]'} w-full`}>
        <MapContainer
          center={[-25.2744, 133.7751]}
          zoom={4}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          {/* Standard keyless OSM tiles — no watermark or degraded labels,
              unlike CARTO's anonymous basemap endpoint. Attribution below
              is required by OSM's tile usage policy, not optional branding.
              A production build should move to a paid/self-hosted tile
              provider rather than relying on OSM's free demo tile server. */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
            maxZoom={19}
          />
          <HeatmapLayer points={points} radiusKm={IMPACT_RADIUS_KM} onHover={setHovered} />
          <FlyToView view={view} points={points} />
        </MapContainer>

        {hovered && (
          <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[220px] rounded-lg border border-emerald-900/10 bg-white/95 px-3 py-2 shadow-lg">
            <p className="text-sm font-semibold text-emerald-950">{hovered.name}</p>
            <p className="text-xs font-medium text-emerald-700">{hovered.band}</p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-emerald-900/10 bg-white/95 px-3 py-2 shadow-lg">
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-900/70">
            <Info size={12} /> Legend
          </p>
          <div className="flex flex-col gap-1">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-emerald-950">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: item.swatch,
                    border: item.dashed ? '1px dashed rgba(100,116,110,0.7)' : undefined,
                  }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
