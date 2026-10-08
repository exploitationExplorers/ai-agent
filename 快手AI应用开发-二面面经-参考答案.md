# 快手 AI 应用开发 · 二面面经参考答案

> 来源：快手 AI 应用开发二面（日常实习），时长约 45 分钟，面试官偏主管，侧重概念与项目理解，而非深挖算法细节。
>
> 本文档整理了面经中的全部题目，并给出可直接用于面试准备的参考答案。

---

## 目录

1. [自我介绍](#1-自我介绍)
2. [项目一：文档解析与 RAG](#2-项目一文档解析与-rag)
3. [项目二：Agent 与 LangGraph](#3-项目二agent-与-langgraph)
4. [Prompt 工程](#4-prompt-工程)
5. [ToT / GoT](#5-tot--got)
6. [工具调用异常处理](#6-工具调用异常处理)
7. [Agent 记忆存储](#7-agent-记忆存储)
8. [向量检索与时效性](#8-向量检索与时效性)
9. [为什么需要 Rerank](#9-为什么需要-rerank)
10. [Rerank Top-k 如何确定](#10-rerank-top-k-如何确定)
11. [文档切片粒度](#11-文档切片粒度)
12. [Rerank 效果评估](#12-rerank-效果评估)
13. [Vibe Coding 与项目经历](#13-vibe-coding-与项目经历)
14. [手撕代码](#14-手撕代码)
15. [反问环节](#15-反问环节)

---

## 1. 自我介绍

**参考结构（1～2 分钟）：**

> 面试官好，我是 XXX，目前就读于 XXX，主攻方向是 **大模型应用开发**，熟悉 **RAG、Agent、LangGraph** 等技术栈。
>
> 近期主要做了两个项目：
>
> - **项目一**：基于 MinerU 的文档解析 + 混合检索 RAG 系统，解决企业知识库问答场景；
> - **项目二**：基于 LangGraph 的多步骤 Agent，包含工具调用、安全护栏和循环控制。
>
> 技术栈上熟悉 LangChain / LangGraph、Milvus 向量库、Prompt 工程与 RAG 评估（Ragas）。希望能在快手 AI 应用方向继续深入实践。

**要点：**
- 先说背景 + 方向，再讲 1～2 个代表性项目（各 2～3 句）
- 点出与岗位匹配的技术关键词
- 控制时长，为后续追问留空间

---

## 2. 项目一：文档解析与 RAG

### 2.1 MinerU 相比传统 OCR 有什么优势？

| 维度 | 传统 OCR | MinerU |
|------|----------|--------|
| 输出形式 | 纯文本流，丢失结构 | 保留标题、段落、表格、公式等结构化信息 |
| 版面理解 | 弱，多栏/复杂排版易乱序 | 基于视觉-语言模型做版面分析（Layout Analysis） |
| 表格处理 | 常变成乱码或错位 | 可还原为 Markdown / HTML 表格 |
| 公式 | 难以识别 | 支持 LaTeX 公式提取 |
| 下游 RAG | 切片质量差，检索噪声大 | 结构清晰，可按语义块切分，检索更准 |

**一句话总结：** MinerU 不只是「识字」，而是做 **文档理解（Document Understanding）**，为 RAG 提供高质量、结构化的输入。

---

### 2.2 版面分析精度提升主要来自哪里？

1. **视觉-语言多模态模型**：同时利用页面图像与文本特征，理解标题、正文、页眉页脚、图片说明等区域类型。
2. **阅读顺序预测（Reading Order）**：解决多栏、图文混排时的正确阅读顺序，避免段落错乱。
3. **端到端训练数据**：在大规模标注文档数据集上训练，覆盖论文、报告、扫描件等多种版式。
4. **后处理与规则融合**：结合启发式规则（如字体大小、位置）对模型输出做校正。
5. **相比纯 OCR 流水线**：传统方案是「检测 → 识别 → 规则拼接」，误差会累积；MinerU 类方案更接近端到端，减少中间环节损失。

---

### 2.3 混合检索中 BM25 与向量检索的融合权重怎么设？

**常见融合方式：**

#### （1）Reciprocal Rank Fusion（RRF，推荐）

不直接设 α/β 权重，而是按排名融合：

```
score(d) = Σ 1 / (k + rank_i(d))    # k 通常取 60
```

优点：对不同分数尺度不敏感，工程上稳定。

#### （2）线性加权

```
final_score = α · normalize(bm25_score) + (1-α) · normalize(vector_score)
```

**权重设置思路：**

| 场景 | 建议 |
|------|------|
| 专有名词、编号、代码多 | BM25 权重略高（α ≈ 0.4～0.6） |
| 语义理解、同义表达多 | 向量权重略高（α ≈ 0.3～0.5） |
| 不确定 | 先用 RRF，再在验证集上调 α |

**实践建议：**
- 准备 50～100 条标注 query，用 **Recall@K、MRR、NDCG** 做网格搜索
- 初始可试 `α = 0.5`，或 RRF `k=60`
- 线上可做 A/B 对比最终效果

---

### 2.4 讲一下 Ragas 评估

**Ragas**（Retrieval Augmented Generation Assessment）是面向 RAG 的自动化评估框架，无需大量人工标注即可衡量质量。

**核心指标：**

| 指标 | 含义 | 说明 |
|------|------|------|
| **Faithfulness** | 忠实度 | 生成答案是否被检索上下文支撑，有无幻觉 |
| **Answer Relevancy** | 答案相关性 | 回答是否切题 |
| **Context Precision** | 上下文精确率 | 检索到的片段有多少真正有用 |
| **Context Recall** | 上下文召回率 | 回答问题所需信息是否都被检索到 |
| **Answer Correctness** | 答案正确性 | 与标准答案的语义一致程度 |

**使用流程：**

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

result = evaluate(
    dataset=eval_dataset,  # 含 question, answer, contexts, ground_truth
    metrics=[faithfulness, answer_relevancy, context_precision],
)
```

**面试可补充：**
- Ragas 用 LLM 做评判（LLM-as-Judge），适合快速迭代
- 正式上线前仍建议结合人工抽检
- 可配合自建 golden set 做回归测试

---

## 3. 项目二：Agent 与 LangGraph

### 3.1 为什么用 LangGraph 构建状态图？

| 对比项 | 普通 Chain | LangGraph |
|--------|------------|-----------|
| 控制流 | 线性，难表达分支/循环 | 显式状态图，支持条件边、循环 |
| 状态管理 | 需手动传递 | 内置 State + Reducer |
| 可观测性 | 较弱 | 可导出 Mermaid、支持 checkpoint |
| 人机协同 | 难实现中断/恢复 | 原生支持 interrupt、持久化 |
| 多 Agent | 编排复杂 | Supervisor / 多节点协作模式成熟 |

**典型适用场景：**
- Agent 需要 **重试、反思、多轮工具调用**
- 需要根据工具结果 **动态路由**（成功 → 生成，失败 → 重试/降级）
- 需要 **持久化会话状态** 或人工审批节点

**示例（循环终止）：**

```javascript
.addConditionalEdges("attempt", (state) => (state.ok ? "done" : "retry"), {
  retry: "attempt",
  done: END,
})
```

---

### 3.2 如何定义循环终止条件，防止 Agent 死循环？

**多层防护策略：**

#### （1）硬限制（必做）

```javascript
const MAX_ITERATIONS = 10;
const MAX_TOOL_CALLS = 5;

// 在 state 中维护
iterations: Annotation({ reducer: (_, next) => next, default: () => 0 })
```

每次循环 `iterations += 1`，超过阈值强制 `END`。

#### （2）语义终止条件

- LLM 输出结构化字段 `should_continue: false`
- 任务完成检测：已得到最终答案 / 所有子目标已完成
- 工具返回 `status: success` 且无需继续调用

#### （3）重复检测

- 连续 N 次相同 tool call + 相同参数 → 中断
- 状态哈希去重：`(action, args)` 出现重复则终止

#### （4）超时与资源限制

- 单次 run 总超时（如 60s）
- Token 预算上限

#### （5）人工兜底**

- 超过阈值转人工，或返回「无法完成，请换一种问法」

**面试话术：** 「我会同时设硬上限 + 语义停止 + 重复检测，硬上限保证系统绝不会无限跑。」

---

### 3.3 安全护栏是关键词匹配还是专用模型？调用了什么模型？

**常见分层方案：**

| 层级 | 方式 | 优点 | 缺点 |
|------|------|------|------|
| L1 输入 | 关键词/正则黑名单 | 快、便宜 | 易绕过、误杀 |
| L2 输入 | 分类模型（如 Qwen-Guard、Moderation API） | 语义理解好 | 有延迟和成本 |
| L3 输出 | 规则 + LLM 审查 | 防止有害输出 | 增加一次调用 |
| L4 工具 | 参数校验、权限白名单 | 防止危险操作 | 需业务定制 |

**推荐回答模板：**

> 我们采用 **规则 + 模型** 混合方案：
> - 输入侧：先用关键词过滤明显违规内容，再用 **Qwen-Guard / OpenAI Moderation** 做语义审核；
> - 输出侧：对 Agent 最终回复做二次检查；
> - 工具侧：限制可调用的 API 白名单，敏感操作需用户确认。

**若被追问具体模型：** 可说 Qwen2.5-Guard、Llama-Guard、或各云厂商内容安全 API，按你项目实际情况回答。

---

## 4. Prompt 工程

**参考回答框架：**

### 4.1 结构设计

```
[System] 角色 + 能力边界 + 输出格式
[Context] 检索到的文档 / 工具说明
[History] 对话历史（截断或摘要）
[User] 当前问题
```

### 4.2 常用技巧

1. **角色设定**：明确身份、语气、禁止事项（如「仅根据上下文回答，不知道就说不知道」）
2. **Few-shot**：给 1～3 个输入输出示例，统一格式
3. **结构化输出**：要求 JSON / 固定字段，配合 Zod、Pydantic 解析
4. **Chain-of-Thought**：复杂推理时要求「先分析再结论」
5. **分隔符**：用 `━━━━━`、XML 标签等区分不同上下文块，减少混淆

### 4.3 项目中的实践

- RAG：强调 **仅依据检索片段** 回答，并标注来源
- Agent：System Prompt 中写清 **可用工具、调用格式、失败处理**
- 版本管理：Prompt 模板化（LangChain PromptTemplate），便于 A/B 和回归

---

## 5. ToT / GoT

### 5.1 Tree of Thoughts（ToT）

将推理过程建模为 **树形搜索**：

- 每个节点是一种「思路 / 中间状态」
- LLM 生成多个候选下一步，用评估函数打分
- 用 BFS / DFS / Beam Search 探索最有希望的路径
- 适合：数学题、谜题、需要试错和回溯的规划任务

```
        [问题]
       /   |   \
    思路A 思路B 思路C
    /  \      |
  评估 剪枝   继续展开...
```

### 5.2 Graph of Thoughts（GoT）

在 ToT 基础上升级为 **图结构**：

- 不同分支的节点可以 **合并**（聚合多个思路）
- 支持更复杂的依赖与信息融合
- 适合：多文档综合、需要整合多源信息的任务

### 5.3 与 Agent 的关系

| 方法 | 特点 |
|------|------|
| ReAct Agent | 单链式：思考 → 行动 → 观察 |
| ToT | 多路径探索 + 评估选优 |
| GoT | 多路径 + 跨路径聚合 |
| LangGraph | 工程化实现上述控制流 |

**面试一句话：** ToT/GoT 是推理策略，LangGraph 是编排框架；复杂规划可考虑 ToT 思想，工程落地常用 LangGraph 实现类似循环与分支。

---

## 6. 工具调用异常处理

**问题：** 工具超时或返回空值时，如何设计 Prompt 让 Agent 向用户反馈？

### 6.1 系统 Prompt 中的规范

```text
## 工具调用异常处理规则
1. 若工具调用超时（>30s）或返回空结果：
   - 不要编造数据
   - 向用户说明：「当前无法获取 XXX 信息（原因：超时/暂无数据）」
   - 提供替代方案：换关键词、缩小范围、稍后重试
2. 若连续 2 次失败，停止重试，建议用户联系人工或换一种问法
3. 回复需包含：已尝试的操作、失败原因、下一步建议
```

### 6.2 工程层配合

```javascript
// 工具包装层统一返回结构
{
  success: false,
  error: "TIMEOUT" | "EMPTY" | "API_ERROR",
  message: "查询超时，请稍后重试",
  data: null
}
```

- Agent 根据 `success` 字段决定走成功分支还是异常分支
- LangGraph 条件边：`tool_result.success ? "generate" : "handle_error"`

### 6.3 用户侧话术示例

> 抱歉，我尝试查询了订单信息，但服务暂时超时未能返回结果。您可以：
> 1. 稍后重试；
> 2. 提供订单号我帮您再查一次；
> 3. 联系客服 400-XXX-XXXX。

---

## 7. Agent 记忆存储

### 7.1 短期记忆（Short-term Memory）

| 存储方式 | 说明 |
|----------|------|
| **内存 / Session** | 当前对话的 messages 列表 |
| **实现** | LangChain `ChatMessageHistory`、`InMemoryChatMessageHistory` |
| **限制** | 受上下文窗口限制，需截断或摘要 |
| **优化** | 滑动窗口（最近 N 轮）、Summarization Memory |

```javascript
// 典型：内存中维护 message 数组
const history = new InMemoryChatMessageHistory();
await history.addMessage(new HumanMessage("..."));
```

### 7.2 长期记忆（Long-term Memory）

| 存储方式 | 说明 |
|----------|------|
| **向量数据库** | 历史对话 embedding 后存入 Milvus / Pinecone，按语义检索 |
| **关系型数据库** | 结构化用户偏好、事实（姓名、偏好） |
| **KV / Redis** | 会话元数据、用户状态 |
| **实现** | 检索相关历史 → 注入当前 Prompt |

```javascript
// 检索相关历史对话注入上下文
const relevant = await retrieveRelevantConversations(query, k=3);
// 将 relevant 拼入 system prompt 或 context
```

### 7.3 对比总结

| | 短期记忆 | 长期记忆 |
|---|---------|---------|
| 范围 | 当前会话 | 跨会话 |
| 存储 | 内存 / Redis | 向量库 + DB |
| 检索 | 顺序读取 | 语义相似度检索 |
| 用途 | 多轮对话连贯性 | 个性化、历史事实回忆 |

---

## 8. 向量检索与时效性

**问题：** 语义相关但时间很久的历史信息，能直接用吗？

**答案：不能无脑直接用，需要结合业务判断。**

### 8.1 风险

- 政策、价格、人事等信息可能已过期
- 旧文档会导致 **过时答案**，即使用户问的是「当前状态」

### 8.2 处理策略

1. **元数据过滤**：检索时加 `timestamp > 某日期` 或 `version = latest`
2. **时间衰减打分**：

   ```
   final_score = semantic_score × decay(time)
   decay(t) = exp(-λ × days_since_update)
   ```

3. **检索后重排**：Rerank 时把时效性作为特征
4. **Prompt 约束**：要求模型标注信息时间，对过期内容加免责声明
5. **双路检索**：「最新文档库」+「历史归档库」，按 query 意图路由

### 8.3 面试话术

> 语义相关不等于业务可用。我会在检索阶段加时间过滤或衰减，生成阶段让模型区分「历史背景」和「当前有效信息」，必要时主动提示用户数据可能已过期。

---

## 9. 为什么需要 Rerank

**问题：** 向量检索已经算了相似度，为什么还要用交叉编码器重排？

### 9.1 双塔 vs 交叉编码器

| | Bi-Encoder（向量检索） | Cross-Encoder（Rerank） |
|---|----------------------|-------------------------|
| 编码方式 | query、doc **分别**编码，再算相似度 | query+doc **拼接**后一起编码 |
| 速度 | 快，可预计算、ANN 检索 | 慢，每对都要过模型 |
| 精度 | 粗排，语义近似 | 精排，细粒度交互 |
| 适用阶段 | 召回 Top-50～200 | 精排 Top-5～10 |

### 9.2 为什么向量相似度不够

1. **独立编码丢失交互信息**：query 与 doc 的细粒度匹配（否定、条件、实体对齐）双塔难以捕捉
2. **召回噪声**：ANN 近似最近邻、embedding 维度压缩都会带来误召回
3. **多路召回融合后需统一排序**：BM25 + 向量 + 关键词，分数尺度不同，需要统一精排

### 9.3 典型流水线

```
Query → 召回(向量+BM25, Top-50) → Cross-Encoder Rerank → Top-5 → LLM 生成
```

**常用 Rerank 模型：** bge-reranker-v2-m3、Cohere Rerank、Jina Reranker

---

## 10. Rerank Top-k 如何确定

### 10.1 考虑因素

| 因素 | 影响 |
|------|------|
| 上下文窗口 | k 过大挤占生成 token |
| 延迟 | Rerank 与 k 成正比 |
| 召回质量 | 召回差则需更大 k 再精排 |
| 文档长度 | 长文档 k 宜小，短 chunk 可略大 |

### 10.2 经验值

| 阶段 | 典型 k |
|------|--------|
| 向量召回 | 20～100 |
| Rerank 输入 | 20～50 |
| 送入 LLM | 3～10 |

### 10.3 确定方法

1. **评估驱动**：在验证集上扫 k ∈ {3, 5, 8, 10}，看 NDCG@k、答案正确率
2. **延迟预算**：Rerank 耗时 × k，结合 SLA 反推上限
3. **动态 k**：高置信度时少取，低置信度时多取（如 score 差距大则 k=3，否则 k=8）

---

## 11. 文档切片粒度

### 11.1 常见策略

| 策略 | chunk_size | 适用场景 |
|------|------------|----------|
| 固定长度 | 256～1024 tokens | 通用，实现简单 |
| 语义切分 | 按段落/标题 | 结构清晰的文档 |
| 递归切分 | 大块先切，超限再细切 | 长文档、混合结构 |
| 滑动窗口 | 有 overlap（10%～20%） | 避免语义被截断 |

### 11.2 选择思路

1. **看文档类型**
   - 论文/报告：按章节 → 段落，chunk 512～1024
   - 代码：按函数/类
   - FAQ：一条一问一答为一个 chunk

2. **看 query 类型**
   - 事实型短问答：小 chunk（256～512）
   - 总结型：大 chunk 或 parent-child 检索

3. **看评估结果**
   - Context Recall 低 → chunk 太大或太小，或 overlap 不够
   - Context Precision 低 → chunk 太大，噪声多

### 11.3 Parent-Child 检索（进阶）

- 小块（child）用于检索，大块（parent）用于生成
- 兼顾检索精度与上下文完整性

### 11.4 实践建议

> 默认从 **512 tokens、overlap 64** 起步，用 Ragas 的 Context Precision/Recall 调参；有明确结构时优先按标题/段落切，而不是纯固定长度。

---

## 12. Rerank 效果评估

### 12.1 排序指标

| 指标 | 含义 |
|------|------|
| **NDCG@k** | 考虑位置折扣的排序质量（常用） |
| **MRR** | 第一个相关结果的位置 |
| **Recall@k** | Top-k 中 relevant 占比 |
| **Precision@k** | Top-k 中 relevant 的比例 |

### 12.2 端到端指标

| 指标 | 说明 |
|------|------|
| **Hit Rate@k** | Top-k 是否包含能回答问题的 chunk |
| **Faithfulness** | 生成是否基于正确 chunk（Ragas） |
| **Answer Correctness** | 最终答案是否正确 |

### 12.3 评估方法

1. 构建 **query - relevant_doc_ids** 标注集（50～200 条）
2. 对比 **Rerank 前后** 的 NDCG@5、MRR
3. A/B 测试：线上点击率、用户满意度、人工抽检

### 12.4 面试话术

> 离线主要看 NDCG@5 和 Hit Rate@5，看 Rerank 是否把真正相关的文档排进 Top-5；在线结合 Ragas 的 Faithfulness 和人工抽检，避免排序指标好但生成质量没提升。

---

## 13. Vibe Coding 与项目经历

**问题：** 平时 vibe coding 吗？做过什么项目？

### 13.1 什么是 Vibe Coding

指在 AI 辅助下，以自然语言描述需求，快速迭代、偏「感觉驱动」的编码方式（Andrew Karpathy 提出）。特点：快、依赖 AI 生成，但需开发者能审代码、懂架构。

### 13.2 参考回答

> 会用到 AI 辅助开发，但关键模块（RAG 检索链路、Agent 状态机、评估指标）我会自己设计和 Review，不会盲目接受生成代码。
>
> 做过的项目包括：
> - **RAG 知识库问答**：MinerU 解析 + Milvus + 混合检索 + Ragas 评估
> - **LangGraph Agent**：多工具调用、循环重试、安全护栏
> - **记忆系统**：短期 InMemory + 长期 Milvus 向量检索
> - 技术栈：LangChain、LangGraph、Milvus、NestJS 等

**要点：** 体现会用 AI 提效，同时强调架构能力和代码审查，避免给人「只会抄 AI」的印象。

---

## 14. 手撕代码

面经提到有一道原创难题，作者未记下题目。常见 AI 应用开发手撕方向包括：

| 类型 | 示例 |
|------|------|
| RAG | 实现简易向量检索 + TopK |
| Agent | 实现 ReAct 循环或工具调用解析 |
| 文本 | 实现 BM25 或文本相似度 |
| 数据结构 | LRU Cache、限流器 |
| LLM 相关 | 解析 JSON 输出、Prompt 模板拼接 |

**备考建议：**
- 熟悉 LangChain / LangGraph 核心 API
- 能手写简易 RAG 流水线（embed → search → prompt → generate）
- 能手写带终止条件的 Agent 循环

---

## 15. 反问环节

**推荐问题（选 2～3 个）：**

1. 团队目前 AI 应用的主要落地场景是什么？（客服、内容理解、创作辅助等）
2. 技术栈上更偏向自研框架还是 LangChain/LangGraph 生态？
3. 实习生会负责哪类需求？偏工程落地还是算法优化？
4. 团队如何衡量 RAG / Agent 项目的效果？有没有统一的评估平台？
5. 入职后的培养方式和 Mentor 机制是怎样的？

**避免：** 只问加班、薪资（二面可适当问培养），或问太基础、官网能查到的问题。

---

## 附录：高频考点速记

```
RAG 流水线：解析 → 切片 → Embedding → 检索 → Rerank → 生成
混合检索：BM25 + 向量，RRF 或线性加权
Rerank 原因：双塔粗排 + 交叉编码器精排
Agent 防死循环：max_iterations + 重复检测 + 超时
记忆：短期 messages / 长期向量库
Prompt：角色 + 上下文 + 格式 + 异常处理
评估：Ragas（Faithfulness、Context Precision 等）+ NDCG@k
```

---

*文档生成时间：2026-07-28*
