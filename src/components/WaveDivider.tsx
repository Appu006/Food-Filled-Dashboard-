// Signature scalloped divider between color-blocked sections, inspired by
// the wave/scallop borders on foodfilled.org. Pure decoration — bumps are
// generated so it stretches cleanly at any width.
function scallopPath(bumps: number, width: number, height: number): string {
  const step = width / bumps;
  let d = `M0,${height}`;
  for (let i = 0; i < bumps; i++) {
    const x1 = i * step + step / 2;
    const x2 = (i + 1) * step;
    d += ` Q${x1},0 ${x2},${height}`;
  }
  d += ` L${width},${height + 40} L0,${height + 40} Z`;
  return d;
}

const PATH = scallopPath(24, 480, 18);

export function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 480 18" preserveAspectRatio="none" style={{ transform: flip ? 'scaleY(-1)' : undefined }}>
        <path d={PATH} fill={fill} stroke="#111111" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
