import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import type { DynamicStructuredTool } from '@langchain/core/tools';
import { createAgent, type ReactAgent } from 'langchain';
import { UIMessage } from 'ai';
import { toBaseMessages, toUIMessageStream } from '@ai-sdk/langchain';

@Injectable()
export class AiService {
  private readonly agent: ReactAgent;

  constructor(
    @Inject('WEB_SEARCH_TOOL')
    private readonly webSearchTool: DynamicStructuredTool,
    @Inject('CHAT_MODEL') private readonly model: ChatOpenAI,
  ) {
    this.agent = createAgent({
      model: this.model,
      tools: [this.webSearchTool],
      systemPrompt: '你是 AI 助手',
    });
  }

  async stream(messages: UIMessage[]) {
    const lcMessages = await toBaseMessages(messages);
    const lgStream = await this.agent.stream(
      { messages: lcMessages },
      {
        streamMode: ['messages', 'values'],
        recursionLimit: 30,
      },
    );

    return toUIMessageStream(lgStream);
  }
}
