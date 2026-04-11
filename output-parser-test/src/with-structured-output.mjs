import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

// 定义结构化输出的 schema
const scientistSchema = z.object({
  name: z.string().describe("科学家的全名"),
  birth_year: z.number().describe("出生年份"),
  nationality: z.string().describe("国籍"),
  fields: z.array(z.string()).describe("研究领域列表"),
});

// 使用 withStructuredOutput：默认 jsonMode 会带 response_format: json_object，
// 部分 OpenAI 兼容网关要求 messages 里必须出现 “json” 字样，否则会报 400。
// 优先用 functionCalling 走工具调用；若仍走 json 模式，系统提示里需含 json。
const structuredModel = model.withStructuredOutput(scientistSchema, {
  method: "functionCalling",
});

// 调用模型（系统消息含 JSON，满足 json_object 模式的网关校验）
const result = await structuredModel.invoke([
  new SystemMessage(
    "请根据用户问题提取信息，并以结构化方式返回；若需纯文本 JSON 输出，请使用 JSON。",
  ),
  new HumanMessage("介绍一下爱因斯坦"),
]);

console.log("结构化结果:", JSON.stringify(result, null, 2));
console.log(`\n姓名: ${result.name}`);
console.log(`出生年份: ${result.birth_year}`);
console.log(`国籍: ${result.nationality}`);
console.log(`研究领域: ${result.fields.join(", ")}`);
