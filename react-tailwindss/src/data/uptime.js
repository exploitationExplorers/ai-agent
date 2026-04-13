/** 生成与参考站相近的条状可用性图（91 段） */
export function barsForService(seed, length = 91) {
  const bars = [];
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const r = s % 1000;
    if (r < 820) bars.push("op");
    else if (r < 920) bars.push("deg");
    else if (r < 970) bars.push("part");
    else bars.push("out");
  }
  return bars;
}

export const pillFill = {
  op: "fill-[#22c55e] dark:fill-[#16a34a]",
  deg: "fill-[#fbbf24] dark:fill-[#d97706]",
  part: "fill-[#fb923c] dark:fill-[#ea580c]",
  out: "fill-[#ef4444] dark:fill-[#dc2626]",
};
