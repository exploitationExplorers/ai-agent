import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import type { Runnable } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AiService {
  private readonly chain: Runnable;

  constructor(
    // @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject('CHAT_MODEL') private readonly model: ChatOpenAI,
  ) {
    const prompt = PromptTemplate.fromTemplate('请回答以下问题：\n\n{query}');
    // const modelName = this.configService.getOrThrow<string>('MODEL_NAME');
    // const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    // const baseURL = this.configService.getOrThrow<string>('OPENAI_BASE_URL');

    // const model = new ChatOpenAI({
    //   temperature: 0.7,
    //   modelName,
    //   apiKey,
    //   configuration: {
    //     baseURL,
    //   },
    // });
    this.chain = prompt.pipe(model).pipe(new StringOutputParser());
  }

  async runChain(query: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.chain.invoke({ query });
  }

  async *streamChain(query: string): AsyncGenerator<string> {
    const stream = await this.chain.stream({ query });
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
