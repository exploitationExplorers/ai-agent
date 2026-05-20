import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('asr')
  @UseInterceptors(FileInterceptor('audio'))
  async recogrize(
    @UploadedFile()
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ): Promise<{ text: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const text = await this.speechService.recognizeBySentence(file);
    return { text };
  }
}
