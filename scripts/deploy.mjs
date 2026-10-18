#!/usr/bin/env node
/**
 * 重新部署 study-lab Web 到 CloudBase（腾讯云开发）。
 * 流程：① 在 apps/web 重新构建（产出最新 dist）→ ② tcb hosting 全量上传。
 * 由 dashboard agent 的「重新部署」按钮触发（pnpm deploy）。
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web');

/** CloudBase 环境 ID（来自部署流程文档） */
const ENV_ID = 'lqd-test-d2gbk091xe6015603';

/** 执行命令；非零退出码则终止部署 */
function run(cmd, args, cwd) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', env: process.env });

  if (result.status !== 0) {
    console.error(`[deploy] 命令失败：${cmd}（exit ${result.status ?? result.error?.message}）`);
    process.exit(result.status ?? 1);
  }
}

console.log('① 重新构建（产出最新 dist）');
run('npm', ['run', 'build'], WEB_DIR);

console.log('② 部署到 CloudBase（全量上传）');
run('tcb', ['hosting', 'deploy', 'dist', '-e', ENV_ID], WEB_DIR);

console.log('\n部署完成：访问地址不变');
