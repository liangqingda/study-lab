import { useMemo, useState } from 'react';
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
   * 顶层分类即「领域」：headerMenus 每一项是一个领域（当前仅 tech，
   * 未来扩展 English 等新领域后该项列表随之增加）。
   */
  const realms = headerMenus;
  const [activeRealmKey, setActiveRealmKey] = useState<string | undefined>(
    () => realms[0]?.key,
  );
  const selectedRoute = useMemo(
    () => demoRoutes.find((route) => route.path === location.pathname),
    [location.pathname],
  );
  const sidebarMenus = activeRealmKey
    ? (sidebarMenusByTopLevel[activeRealmKey] ?? [])
    : [];
  // header 分类段 = 当前领域的分类分组（随领域切换整体替换）。
  const realmCategories = sidebarMenus;
  // 当前路由所属分类，用于 header 分类段高亮。
  const selectedCategoryKey =
    realmCategories.find(
      (item) =>
        item.children?.some((child) => child.key === selectedRoute?.menuKey),
    )?.key ?? realmCategories[0]?.key;

  const handleRealmChange = (key: string) => {
    setActiveRealmKey(key);
    const target = realms.find((item) => item.key === key);

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
          activeMenuKey={selectedCategoryKey}
          activeRealmKey={activeRealmKey}
          menus={realmCategories}
          onRealmChange={handleRealmChange}
          realms={realms}
        />
      </AppShell.Header>

      <AppShell.Navbar className={styles.demoSidebar}>
        <Sidebar
          menus={sidebarMenus}
          routes={demoRoutes}
          sectionKey={activeRealmKey}
          selectedRoute={selectedRoute}
        />
      </AppShell.Navbar>

      <AppShell.Main className={styles.demoMain}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default BasicLayout;
