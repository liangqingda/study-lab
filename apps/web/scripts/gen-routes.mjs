#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import prettier from 'prettier';
import ts from 'typescript';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const pageFileExtensionPattern = /\.(tsx|jsx|ts|js)$/;
const ignoredSegmentNames = new Set([
  'components',
  'constants',
  'errors',
  'hooks',
  'types',
  'utils',
]);

/**
 * 仅出现在侧边栏、不出现在 header 领域切换中的顶层领域（按路由首段 kebab 名）。
 * 当前无此类领域：Skills 与 Tech 同为顶层领域，均出现在 header 领域切换中。
 * 若需将某领域限制为仅侧边栏可见，把其路由首段 kebab 名加入本集合。
 */
const SIDEBAR_ONLY_REALMS = new Set();

/**
 * header 领域展示顺序（按路由首段 kebab 名）。Tech 为首选领域、默认展示，
 * Skills 排在 Tech 之下。未列出的领域按字典序排在后面。
 */
const REALM_ORDER = ['tech', 'skills'];

/**
 * use AI 按产品要求先作为题库分类，只生成 problems 菜单，不生成学习路径。
 * 展示名称保留空格与 AI 大写，URL 仍由目录生成。
 */
const QUESTION_BANK_CATEGORY = '/tech/use-ai';

const compareByName = (left, right) => left.name.localeCompare(right.name);

const jsString = (value) => JSON.stringify(value);

const pathToRoute = (segments) => `/${segments.join('/')}`;

const toRouteSegment = (value) =>
  value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const stripPageFileExtension = (fileName) =>
  fileName.replace(pageFileExtensionPattern, '');

const isPageFile = (entry) =>
  entry.isFile() &&
  pageFileExtensionPattern.test(entry.name) &&
  !entry.name.endsWith('.d.ts');

const isIgnoredSegment = (segment) =>
  ignoredSegmentNames.has(segment.toLowerCase());

const toIdentifierPart = (value) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');

const createIdentifier = (segments, usedIdentifiers) => {
  const baseIdentifier = `${segments.map(toIdentifierPart).join('') || 'Demo'}Page`;
  let identifier = baseIdentifier;
  let suffix = 2;

  while (usedIdentifiers.has(identifier)) {
    identifier = `${baseIdentifier}${suffix}`;
    suffix += 1;
  }

  usedIdentifiers.add(identifier);

  return identifier;
};

const directoryExists = async (directory) => {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const readVisibleEntries = async (directory) => {
  const entries = await directoryExists(directory);

  return entries
    .filter((entry) => !entry.name.startsWith('.'))
    .sort(compareByName);
};

const createSegmentsForFile = (parentSegments, fileName) => {
  const fileSegment = stripPageFileExtension(fileName);

  if (fileSegment === 'index') {
    return parentSegments;
  }

  return [...parentSegments, fileSegment];
};

const collectPageFiles = async (directory, parentSegments = []) => {
  const entries = await readVisibleEntries(directory);
  const pageFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (isPageFile(entry)) {
      // 学习路径配置文件不是 demo 页面，只作为分类级元数据存在。
      if (
        stripPageFileExtension(entry.name).toLowerCase() === 'learning-path'
      ) {
        continue;
      }

      const segments = createSegmentsForFile(parentSegments, entry.name);

      if (
        segments.length > 0 &&
        segments.length <= 3 &&
        !segments.some((segment) => isIgnoredSegment(segment))
      ) {
        pageFiles.push({
          filePath: entryPath,
          isIndexFile: stripPageFileExtension(entry.name) === 'index',
          segments,
        });
      }

      continue;
    }

    if (
      entry.isDirectory() &&
      parentSegments.length < 3 &&
      !isIgnoredSegment(entry.name)
    ) {
      pageFiles.push(
        ...(await collectPageFiles(entryPath, [...parentSegments, entry.name])),
      );
    }
  }

  return pageFiles;
};

/**
 * 收集所有带学习路径配置的分类。
 *
 * 约定：分类目录（第二层，如 `pages/Tech/Express/`）下存在 `learning-path.ts`，
 * 就视为该分类提供「学习路径」总览，生成为其自动生成落地页路由与侧边栏入口。
 */
const collectLearningPathConfigs = async (pagesDir) => {
  const configs = [];

  for (const realmEntry of await readVisibleEntries(pagesDir)) {
    if (!realmEntry.isDirectory() || isIgnoredSegment(realmEntry.name)) {
      continue;
    }

    const realmDir = path.join(pagesDir, realmEntry.name);

    for (const categoryEntry of await readVisibleEntries(realmDir)) {
      if (
        !categoryEntry.isDirectory() ||
        isIgnoredSegment(categoryEntry.name)
      ) {
        continue;
      }

      const categoryEntries = await readVisibleEntries(
        path.join(realmDir, categoryEntry.name),
      );
      const hasLearningPath = categoryEntries.some(
        (entry) =>
          entry.isFile() &&
          stripPageFileExtension(entry.name).toLowerCase() === 'learning-path',
      );

      if (hasLearningPath) {
        configs.push({ realm: realmEntry.name, category: categoryEntry.name });
      }
    }
  }

  return configs;
};

const createImportPath = (filePath, projectRoot) => {
  const relativePath = path
    .relative(path.join(projectRoot, 'src'), filePath)
    .replaceAll(path.sep, '/')
    .replace(/\.(tsx|jsx|ts|js)$/, '');

  return `@/${relativePath}`;
};

const createRouteEntry = ({
  filePath,
  isIndexFile,
  label,
  menuKey,
  segments,
  topLevelKey,
  usedIdentifiers,
  projectRoot,
}) => ({
  importName: createIdentifier(segments, usedIdentifiers),
  importPath: createImportPath(filePath, projectRoot),
  isIndexFile,
  label,
  menuKey,
  path: pathToRoute(segments.map(toRouteSegment)),
  segments: segments.map(toRouteSegment),
  topLevelKey,
});

const compareSegments = (left, right) => {
  const segmentCount = Math.max(left.segments.length, right.segments.length);

  for (let index = 0; index < segmentCount; index += 1) {
    const leftSegment = left.segments[index];
    const rightSegment = right.segments[index];

    if (leftSegment === undefined) {
      return -1;
    }

    if (rightSegment === undefined) {
      return 1;
    }

    const segmentCompare = leftSegment.localeCompare(rightSegment);

    if (segmentCompare !== 0) {
      return segmentCompare;
    }
  }

  return left.importPath.localeCompare(right.importPath);
};

const realmOrderIndex = (segment) => {
  const index = REALM_ORDER.indexOf(segment);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const groupRoutesByTopLevel = (routes) => {
  const routeGroups = new Map();

  for (const route of routes) {
    const topLevelSegment = route.segments[0];

    if (!routeGroups.has(topLevelSegment)) {
      routeGroups.set(topLevelSegment, []);
    }

    routeGroups.get(topLevelSegment).push(route);
  }

  return [...routeGroups.entries()].sort(
    ([left], [right]) =>
      realmOrderIndex(left) - realmOrderIndex(right) ||
      left.localeCompare(right),
  );
};

const createSidebarMenus = (topLevelRoutes) => {
  const secondLevelRouteGroups = new Map();

  const getRouteGroup = (secondLevelSegment) => {
    if (!secondLevelRouteGroups.has(secondLevelSegment)) {
      secondLevelRouteGroups.set(secondLevelSegment, {
        route: null,
        thirdLevelRoutes: [],
      });
    }

    return secondLevelRouteGroups.get(secondLevelSegment);
  };

  for (const route of topLevelRoutes) {
    const [, secondLevelSegment] = route.segments;

    if (!secondLevelSegment) {
      continue;
    }

    const routeGroup = getRouteGroup(secondLevelSegment);

    if (route.segments.length === 2) {
      routeGroup.route = route;
      continue;
    }

    if (route.segments.length === 3) {
      routeGroup.thirdLevelRoutes.push(route);
    }
  }

  return [...secondLevelRouteGroups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([secondLevelSegment, routeGroup]) => {
      const { route, thirdLevelRoutes } = routeGroup;

      if (
        thirdLevelRoutes.length === 0 &&
        route &&
        route.label !== '学习路径'
      ) {
        return {
          key: route.menuKey,
          label: route.label,
          path: route.path,
        };
      }

      return {
        key: `group:${pathToRoute([topLevelRoutes[0].segments[0], secondLevelSegment])}`,
        label:
          pathToRoute([topLevelRoutes[0].segments[0], secondLevelSegment]) ===
          QUESTION_BANK_CATEGORY
            ? 'use AI'
            : secondLevelSegment,
        children: [
          ...(route
            ? [
                {
                  key: route.menuKey,
                  label: route.isIndexFile ? 'index' : route.label,
                  path: route.path,
                },
              ]
            : []),
          ...thirdLevelRoutes
            .filter((page) => !page.conceptOnly)
            .sort(compareSegments)
            .map((thirdLevelRoute) => ({
              key: thirdLevelRoute.menuKey,
              label: thirdLevelRoute.label,
              path: thirdLevelRoute.path,
            })),
        ],
      };
    });
};

const formatRoutes = (routes) => {
  if (routes.length === 0) {
    return '[]';
  }

  const routeBlocks = routes.map(
    (route) => `  {
    path: ${jsString(route.path)},
    menuKey: ${jsString(route.menuKey)},
    topLevelKey: ${jsString(route.topLevelKey)},
    label: ${jsString(route.label)},
    Component: ${route.importName},
  }`,
  );

  return `[\n${routeBlocks.join(',\n')},\n]`;
};

const formatMenuItems = (menuItems) => JSON.stringify(menuItems, null, 2);

const formatMenuMap = (menuMap) => JSON.stringify(menuMap, null, 2);

export const generateRoutes = async (projectRoot = rootDir) => {
  const pagesDir = path.join(projectRoot, 'src/pages');
  const outputFile = path.join(projectRoot, 'src/generated/routes.tsx');
  const usedIdentifiers = new Set();
  const usedRoutePaths = new Map();
  const routes = [];
  const headerMenus = [];
  const sidebarMenusByTopLevel = {};

  for (const pageFile of await collectPageFiles(pagesDir)) {
    const routeSegments = pageFile.segments.map(toRouteSegment);
    const topLevelKey = pathToRoute([routeSegments[0]]);
    const routePath = pathToRoute(routeSegments);
    const previousFilePath = usedRoutePaths.get(routePath);

    if (previousFilePath) {
      throw new Error(
        `Duplicate route "${routePath}" generated by ${path.relative(projectRoot, previousFilePath)} and ${path.relative(projectRoot, pageFile.filePath)}`,
      );
    }

    usedRoutePaths.set(routePath, pageFile.filePath);

    routes.push({
      ...createRouteEntry({
        filePath: pageFile.filePath,
        isIndexFile: pageFile.isIndexFile,
        label: routeSegments.at(-1),
        menuKey: pageFile.segments.length === 1 ? topLevelKey : routePath,
        segments: pageFile.segments,
        topLevelKey,
        usedIdentifiers,
        projectRoot,
      }),
      conceptOnly: /\bConceptPageLayout\b/.test(
        await readFile(pageFile.filePath, 'utf8'),
      ),
    });
  }

  // 学习大纲独立于 Demo 清单；use AI 题库按产品要求仅提供 problems。
  const configs = await collectLearningPathConfigs(pagesDir);
  const learningPaths = {};
  const categories = new Map();

  for (const route of routes) {
    if (route.segments[0] === 'skills' || route.segments.length !== 3) continue;
    const categoryPath = pathToRoute(route.segments.slice(0, 2));
    if (categoryPath === QUESTION_BANK_CATEGORY) continue;
    if (!categories.has(categoryPath)) categories.set(categoryPath, []);
    categories.get(categoryPath).push(route);
  }

  for (const config of configs) {
    if (toRouteSegment(config.realm) === 'skills') continue;
    const categoryPath = pathToRoute(
      [config.realm, config.category].map(toRouteSegment),
    );
    if (!categories.has(categoryPath)) categories.set(categoryPath, []);
  }

  const stepIds = new Set();
  for (const categoryPath of categories.keys()) {
    const config = configs.find(
      (item) =>
        pathToRoute([item.realm, item.category].map(toRouteSegment)) ===
        categoryPath,
    );
    if (!config) {
      throw new Error(
        `${categoryPath}: 请独立设计 learning-path.ts，不能从 Demo 列表生成学习路径`,
      );
    }
    const source = await readFile(
      path.join(pagesDir, config.realm, config.category, 'learning-path.ts'),
      'utf8',
    );
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    }).outputText;
    const loaded = await import(
      `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
    );
    const learningPath = structuredClone(loaded.learningPath);
    if (
      !learningPath?.label ||
      !learningPath.description ||
      !learningPath.steps?.length
    ) {
      throw new Error(
        `${categoryPath}: 学习路径必须包含名称、说明与独立学习阶段`,
      );
    }
    for (const step of learningPath.steps) {
      if (step.contentFile) {
        const categoryDirectory = path.join(
          pagesDir,
          config.realm,
          config.category,
        );
        const notePath = path.resolve(categoryDirectory, step.contentFile);
        if (
          !notePath.startsWith(`${categoryDirectory}${path.sep}`) ||
          !notePath.endsWith('.md')
        ) {
          throw new Error(
            `${categoryPath}: 笔记必须是本分类内的 Markdown 文件`,
          );
        }
        step.content = await readFile(notePath, 'utf8');
        delete step.contentFile;
      }

      if (
        !step.id ||
        stepIds.has(step.id) ||
        !['concept', 'lab'].includes(step.kind) ||
        !step.title ||
        !step.summary ||
        !step.content?.trim() ||
        'demo' in step ||
        'demoPath' in step
      ) {
        throw new Error(
          `${categoryPath}: 无效、重复或依赖 Demo 的学习阶段 ${step.id}`,
        );
      }
      stepIds.add(step.id);
    }
    learningPaths[categoryPath] = learningPath;
    if (usedRoutePaths.has(categoryPath))
      throw new Error(`学习路径路由冲突: ${categoryPath}`);
    routes.push({
      importName: 'CategoryLearningPathPage',
      importPath: '@/components/CategoryLearningPath',
      isIndexFile: false,
      label: '学习路径',
      menuKey: categoryPath,
      path: categoryPath,
      segments: categoryPath.split('/').filter(Boolean),
      topLevelKey: `/${categoryPath.split('/')[1]}`,
    });
  }

  const learningPathsFile = path.join(
    projectRoot,
    'src/generated/learning-paths.ts',
  );
  await mkdir(path.dirname(learningPathsFile), { recursive: true });
  const learningPathsOutput = await prettier.format(
    `/* eslint-disable */\n// Generated by pnpm gen:routes.\nexport const learningPaths = ${JSON.stringify(learningPaths)};\n`,
    { filepath: learningPathsFile },
  );
  const previousPaths = await readFile(learningPathsFile, 'utf8').catch(
    (error) => {
      if (error.code === 'ENOENT') return undefined;
      throw error;
    },
  );
  if (previousPaths !== learningPathsOutput) {
    await writeFile(learningPathsFile, learningPathsOutput);
  }

  routes.sort(compareSegments);

  for (const [topLevelSegment, topLevelRoutes] of groupRoutesByTopLevel(
    routes,
  )) {
    topLevelRoutes.sort(compareSegments);

    const topLevelKey = pathToRoute([topLevelSegment]);
    const topLevelRoute = topLevelRoutes.find(
      (route) => route.segments.length === 1,
    );

    headerMenus.push({
      key: topLevelKey,
      label: topLevelSegment,
      path: topLevelRoute?.path ?? topLevelRoutes[0].path,
      sidebarOnly: SIDEBAR_ONLY_REALMS.has(topLevelSegment),
    });

    sidebarMenusByTopLevel[topLevelKey] = createSidebarMenus(topLevelRoutes);
  }

  const seenImports = new Set();
  const lazyLines = [];

  for (const route of routes) {
    if (seenImports.has(route.importName)) {
      continue;
    }

    seenImports.add(route.importName);
    lazyLines.push(
      `const ${route.importName} = lazy(() => import(${jsString(route.importPath)}));`,
    );
  }

  const defaultRoutePath = headerMenus[0]?.path ?? routes[0]?.path ?? '';
  const output = `/* eslint-disable */
// This file is auto-generated by \`pnpm gen:routes\`.
import { lazy } from 'react';
import type { ComponentType } from 'react';
${lazyLines.length ? `\n${lazyLines.join('\n')}\n` : ''}
export type DemoRoute = {
  path: string;
  menuKey: string;
  topLevelKey: string;
  label: string;
  Component: ComponentType<any>;
};

export type DemoMenuItem = {
  key: string;
  label: string;
  path?: string;
  children?: DemoMenuItem[];
  /** 仅进侧边栏的领域（如 skills），不出现在 header 领域切换中。 */
  sidebarOnly?: boolean;
};

export const defaultRoutePath = ${jsString(defaultRoutePath)};

export const demoRoutes: DemoRoute[] = ${formatRoutes(routes)};

export const headerMenus: DemoMenuItem[] = ${formatMenuItems(headerMenus)};

export const sidebarMenusByTopLevel: Record<string, DemoMenuItem[]> = ${formatMenuMap(
    sidebarMenusByTopLevel,
  )};
`;

  // 统一经 prettier 格式化，保证 vite 插件（dev/build）与 `pnpm gen:routes`
  // 输出一致，避免每次生成产生格式差异。
  let finalOutput = output;

  try {
    finalOutput = await prettier.format(output, { filepath: outputFile });
  } catch {
    // 保持生成器原始输出，格式化失败不应阻断路由生成。
  }

  await mkdir(path.dirname(outputFile), { recursive: true });
  const previous = await readFile(outputFile, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  });

  if (previous !== finalOutput) {
    await writeFile(outputFile, finalOutput);
  }

  return {
    output: finalOutput,
    changed: previous !== finalOutput,
    count: routes.length,
    sidebarMenusByTopLevel,
  };
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const { count } = await generateRoutes();

  console.log(`Generated ${count} route(s) in src/generated/routes.tsx`);
}
