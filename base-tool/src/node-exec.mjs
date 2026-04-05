import { spawn } from "node:child_process";

// const cwd = process.cwd();

// Windows 下 spawn(..., { shell: true }) 默认走 cmd.exe，没有 Unix 的 ls；
// 交互式终端若是 PowerShell，ls 是别名，与 cmd 行为不一致。
// 这里按平台选等价命令；在 Windows 上显式用 PowerShell，才能用 ls / Get-ChildItem。
// const command =
//     process.platform === 'win32'
//         ? 'Get-ChildItem -Force'
//         : 'ls -la';

// const command =
//   'echo -e "n\nn" | npm create vite react-todo-app --template react-ts';

// const [cmd, ...args] = command.split(" ");

// const child = spawn(cmd, args, {
//   cwd,
//   stdio: "inherit",
//   shell: process.platform === "win32" ? "powershell.exe" : true,
// });
// window 下
const command = '"n`nn`n" | npm create vite react-todo-app --template react-ts';
// 获取当前工作目录
const cwd = process.cwd();
// 使用 spawn 创建子进程执行命令
const child = spawn(command, {  
cwd, // 设置子进程的工作目录  
stdio: 'inherit', // 实时输出到控制台（继承父进程的 stdin, stdout, stderr）  
shell: 'powershell.exe'// 从 Node.js 18.17.0 和 20.0.0 开始，spawn 的 shell 选项可以传字符串});
})


let errorMsg = "";

child.on("error", (error) => {
  errorMsg = error.message;
});

child.on("close", (code) => {
  if (code === 0) {
    process.exit(0);
  } else {
    if (errorMsg) {
      console.error(`错误: ${errorMsg}`);
    }
    process.exit(code || 1);
  }
});
