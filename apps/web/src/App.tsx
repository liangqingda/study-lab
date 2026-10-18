import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { defaultRoutePath, demoRoutes } from '@/generated/routes';
import BasicLayout from '@/layouts/BasicLayout';
import EmptyRoutes from '@/pages/Errors/EmptyRoutes';
import NotFound from '@/pages/Errors/NotFound';

/*
 * 落地页固定指向 tech 领域第一条路由（而非 routes[0]），避免新增
 * 排序在 tech 之前的领域（如 /skill 文档页）时默认首页被替换。
 */
const TECH_TOP_LEVEL = '/tech';

const defaultLandingPath =
  demoRoutes.find((route) => route.topLevelKey === TECH_TOP_LEVEL)?.path ??
  defaultRoutePath;

const DemoRoutes = () => {
  if (demoRoutes.length === 0) {
    return <EmptyRoutes />;
  }

  return (
    <Routes>
      <Route element={<Navigate replace to={defaultLandingPath} />} path="/" />
      {demoRoutes.map(({ Component, path }) => (
        <Route element={<Component />} key={path} path={path} />
      ))}
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <BasicLayout>
      <Suspense fallback={null}>
        <DemoRoutes />
      </Suspense>
    </BasicLayout>
  </BrowserRouter>
);

export default App;
