import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { executeCommandTool, listDirectoryTool, readFileTool, writeFileTool } from './all-tools.mjs';
import chalk from 'chalk';





const model = new ChatOpenAI({
    modelName: "qwen-plus",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});


const tools = [
    readFileTool,
    writeFileTool,
    executeCommandTool,
    listDirectoryTool,
];

// 绑定工具到模型
const modelWithTools = model.bindTools(tools);

// Agent 执行函数
async function runAgentWithTools(query, maxIterations = 30) {
    const messages = [
        new SystemMessage(`你是一个项目管理助手，使用工具完成任务。

当前工作目录: ${process.cwd()}

工具：
1. read_file: 读取文件
2. write_file: 写入文件
3. execute_command: 执行命令（支持 workingDirectory 参数）
4. list_directory: 列出目录

重要规则 - execute_command：
- workingDirectory 参数会自动切换到指定目录
- 当使用 workingDirectory 时，绝对不要在 command 中使用 cd
- 错误示例: { command: "cd react-todo-app && npm install", workingDirectory: "react-todo-app" }
这是错误的！因为 workingDirectory 已经在 react-todo-app 目录了，再 cd react-todo-app 会找不到目录
- 正确示例: { command: "npm install", workingDirectory: "react-todo-app" }
这样就对了！workingDirectory 已经切换到 react-todo-app，直接执行命令即可

重要规则 - Windows / 跨平台（execute_command 在 Windows 上使用 PowerShell）：
- 禁止使用 Bash 专用写法：如 echo -e、\\n 管道、heredoc 等；这些在 PowerShell 下会失败或行为不同。
- 不要用「echo ... | npm create ...」自动回答交互；应使用带齐参数的非交互命令。
- 创建 Vite + React-TS：不要用 vite@latest（会装 create-vite 9 + 最新模板，常触发更严的 Node/eslint 要求）。固定主版本 8，并加非交互（否则会停在「Install with npm and start now?」）：
  npm create vite@8 react-todo-app -- --template react-ts --no-interactive
- 脚手架只生成文件时，接着对 react-todo-app 执行 npm install（用 workingDirectory: "react-todo-app"）。
- 若提示目录已存在，先 list_directory 确认，再换项目名或删除旧目录后重试。
- 不要用 execute_command 跑 npm run dev（进程不退出会卡住 Agent）；依赖装好后在最终回复里提示用户在本机终端自行启动即可。

重要规则 - write_file：
- 当写入 React 组件文件（如 App.tsx）时，如果存在对应的 CSS 文件（如 App.css），在其他 import 语句后加上这个 css 的导入
`),
        new HumanMessage(query)
    ];

    for (let i = 0; i < maxIterations; i++) {
        console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));
        const response = await modelWithTools.invoke(messages);
        messages.push(response);

        // 检查是否有工具调用
        if (!response.tool_calls || response.tool_calls.length === 0) {
            console.log(`\n✨ AI 最终回复:\n${response.content}\n`);
            return response.content;
        }

        // 执行工具调用
        for (const toolCall of response.tool_calls) {
            const foundTool = tools.find(t => t.name === toolCall.name);
            if (foundTool) {
                const toolResult = await foundTool.invoke(toolCall.args);
                messages.push(new ToolMessage({
                    content: toolResult,
                    tool_call_id: toolCall.id,
                }));
            }
        }
    }

    return messages[messages.length - 1].content;
}

const case1 = `创建一个功能丰富的 React TodoList 应用：

1. 创建项目（不要用 @latest；用 vite@8 + --no-interactive，避免最新脚手架依赖过新）：npm create vite@8 react-todo-app -- --template react-ts --no-interactive
2. 修改 src/App.tsx，实现完整功能的 TodoList：
 - 添加、删除、编辑、标记完成
 - 分类筛选（全部/进行中/已完成）
 - 统计信息显示
 - localStorage 数据持久化
3. 添加复杂样式：
 - 渐变背景（蓝到紫）
 - 卡片阴影、圆角
 - 悬停效果
4. 添加动画：
 - 添加/删除时的过渡动画
 - 使用 CSS transitions
5. 列出目录确认

注意：使用 npm，功能要完整，样式要美观，要有动画效果,然后react相关依赖要安装完整

之后在 react-todo-app 项目中：
1. 使用 npm install 安装依赖（execute_command + workingDirectory）
2. 不要用 execute_command 执行 npm run dev（会阻塞）；全部改完后在回复里告诉用户自行在项目目录运行 npm run dev
`;

try {
  await runAgentWithTools(case1);
} catch (error) {
  console.error(`\n❌ 错误: ${error.message}\n`);
}