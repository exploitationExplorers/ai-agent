import { Module } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SpeechController } from './speech.controller';
import tencentcloud from 'tencentcloud-sdk-nodejs';
import { ConfigService } from '@nestjs/config';

type AsrClientConstructor = new (options: {
  credential: {
    secretId: string;
    secretKey: string;
  };
  region: string;
  profile: {
    httpProfile: {
      reqMethod: 'POST' | 'GET';
      reqTimeout: number;
    };
  };
}) => unknown;

type TencentCloudSdk = {
  asr: {
    v20190614: {
      Client: AsrClientConstructor;
    };
  };
};

const sdk = tencentcloud as unknown as TencentCloudSdk;
const AsrClient = sdk.asr.v20190614.Client;

@Module({
  providers: [
    SpeechService,
    {
      provide: 'ASR_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new AsrClient({
          credential: {
            secretId: configService.getOrThrow<string>('SECRET_ID'),
            secretKey: configService.getOrThrow<string>('SECRET_KEY'),
          },
          region: 'ap-shanghai',
          profile: {
            httpProfile: {
              reqMethod: 'POST',
              reqTimeout: 30,
            },
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [SpeechController],
})
export class SpeechModule {}
