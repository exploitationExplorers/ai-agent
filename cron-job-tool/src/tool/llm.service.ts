import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class LlmService {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  getModel() {
    return new ChatOpenAI({
      model: this.configService.getOrThrow<string>('MODEL_NAME'),
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      configuration: {
        baseURL: this.configService.getOrThrow<string>('OPENAI_BASE_URL'),
      },
    });
  }
}
