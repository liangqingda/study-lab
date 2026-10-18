import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { generateRoutes } from './gen-routes.mjs';

/**
 * 在隔离目录验证生成行为，保持真实页面不变。
 */
const fixture = async (run) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'study-lab-curriculum-'));
  const put = async (file, content = 'export default () => null;') => {
    const target = path.join(root, 'src/pages', file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  };
  try {
    await run(root, put);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

/**
 * 创建与 Demo 路由无关的学习阶段。
 */
const step = (id) => ({
  id,
  kind: 'concept',
  title: id,
  summary: '学习目标',
  content: '## 核心知识\n\n独立练习与验收。',
});

/**
 * 生成独立学习大纲配置。
 */
const configSource = (steps) =>
  `export const learningPath = ${JSON.stringify({ label: 'Example', description: '独立技术学习路径', steps })} as const;`;

test('多个学习阶段可以只配一个 Demo，侧边栏首项为路径且 Skills 不受影响', () =>
  fixture(async (root, put) => {
    await put('Tech/Example/OnlyDemo/index.tsx');
    await put(
      'Tech/Example/learning-path.ts',
      configSource([step('foundation'), step('core'), step('advanced')]),
    );
    await put('Skills/Docs/First/index.tsx');
    const { sidebarMenusByTopLevel: menus } = await generateRoutes(root);
    assert.equal(menus['/tech'][0].children[0].path, '/tech/example');
    assert.equal(menus['/tech'][0].children[1].path, '/tech/example/only-demo');
    assert.equal(menus['/skills'][0].children.length, 1);
  }));

test('新增 Demo 不改变大纲，也无需登记为学习阶段', () =>
  fixture(async (root, put) => {
    await put('Tech/Example/First/index.tsx');
    await put(
      'Tech/Example/learning-path.ts',
      configSource([step('foundation')]),
    );
    await generateRoutes(root);
    const file = path.join(root, 'src/generated/learning-paths.ts');
    const before = await readFile(file, 'utf8');
    await put('Tech/Example/Second/index.tsx');
    const { sidebarMenusByTopLevel: menus } = await generateRoutes(root);
    assert.equal(await readFile(file, 'utf8'), before);
    assert.equal(menus['/tech'][0].children.length, 3);
  }));

test('没有 Demo 的技术也能有完整学习路径', () =>
  fixture(async (root, put) => {
    await put(
      'Tech/Example/learning-path.ts',
      configSource([step('foundation')]),
    );
    const { sidebarMenusByTopLevel: menus } = await generateRoutes(root);
    assert.equal(menus['/tech'][0].children[0].path, '/tech/example');
  }));

test('已有概念内容不出现在 Demo 菜单，不要求成为大纲步骤', () =>
  fixture(async (root, put) => {
    await put(
      'Tech/Example/Intro/index.tsx',
      "import ConceptPageLayout from '@/components/ConceptPageLayout'; export default ConceptPageLayout;",
    );
    await put('Tech/Example/Lab/index.tsx');
    await put(
      'Tech/Example/learning-path.ts',
      configSource([step('independent-stage')]),
    );
    const { sidebarMenusByTopLevel: menus } = await generateRoutes(root);
    assert.deepEqual(
      menus['/tech'][0].children.map((item) => item.path),
      ['/tech/example', '/tech/example/lab'],
    );
  }));

test('缺少大纲时拒绝从 Demo 自动拼出路径', () =>
  fixture(async (root, put) => {
    await put('Tech/Example/Lab/index.tsx');
    await assert.rejects(generateRoutes(root), /独立设计/);
  }));

for (const [name, steps] of [
  ['重复 id', [step('same'), step('same')]],
  ['非法阶段类型', [{ ...step('one'), kind: 'other' }]],
  ['缺少学习内容', [{ ...step('one'), content: '' }]],
  ['绑定 Demo', [{ ...step('one'), demo: 'Lab' }]],
  ['空大纲', []],
]) {
  test(`拒绝${name}`, () =>
    fixture(async (root, put) => {
      await put('Tech/Example/Lab/index.tsx');
      await put('Tech/Example/learning-path.ts', configSource(steps));
      await assert.rejects(generateRoutes(root));
    }));
}

test('Markdown 笔记独立读取且修改后不会复用旧内容', () =>
  fixture(async (root, put) => {
    const stage = { ...step('note'), contentFile: 'notes/first.md' };
    delete stage.content;
    await put('Tech/Example/learning-path.ts', configSource([stage]));
    await put('Tech/Example/notes/first.md', '## 初版\n\nfirst revision');
    await generateRoutes(root);
    const output = path.join(root, 'src/generated/learning-paths.ts');
    assert.match(await readFile(output, 'utf8'), /first revision/);
    await put('Tech/Example/notes/first.md', '## 修订版\n\nsecond revision');
    await generateRoutes(root);
    assert.match(await readFile(output, 'utf8'), /second revision/);
  }));

for (const note of ['notes/missing.md', '../outside.md']) {
  test(`拒绝不存在或越界的笔记 ${note}`, () =>
    fixture(async (root, put) => {
      const stage = { ...step('note'), contentFile: note };
      delete stage.content;
      await put('Tech/Example/learning-path.ts', configSource([stage]));
      await assert.rejects(generateRoutes(root));
    }));
}
