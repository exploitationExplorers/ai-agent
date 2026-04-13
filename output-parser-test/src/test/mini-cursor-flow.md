# mini-cursor.mjs 全流程说明

本文说明 `output-parser-test/src/test/mini-cursor.mjs` 的完整执行链路：从模型初始化，到流式工具调用，再到任务收敛。

## 1. 文件目标

这个脚本实现了一个“带工具调用能力的最小 Agent”：

- 使用 `ChatOpenAI` 作为推理模型。
- 绑定 4 个本地工具（读文件、写文件、执行命令、列目录）。
- 通过多轮循环让模型“思考 -> 调工具 -> 再思考”，直到给出最终文本答复。
- 对流式输出做了“增量展示”，尤其是 `write_file` 的内容会边生成边打印。

## 2. 依赖与模块角色

- `dotenv/config`：加载环境变量（`OPENAI_API_KEY`、`OPENAI_BASE_URL`）。
- `ChatOpenAI`：模型客户端。
- `HumanMessage / SystemMessage / ToolMessage`：消息类型。
- `InMemoryChatMessageHistory`：会话历史存储（内存态）。
- `JsonOutputToolsParser`：把模型增量输出解析成工具调用结构。
- `all-tools.mjs` 导出的 4 个工具：
  - `readFileTool`
  - `writeFileTool`
  - `executeCommandTool`
  - `listDirectoryTool`
- `chalk`：终端彩色日志。

## 3. 初始化阶段

### 3.1 模型初始化

脚本创建 `ChatOpenAI` 实例：

- `modelName: "qwen-plus"`
- `temperature: 0`（降低随机性，偏稳定执行）
- `apiKey`、`baseURL` 来自环境变量

### 3.2 工具集合与绑定

将 4 个工具放入 `tools` 数组，再通过：

- `model.bindTools(tools)`

得到 `modelWithTools`。这一步使模型可返回 `tool_calls`。

## 4. 核心函数：`runAgentWithTools(query, maxIterations = 30)`

这是整个 Agent 的主循环。

### 4.1 会话历史建立

先创建 `InMemoryChatMessageHistory`，然后写入：

1. 一条 `SystemMessage`（约束模型行为）
2. 一条 `HumanMessage(query)`（用户任务）

其中 system prompt 重点约束了：

- `execute_command` 使用 `workingDirectory` 时不能再写 `cd ...`
- Vite 创建命令必须非交互（用 `npx create-vite ... --no-interactive`）
- 禁止模拟回车写法（如 `"n\n"` 或管道拼接）
- 写 React 组件时要注意 CSS 导入

### 4.2 多轮循环（最多 30 轮）

每轮逻辑：

1. 从 history 取出消息：`await history.getMessages()`
2. 调用流式推理：`await modelWithTools.stream(messages)`
3. 按 chunk 累积成完整 AI 消息：`fullAIMessage = fullAIMessage ? fullAIMessage.concat(chunk) : chunk`
4. 同时尝试解析工具调用（增量）：`toolParser.parseResult([{ message: fullAIMessage }])`

## 5. 流式输出策略（关键）

### 5.1 `write_file` 的“边生成边预览”

当解析出工具调用且类型是 `write_file`：

- 用 `toolCall.id`（或 `filePath`）作为 key。
- 通过 `printedLengths` 记录“已打印长度”。
- 只输出新增片段：`currentContent.slice(previousLength)`。

效果：终端可看到文件内容实时生长，不必等整段生成完。

### 5.2 非工具场景的文本直出

如果当前还没解析出工具调用，就把 `chunk.content` 直接打印出来，保证普通文本也有流式体验。

## 6. 一轮结束后的处理

流结束后：

1. 把 `fullAIMessage` 存回 history。
2. 判断是否有 `tool_calls`：
   - **没有**：说明模型给了最终答复，函数直接返回。
   - **有**：进入工具执行阶段。

## 7. 工具执行阶段

遍历 `fullAIMessage.tool_calls`：

1. 按 `toolCall.name` 在 `tools` 里找对应工具。
2. 调用 `foundTool.invoke(toolCall.args)` 执行。
3. 把结果封装成 `ToolMessage` 写回 history（`tool_call_id` 对齐调用 id）。

这样下一轮模型就能“看到工具结果”，继续决策下一步。

## 8. 收敛与兜底

- 正常收敛：某一轮无工具调用，返回最终文本。
- 兜底收敛：超过 `maxIterations`，返回 history 最后一条消息内容。

## 9. 当前 `case1` 任务内容

脚本底部定义了 `case1`，要求 Agent 自动完成：

1. 创建 React + TS 的 Vite 项目（非交互命令）。
2. 改写 `src/App.tsx` 做完整 Todo 功能。
3. 添加复杂样式和过渡动画。
4. 列目录确认。
5. 安装依赖并启动开发服务。

最后通过：

- `await runAgentWithTools(case1)`

触发整个流程，异常会被 `try/catch` 打印。

## 10. 设计优点

- **结构清晰**：模型轮次和工具轮次分离。
- **可观测性强**：日志 + 写文件流式预览，便于调试。
- **可扩展**：新增工具只需加入 `tools` 并绑定。
- **安全性基础约束**：通过 system prompt 限制一些常见误操作。

## 11. 潜在风险与改进建议

- `parseResult` 在流中频繁尝试解析，性能与稳定性依赖模型输出质量。
- `write_file` 流式预览依赖 `toolCall.id/filePath` 去重，若 key 冲突可能串流。
- 缺少“命令失败自动重试策略”（例如 npm 参数问题）。
- 缺少持久化历史（目前是内存态，进程结束即丢失）。
- 缺少工具超时、并发限制和错误分级处理。

可改进方向：

1. 对 `execute_command` 增加失败模式识别与自动重试模板。
2. 给工具调用增加统一超时和结构化错误码。
3. 把消息历史落盘（JSONL）便于复盘。
4. 增加“任务完成判定器”，避免无效迭代。

