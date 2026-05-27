# 头像批量下载

下载 `avatar_1.jpg` ~ `avatar_3000.jpg` 到 `avatars/` 文件夹。

## 运行

```bash
cd avatar-downloader
node download-avatars.mjs
```

- 支持断点续传：已存在的文件会自动跳过
- 失败记录保存在 `failed.txt`
- 默认 20 路并发，可在脚本内修改 `CONCURRENCY`
