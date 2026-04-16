import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { z } from 'zod';
import { Runnable } from '@langchain/core/runnables';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

const database: { users: Record<string, User> } = {
  users: {
    '001': {
      id: '001',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
    },
    '002': { id: '002', name: '李四', email: 'lisi@example.com', role: 'user' },
    '003': {
      id: '003',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
    },
  },
};

const queryUserArgsSchema = z.object({
  userId: z.string().describe('用户 ID，例如: 001, 002, 003'),
});

const sendMailArgsSchema = z.object({
  to: z.email().describe('收件人邮箱地址，例如：someone@example.com'),
  subject: z.string().describe('邮件主题'),
  text: z.string().optional().describe('纯文本内容，可选'),
  html: z.string().optional().describe('HTML 内容，可选'),
});

type QueryUserArgs = {
  userId: string;
};

type InjectableTool = ReturnType<typeof tool> & {
  invoke: (input: unknown) => Promise<unknown>;
};

const queryUserTool = tool(
  ({ userId }: QueryUserArgs) => {
    const user = database.users[userId];

    if (!user) {
      return `用户 ID ${userId} 不存在。可用的 ID: 001, 002, 003`;
    }

    return `用户信息：\n- ID: ${user.id}\n- 姓名: ${user.name}\n- 邮箱: ${user.email}\n- 角色: ${user.role}`;
  },
  {
    name: 'query_user',
    description:
      '查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。',
    schema: queryUserArgsSchema,
  },
);

@Injectable()
export class AiService {
  private readonly modelWithTools: Runnable<BaseMessage[], AIMessage>;

  constructor(
    @Inject('CHAT_MODEL') model: ChatOpenAI,
    @Inject('SEND_MAIL_TOOL')
    private readonly sendMailTool: InjectableTool,
    @Inject('WEB_SEARCH_TOOL')
    private readonly webSearchTool: InjectableTool,
  ) {
    this.modelWithTools = model.bindTools([
      this.sendMailTool,
      this.webSearchTool,
    ]);
  }

  async runChain(query: string): Promise<string> {
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。',
      ),
      new HumanMessage(query),
    ];

    while (true) {
      const allMessage = await this.modelWithTools.invoke(messages);

      messages.push(allMessage);

      const toolCalls = allMessage.tool_calls ?? [];

      if (!toolCalls.length) {
        return allMessage.content as string;
      }

      // 依次调用工具
      for (const toolCall of toolCalls) {
        const toolCallId = toolCall.id || '';
        const toolName = toolCall.name;

        if (toolName == 'query_user') {
          const args = queryUserArgsSchema.parse(toolCall.args);

          const result = await queryUserTool.invoke(args);

          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: result,
            }),
          );
        } else if (toolName == 'send_mail') {
          const result = await this.sendMailTool.invoke(toolCall.args);
          console.log('result', result);
          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: String(result),
            }),
          );
        } else if (toolName == 'web_search') {
          const result = await this.webSearchTool.invoke(toolCall.args);
          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: String(result),
            }),
          );
        }
      }
    }
  }

  async *runChainStream(query: string): AsyncIterable<string> {
    const messages: BaseMessage[] = [
      new SystemMessage(
        '你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。',
      ),
      new HumanMessage(query),
    ];

    while (true) {
      // 一轮对话：先让模型思考并（可能）提出工具调用
      const stream = await this.modelWithTools.stream(messages);

      let fullAIMessage: AIMessageChunk | null = null;

      for await (const chunk of stream as AsyncIterable<AIMessageChunk>) {
        fullAIMessage = fullAIMessage ? fullAIMessage.concat(chunk) : chunk;

        const hasToolCallChunk =
          !!fullAIMessage.tool_call_chunks &&
          fullAIMessage.tool_call_chunks.length > 0;

        // 只要当前轮次还没出现 tool 调用的 chunk，就可以把文本内容流式往外推
        if (!hasToolCallChunk && chunk.content) {
          yield chunk.content as string;
        }
      }
      if (!fullAIMessage) {
        return;
      }

      messages.push(fullAIMessage);

      const toolCalls = fullAIMessage.tool_calls ?? [];

      if (!toolCalls.length) {
        return;
      }

      for (const toolCall of toolCalls) {
        const toolCallId = toolCall.id || '';
        const toolName = toolCall.name;

        if (toolName == 'query_user') {
          const args = queryUserArgsSchema.parse(toolCall.args);

          const result = await queryUserTool.invoke(args);

          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: String(result),
            }),
          );
        } else if (toolName == 'send_mail') {
          const result = await this.sendMailTool.invoke(toolCall.args);
          console.log('result', result);
          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: String(result),
            }),
          );
        } else if (toolName == 'web_search') {
          const result = await this.webSearchTool.invoke(toolCall.args);
          messages.push(
            new ToolMessage({
              tool_call_id: toolCallId,
              name: toolName,
              content: String(result),
            }),
          );
        }
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
