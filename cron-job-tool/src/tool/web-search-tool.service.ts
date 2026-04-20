import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import { z } from 'zod';

type BochaWebPage = {
  name?: string;
  url?: string;
  summary?: string;
  siteName?: string;
  siteIcon?: string;
  dateLastCrawled?: string;
};

type BochaSearchResponse = {
  code?: number;
  msg?: string;
  data?: {
    webPages?: {
      value?: BochaWebPage[];
    };
  };
};

@Injectable()
export class WebSearchToolService {
  readonly tool: StructuredToolInterface;
  @Inject(ConfigService)
  private readonly configService: ConfigService;
  constructor() {
    const webSearchArgsSchema = z.object({
      query: z.string().describe('搜索关键词，例如：公司年报、某个事件等'),
      count: z
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .describe('返回的搜索结果数量，默认 10 条'),
    });
    this.tool = tool(
      async ({ query, count }: { query: string; count?: number }) => {
        const apiKey = this.configService.get<string>('BOCHA_API_KEY');
        if (!apiKey) {
          return 'Bocha Web Search 的 API Key 未配置（环境变量 BOCHA_API_KEY），请先在服务端配置后再重试。';
        }

        const url = 'https://api.bochaai.com/v1/web-search';
        const body = {
          query,
          freshness: 'noLimit',
          summary: true,
          count: count ?? 10,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return `搜索 API 请求失败，状态码: ${response.status}, 错误信息: ${errorText}`;
        }

        let json: unknown;
        try {
          json = await response.json();
        } catch (e) {
          return `搜索 API 请求失败，原因是：搜索结果解析失败 ${(e as Error).message}`;
        }

        try {
          const parsed = json as BochaSearchResponse;
          if (parsed.code !== 200 || !parsed.data) {
            return `搜索 API 请求失败，原因是: ${parsed.msg ?? '未知错误'}`;
          }

          const webpages = parsed.data.webPages?.value ?? [];
          if (!webpages.length) {
            return '未找到相关结果。';
          }

          const formatted = webpages
            .map(
              (page: BochaWebPage, idx: number) => `引用: ${idx + 1}
    标题: ${page.name ?? '未知'}
    URL: ${page.url ?? '未知'}
    摘要: ${page.summary ?? '无'}
    网站名称: ${page.siteName ?? '未知'}
    网站图标: ${page.siteIcon ?? '无'}
    发布时间: ${page.dateLastCrawled ?? '未知'}`,
            )
            .join('\n\n');

          return formatted;
        } catch (e) {
          return `搜索 API 请求失败，原因是：搜索结果解析失败 ${(e as Error).message}`;
        }
      },
      {
        name: 'web_search',
        description:
          '使用 Bocha Web Search API 搜索互联网网页。输入为搜索关键词（可选 count 指定结果数量），返回包含标题、URL、摘要、网站名称、图标和时间等信息的结果列表。',
        schema: webSearchArgsSchema,
      },
    );
  }
}
