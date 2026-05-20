import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";

// 输入：项目根目录下的 my.mp4
// 输出：同目录下的 my.mp3
const input = path.resolve("d:/AI agent/my.mp4");
const output = path.resolve("d:/AI agent/my.mp3");

if (!fs.existsSync(input)) {
  throw new Error(`找不到输入文件：${input}`);
}

// 参数说明（针对腾讯云音色复刻调优）：
// -vn         去掉视频流，只保留音频
// -ac 1       单声道（克隆推荐）
// -ar 16000   采样率 16kHz（克隆推荐，需要更高音质可改 24000/44100）
// -b:a 64k    mp3 码率（人声 64k 已够用；要更高质量改 128k/192k）
// -y          覆盖已存在的输出文件
const args = [
  "-i", input,
  "-vn",
  "-ac", "1",
  "-ar", "16000",
  "-b:a", "64k",
  "-y",
  output,
];

console.log("开始转换：", input, "→", output);

const proc = spawn(ffmpegPath, args, { stdio: ["ignore", "inherit", "inherit"] });

proc.on("error", (err) => {
  console.error("ffmpeg 启动失败：", err);
});

proc.on("close", (code) => {
  if (code === 0) {
    console.log("转换完成 ✅", output);
  } else {
    console.error(`ffmpeg 退出码 ${code}，转换失败 ❌`);
  }
});
