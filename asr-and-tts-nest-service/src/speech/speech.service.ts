import { Inject, Injectable } from '@nestjs/common';

type UploadedAudio = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type SentenceRecognitionRequest = {
  EngSerViceType: string;
  SourceType: 1 | 0;
  Data: string;
  DataLen: number;
  VoiceFormat: string;
};

type SentenceRecognitionResponse = {
  Result?: string;
};

type AsrClient = {
  SentenceRecognition(
    request: SentenceRecognitionRequest,
  ): Promise<SentenceRecognitionResponse>;
};

@Injectable()
export class SpeechService {
  constructor(@Inject('ASR_CLIENT') private readonly asrClient: AsrClient) {}

  async recognizeBySentence(file: UploadedAudio): Promise<string> {
    const audioBase64 = file.buffer.toString('base64');

    const result = await this.asrClient.SentenceRecognition({
      EngSerViceType: '16k_zh',
      SourceType: 1,
      Data: audioBase64,
      DataLen: file.buffer.length,
      VoiceFormat: 'ogg-opus',
    });

    return result.Result ?? '';
  }
}
