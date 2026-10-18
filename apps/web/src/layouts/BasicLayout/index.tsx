import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AppShell } from '@mantine/core';

import type { ReactNode } from 'react';

import {
  demoRoutes,
  headerMenus,
  sidebarMenusByTopLevel,
} from '@/generated/routes';
import Header from '@/layouts/Header';
import Sidebar from '@/layouts/Sidebar';

import styles from './index.scss';

type BasicLayoutProps = {
  children: ReactNode;
};

const BasicLayout = ({ children }: BasicLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  /*
   * 顶层分类即「领域」：headerMenus 每一项是一个领域（当前为 skills 与 tech，
   * 未来扩展 English 等新领域后该项列表随之增加）。所有领域都出现在 header
   * 的领域切换中；侧边栏仅展示当前领域下的分类菜单。
   */
  const visibleRealms = headerMenus.filter((realm) => !realm.sidebarOnly);
  const selectedRoute = useMemo(
    () => demoRoutes.find((route) => route.path === location.pathname),
    [location.pathname],
  );
  // 领域以当前路由为准：直接访问或切换领域路由时自动跟随，无需单独状态。
  const activeRealmKey = selectedRoute?.topLevelKey ?? visibleRealms[0]?.key;
  // 当前领域的分类（header 分类段，随领域切换整体替换）。
  const realmCategories = activeRealmKey
    ? (sidebarMenusByTopLevel[activeRealmKey] ?? [])
    : [];
  // 当前路由所属分类，用于 header 分类段高亮。
  const selectedCategoryKey =
    realmCategories.find(
      (item) =>
        item.children?.some((child) => child.key === selectedRoute?.menuKey),
    )?.key ?? realmCategories[0]?.key;
  // 侧边栏 = 当前领域下所选分类的 demo 列表（Skills 与 Tech 同级，只展示当前领域）。
  const sidebarMenus =
    realmCategories.find((item) => item.key === selectedCategoryKey)
      ?.children ?? [];

  const handleRealmChange = (key: string) => {
    const target = visibleRealms.find((item) => item.key === key);

    if (target?.path) {
      navigate(target.path);
    }
  };

  return (
    <AppShell
      className={styles.demoApp}
      header={{ height: 56 }}
      navbar={{ breakpoint: 'sm', width: 252 }}
      padding={0}
      withBorder={false}
    >
      <AppShell.Header className={styles.demoHeader}>
        <Header
          activeRealmKey={activeRealmKey}
          menus={realmCategories}
          onRealmChange={handleRealmChange}
          realms={visibleRealms}
          selectedTopLevelKey={selectedCategoryKey}
        />
      </AppShell.Header>

      <AppShell.Navbar className={styles.demoSidebar}>
        <Sidebar
          menus={sidebarMenus}
          routes={demoRoutes}
          sectionKey={selectedCategoryKey}
          selectedRoute={selectedRoute}
        />
      </AppShell.Navbar>

      <AppShell.Main className={styles.demoMain}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default BasicLayout;
