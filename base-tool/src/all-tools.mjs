import { tool } from '@langchain/core/tools';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { z } from 'zod';

// 1. 读取文件工具
const readFileTool = tool(
  async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`  [工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
      return `文件内容:\n${content}`;
    } catch (error) {
      console.log(`  [工具调用] read_file("${filePath}") - 错误: ${error.message}`);
      return `读取文件失败: ${error.message}`;
    }
  },
  {
    name: 'read_file',
    description: '读取指定路径的文件内容',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
    }),
  }
);

// 2. 写入文件工具
const writeFileTool = tool(
  async ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  [工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`);
      return `文件写入成功: ${filePath}`;
    } catch (error) {
      console.log(`  [工具调用] write_file("${filePath}") - 错误: ${error.message}`);
      return `写入文件失败: ${error.message}`;
    }
  },
  {
    name: 'write_file',
    description: '向指定路径写入文件内容，自动创建目录',
    schema: z.object({
      filePath: z.string().describe('文件路径'),
      content: z.string().describe('要写入的文件内容'),
    }),
  }
);

// 3. 执行命令工具（带实时输出）
// Windows 默认 shell: true 走 cmd.exe，无 ls 等 PowerShell 别名；且 split(' ') 会破坏引号/管道/多段参数。
// 整条命令交给 shell，与 node-exec.mjs 一致：Win 用 powershell.exe，其它平台用默认 sh。
const executeCommandTool = tool(
  async ({ command, workingDirectory }) => {
    const cwd = workingDirectory || process.cwd();
    console.log(`  [工具调用] execute_command("${command}")${workingDirectory ? ` - 工作目录: ${workingDirectory}` : ''}`);

    return new Promise((resolve) => {
      const shell =
        process.platform === 'win32' ? 'powershell.exe' : true;

      const child = spawn(command, {
        cwd,
        stdio: 'inherit',
        shell,
      });

      let errorMsg = '';

      child.on('error', (error) => {
        errorMsg = error.message;
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`  [工具调用] execute_command("${command}") - 执行成功`);
          const cwdInfo = workingDirectory
            ? `\n\n重要提示：命令在目录 "${workingDirectory}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: "${workingDirectory}" 参数，不要使用 cd 命令。`
            : '';
          resolve(`命令执行成功: ${command}${cwdInfo}`);
        } else {
          console.log(`  [工具调用] execute_command("${command}") - 执行失败，退出码: ${code}`);
          resolve(`命令执行失败，退出码: ${code}${errorMsg ? '\n错误: ' + errorMsg : ''}`);
        }
      });
    });
  },
  {
    name: 'execute_command',
    description:
      '执行系统命令，支持指定工作目录，实时显示输出。整条命令由 shell 解析；Windows 使用 PowerShell。禁止 Bash 专用写法（如 echo -e、管道喂交互）。脚手架不要用 npm create vite@latest（依赖与 Node 要求过新）；用固定主版本如 npm create vite@8，且必须加 --no-interactive，否则会卡在「Install with npm」、永不结束。示例：npm create vite@8 <目录名> -- --template react-ts --no-interactive；生成后另起一条在项目目录执行 npm install。',
    schema: z.object({
      command: z.string().describe('要执行的命令'),
      workingDirectory: z.string().optional().describe('工作目录（推荐指定）'),
    }),
  }
);

// 4. 列出目录内容工具
const listDirectoryTool = tool(
  async ({ directoryPath }) => {
    try {
      const files = await fs.readdir(directoryPath);
      console.log(`  [工具调用] list_directory("${directoryPath}") - 找到 ${files.length} 个项目`);
      return `目录内容:\n${files.map(f => `- ${f}`).join('\n')}`;
    } catch (error) {
      console.log(`  [工具调用] list_directory("${directoryPath}") - 错误: ${error.message}`);
      return `列出目录失败: ${error.message}`;
    }
  },
  {
    name: 'list_directory',
    description: '列出指定目录下的所有文件和文件夹',
    schema: z.object({
      directoryPath: z.string().describe('目录路径'),
    }),
  }
);

export { readFileTool, writeFileTool, executeCommandTool, listDirectoryTool };