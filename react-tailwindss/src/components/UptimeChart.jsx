import { barsForService, pillFill } from "../data/uptime";

const VIEW_W = 668;
const BAR_W = 5;
const GAP = 2.34065934065934;
const N = 91;

export default function UptimeChart({ seed }) {
  const bars = barsForService(seed, N);
  return (
    <div className="text-slate-500 w-full mt-1">
      <svg
        width="100%"
        height="16"
        viewBox={`0 0 ${VIEW_W} 16`}
        preserveAspectRatio="none"
        className="mb-1 block"
        aria-hidden
      >
        {bars.map((k, i) => {
          const x = i * (BAR_W + GAP);
          return (
            <rect
              key={i}
              x={x}
              y={0}
              width={BAR_W}
              height={16}
              rx={1}
              ry={1}
              className={`transition ${pillFill[k]}`}
            />
          );
        })}
      </svg>
    </div>
  );
}
