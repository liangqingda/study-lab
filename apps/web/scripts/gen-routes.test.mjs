import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { generateRoutes } from './gen-routes.mjs';

/** 在隔离目录里创建分类，验证生成器而不改动真实页面。 */
const fixture = async (run) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'study-lab-routes-'));
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

/** 生成一份具有稳定 id 的教学配置。 */
const configSource = (steps) =>
  `export const learningPath = ${JSON.stringify({
    label: 'Example',
    description: 'Example path',
    steps,
  })} as const;`;

/** 创建测试用学习步骤。 */
const step = (demo, kind = 'lab') => ({
  id: demo,
  kind,
  demo,
  title: demo,
  summary: demo,
});

test('所有非 Skills 分类自动生成学习路径，Skills 保持原样', () =>
  fixture(async (root, put) => {
    await put('Tech/Example/First/index.tsx');
    await put('Skills/Docs/First/index.tsx');
    const { sidebarMenusByTopLevel: menus } = await generateRoutes(root);
    assert.equal(menus['/tech'][0].children[0].path, '/tech/example');
    assert.equal(menus['/tech'][0].children[1].path, '/tech/example/first');
    assert.equal(menus['/skills'][0].children.length, 1);
    const metadata = await readFile(
      path.join(root, 'src/generated/learning-paths.ts'),
      'utf8',
    );
    assert.match(metadata, /\/tech\/example/);
  }));

test('概念只在路径内预览，侧边栏仅保留学习路径与实验', () =>
  fixture(async (root, put) => {
    await put('Tech/Example/Intro/index.tsx');
    await put('Tech/Example/Lab/index.tsx');
    await put(
      'Tech/Example/learning-path.ts',
      configSource([step('Intro', 'concept'), step('Lab')]),
    );
    const { output } = await generateRoutes(root);
    const menus = output.split('export const sidebarMenusByTopLevel')[1];
    assert.doesNotMatch(menus, /\/intro/);
    assert.match(menus, /\/lab/);
    assert.match(output, /path: ["']\/tech\/example\/intro["']/);
  }));

for (const [name, steps] of [
  ['缺失页面', [step('Missing')]],
  ['重复 id', [step('Intro'), { ...step('Lab'), id: 'Intro' }]],
  ['重复页面', [step('Intro'), { ...step('Intro'), id: 'other' }]],
  ['非法 kind', [step('Intro', 'other')]],
  ['漏登记新页面', [step('Intro')]],
]) {
  test(`拒绝${name}`, () =>
    fixture(async (root, put) => {
      await put('Tech/Example/Intro/index.tsx');
      await put('Tech/Example/Lab/index.tsx');
      await put('Tech/Example/learning-path.ts', configSource(steps));
      await assert.rejects(generateRoutes(root));
    }));
}
