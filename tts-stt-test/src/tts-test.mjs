import "dotenv/config";
import tencentcloud from "tencentcloud-sdk-nodejs-tts";
import fs from "node:fs";

const secretId = process.env.SECRET_ID?.trim();
const secretKey = process.env.SECRET_KEY?.trim();

if (!secretId || !secretKey) {
  throw new Error("缺少 SECRET_ID 或 SECRET_KEY，请检查 .env 配置。");
}

const TtsClient = tencentcloud.tts.v20190823.Client;

const client = new TtsClient({
  credential: {
    secretId,
    secretKey,
  },
  region: "ap-beijing",
  profile: {
    httpProfile: {
      endpoint: "tts.tencentcloudapi.com",
    },
  },
});

const params = {
  Text: "我是bug总", // 要合成的文本
  SessionId: "session-001",
  //VoiceType: 101001,        // 占位整数：使用 FastVoiceType 时该字段必填但会被覆盖
  FastVoiceType: "WCHN-951cf2bbb69042d3ac7a09be1df3660c", // 一句话音色复刻 ID（你的自定义音色）
  Codec: "mp3", // 指定输出格式为 mp3
};

client.TextToVoice(params).then(
  (data) => {
    // 返回的 Audio 字段是 Base64 编码的音频数据
    const audioBuffer = Buffer.from(data.Audio, "base64");
    const outputPath = "./output.mp3";

    fs.writeFile(outputPath, audioBuffer, (err) => {
      if (err) {
        console.error("保存文件失败：", err);
      } else {
        console.log("MP3 已保存至：", outputPath);
      }
    });
  },
  (err) => {
    console.error("合成失败：", err);
  },
);
