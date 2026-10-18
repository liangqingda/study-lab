#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 课程笔记的结构性底线校验；内容正确性仍需 take-notes/review-note 人工式评审。
 */
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/pages/Tech',
);
let count = 0;
let diagrams = 0;
for (const category of await readdir(root)) {
  const configPath = path.join(root, category, 'learning-path.ts');
  const source = await readFile(configPath, 'utf8').catch(() => null);
  if (!source) continue;
  const files = [...source.matchAll(/contentFile:\s*['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );
  const ids = [...source.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)];
  assert.equal(files.length, ids.length, `${category}: 每阶段必须使用独立笔记`);
  for (const file of files) {
    const markdown = await readFile(path.join(root, category, file), 'utf8');
    const headings = [...markdown.matchAll(/^##\s+(\d+)\.\s+(.+)$/gm)];
    assert(headings.length >= 6, `${file}: 缺少完整学习结构`);
    assert.deepEqual(
      headings.map((heading) => Number(heading[1])),
      headings.map((_, index) => index + 1),
      `${file}: 章节编号不连续`,
    );
    assert(/先预测/.test(markdown), `${file}: 缺少预测提示`);
    assert(
      /^```(html|js|sql|sh|lua|text)/m.test(markdown),
      `${file}: 缺少具体实验或执行过程`,
    );
    assert(/预期|结果/.test(markdown), `${file}: 缺少预期结果`);
    assert(/错误|失败|故障|边界/.test(markdown), `${file}: 缺少失败与边界`);
    assert(/练习|验收/.test(markdown), `${file}: 缺少主动练习`);
    assert(
      /资料链接/.test(markdown) && /https:\/\//.test(markdown),
      `${file}: 缺少资料来源`,
    );
    assert.equal(
      (markdown.match(/^```/gm) ?? []).length % 2,
      0,
      `${file}: 代码围栏未闭合`,
    );
    count++;
    diagrams += (markdown.match(/^```mermaid/gm) ?? []).length;
  }
}
console.log(
  `Validated ${count} independent notes; ${diagrams} Mermaid diagrams. Semantic review remains required.`,
);
