/**
 * 批量下载 avatar_1.jpg ~ avatar_3000.jpg
 * 用法: node download-avatars.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = "http://39.108.72.204/h5/uploads/avatar/avatar_";
const START = 1;
const END = 3000;
const OUT_DIR = path.join(__dirname, "avatars");
const CONCURRENCY = 20;
const MAX_RETRIES = 3;

fs.mkdirSync(OUT_DIR, { recursive: true });

function urlFor(n) {
  return `${BASE_URL}${n}.jpg`;
}

function fileFor(n) {
  return path.join(OUT_DIR, `avatar_${n}.jpg`);
}

async function downloadOne(n, attempt = 1) {
  const dest = fileFor(n);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    return { n, status: "skipped" };
  }

  const url = urlFor(n);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return { n, status: "ok", size: buf.length };
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return downloadOne(n, attempt + 1);
    }
    return { n, status: "failed", error: err.message };
  }
}

async function runPool(ids, concurrency) {
  const results = { ok: 0, skipped: 0, failed: [] };
  let index = 0;
  let done = 0;
  const total = ids.length;

  async function worker() {
    while (index < ids.length) {
      const i = index++;
      const n = ids[i];
      const r = await downloadOne(n);
      done++;
      if (r.status === "ok") results.ok++;
      else if (r.status === "skipped") results.skipped++;
      else results.failed.push(r);

      if (done % 100 === 0 || done === total) {
        process.stdout.write(
          `\r进度: ${done}/${total} | 新下载: ${results.ok} | 跳过: ${results.skipped} | 失败: ${results.failed.length}`
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, ids.length) }, () => worker())
  );
  console.log();
  return results;
}

const ids = Array.from({ length: END - START + 1 }, (_, i) => START + i);

console.log(`输出目录: ${OUT_DIR}`);
console.log(`范围: avatar_${START}.jpg ~ avatar_${END}.jpg`);
console.log(`并发: ${CONCURRENCY}\n`);

const start = Date.now();
const results = await runPool(ids, CONCURRENCY);
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n完成 (${elapsed}s)`);
console.log(`  新下载: ${results.ok}`);
console.log(`  已存在跳过: ${results.skipped}`);
console.log(`  失败: ${results.failed.length}`);

if (results.failed.length > 0) {
  const logPath = path.join(__dirname, "failed.txt");
  fs.writeFileSync(
    logPath,
    results.failed.map((f) => `${f.n}\t${f.error}`).join("\n"),
    "utf8"
  );
  console.log(`  失败列表已写入: ${logPath}`);
}
