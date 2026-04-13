import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import mysql from 'mysql2/promise';

// 初始化模型（提高上限，避免多人抽取时 JSON 被截断导致解析失败）
const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  maxTokens: 4096,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

// 定义单个好友信息的 zod schema，匹配 friends 表结构
const friendSchema = z.object({
  name: z.string().describe('姓名'),
  gender: z.string().describe('性别（男/女）'),
  birth_date: z.string().describe('出生日期，格式：YYYY-MM-DD，如果无法确定具体日期，根据年龄估算'),
  company: z.string().nullable().describe('公司名称，如果没有则返回 null'),
  title: z.string().nullable().describe('职位/头衔，如果没有则返回 null'),
  phone: z.string().nullable().describe('手机号，如果没有则返回 null'),
  wechat: z.string().nullable().describe('微信号，如果没有则返回 null'),
});

// 批量好友：根类型为数组，与库表字段一一对应（英文键名）
const friendsArraySchema = z.array(friendSchema).describe('好友信息数组');

// functionCalling：由接口按 schema 生成参数，键名与 zod 一致；messages 须含 “json”（兼容网关校验）
const structuredModel = model.withStructuredOutput(friendsArraySchema, {
  method: 'functionCalling',
});

// 数据库连接配置
const connectionConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'asd.12345',
  multipleStatements: true,
};

async function extractAndInsert(text) {
  const connection = await mysql.createConnection(connectionConfig);

  try {
    // 切换到 hello 数据库
    await connection.query(`USE hello;`);

    // 使用 AI 提取结构化信息
    console.log('🤔 正在从文本中提取信息...\n');
    const prompt = `请从以下文本中提取所有好友信息；可能有多人。请返回一个 JSON 数组，每人一个对象。

文本：
${text}

硬性要求（违反会导致解析失败）：
1. 根类型必须是 JSON 数组 [...]，即使只有一个人也只含一个元素。
2. 每个对象的键名必须全部为英文，且与下列完全一致（禁止使用中文作键名，例如不要用「姓名」）：
   - name：人名
   - gender：男 或 女
   - birth_date：YYYY-MM-DD；若只有年龄描述则合理估算
   - company：公司，没有则 null
   - title：职位，没有则 null
   - phone：手机，没有则 null
   - wechat：微信号，没有则 null
3. 工具/结构化参数里填写裸 JSON，不要 markdown、不要用三个反引号包裹、不要附加说明文字。`;

    const results = await structuredModel.invoke([
      new SystemMessage(
        '你是结构化抽取助手，通过工具返回数据。参数必须是合法 JSON；键名仅能为 schema 中的英文：name, gender, birth_date, company, title, phone, wechat。禁止中文键名；禁止 markdown 与 ``` 代码块。',
      ),
      new HumanMessage(prompt),
    ]);

    console.log(`✅ 提取到 ${results.length} 条结构化信息:`);
    console.log(JSON.stringify(results, null, 2));
    console.log('');

    if (results.length === 0) {
      console.log('⚠️  没有提取到任何信息');
      return { count: 0, insertIds: [] };
    }

    // 批量插入数据库
    const insertSql = `
      INSERT INTO friends (
        name,
        gender,
        birth_date,
        company,
        title,
        phone,
        wechat
      ) VALUES ?;
    `;

    const values = results.map((result) => [
      result.name,
      result.gender,
      result.birth_date || null,
      result.company,
      result.title,
      result.phone,
      result.wechat,
    ]);

    const [insertResult] = await connection.query(insertSql, [values]);
    console.log(`✅ 成功批量插入 ${insertResult.affectedRows} 条数据`);
    console.log(`   插入的ID范围：${insertResult.insertId} - ${insertResult.insertId + insertResult.affectedRows - 1}`);

    return {
      count: insertResult.affectedRows,
      insertIds: Array.from({ length: insertResult.affectedRows }, (_, i) => insertResult.insertId + i),
    };
  } catch (err) {
    console.error('❌ 执行出错：', err);
    throw err;
  } finally {
    await connection.end();
  }
}

// 主函数
async function main() {
  // 示例文本（包含多个人的信息）
  const sampleText = `我最近认识了几个新朋友。第一个是张总，女的，看起来30出头，在腾讯做技术总监，手机13800138000，微信是zhangzong2024。第二个是李工，男，大概28岁，在阿里云做架构师，电话15900159000，微信号lee_arch。还有一个是陈经理，女，35岁左右，在美团做产品经理，手机号是18800188000，微信chenpm2024。`;

  console.log('📝 输入文本:');
  console.log(sampleText);
  console.log('');

  try {
    const result = await extractAndInsert(sampleText);
    console.log(`\n🎉 处理完成！成功插入 ${result.count} 条记录`);
    console.log(`   插入的ID：${result.insertIds.join(', ')}`);
  } catch (error) {
    console.error('❌ 处理失败：', error.message);
    process.exit(1);
  }
}

main();