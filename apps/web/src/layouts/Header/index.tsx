import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ActionIcon,
  Group,
  Menu,
  SegmentedControl,
  Text,
  Title,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBook,
  IconBrandGithub,
  IconCheck,
  IconChevronDown,
  IconMoon,
  IconStack,
  IconSun,
  IconTerminal2,
} from '@tabler/icons-react';

import type { ReactNode } from 'react';

import type { DemoMenuItem } from '@/generated/routes';

import styles from './index.scss';

type HeaderProps = {
  activeRealmKey?: string;
  menus: DemoMenuItem[];
  onRealmChange: (key: string) => void;
  realms: DemoMenuItem[];
  selectedTopLevelKey?: string;
};

const capitalize = (value: string) =>
  value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;

/** 每个领域（顶层大类）在切换器里的图标与副文案。 */
const REALM_META: Record<
  string,
  { icon: ReactNode; hint: string } | undefined
> = {
  '/tech': { icon: <IconStack size={15} stroke={1.9} />, hint: '技术学习 Demo' },
  '/skills': { icon: <IconBook size={15} stroke={1.9} />, hint: 'Agent Skill 文档' },
};

type RealmSwitcherProps = {
  activeRealmKey?: string;
  onRealmChange: (key: string) => void;
  realms: DemoMenuItem[];
};

/**
 * 顶层领域切换器：以「胶囊按钮 + 图标 + 当前领域」展示，点击展开领域下拉，
 * 每项带图标与说明，并标记当前项。替代原先的普通 Select。
 */
const RealmSwitcher = ({
  activeRealmKey,
  onRealmChange,
  realms,
}: RealmSwitcherProps) => {
  const [opened, setOpened] = useState(false);
  const active = realms.find((realm) => realm.key === activeRealmKey);

  return (
    <Menu
      onChange={setOpened}
      opened={opened}
      position="bottom-end"
      shadow="md"
      width={232}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          aria-haspopup="menu"
          aria-label="切换领域"
          className={styles.realmSwitcher}
          data-active={Boolean(active)}
        >
          <span aria-hidden="true" className={styles.realmSwitcherIcon}>
            {active ? REALM_META[active.key]?.icon : null}
          </span>
          <span className={styles.realmSwitcherLabel}>
            {active ? capitalize(active.label) : '领域'}
          </span>
          <IconChevronDown
            aria-hidden="true"
            className={styles.realmSwitcherChevron}
            data-open={opened}
            size={14}
            stroke={2}
          />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {realms.map((realm) => {
          const meta = REALM_META[realm.key];
          const isActive = realm.key === activeRealmKey;

          return (
            <Menu.Item
              key={realm.key}
              leftSection={meta?.icon}
              onClick={() => onRealmChange(realm.key)}
              rightSection={
                isActive ? (
                  <IconCheck className={styles.realmItemCheck} size={15} />
                ) : undefined
              }
            >
              <Group gap={10} wrap="nowrap">
                <Text fw={500} size="sm">
                  {capitalize(realm.label)}
                </Text>
                {meta?.hint ? (
                  <Text className={styles.realmItemHint} size="xs">
                    {meta.hint}
                  </Text>
                ) : null}
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

const Header = ({
  activeRealmKey,
  menus,
  onRealmChange,
  realms,
  selectedTopLevelKey,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const isDark = useComputedColorScheme('light') === 'dark';
  const activeMenuKey = selectedTopLevelKey ?? menus[0]?.key;
  const menuData = menus.map((item) => ({
    label: item.label,
    value: item.key,
  }));

  const handleMenuChange = (value: string) => {
    const nextMenu = menus.find((item) => item.key === value);
    const targetPath = nextMenu?.path ?? nextMenu?.children?.[0]?.path;

    if (targetPath) {
      navigate(targetPath);
    }
  };

  // 当前领域的默认页：headerMenus 里领域项的 path 即该大类的落地页。
  const activeRealm = realms.find((realm) => realm.key === activeRealmKey);
  const brandTarget = activeRealm?.path ?? realms[0]?.path ?? '/';

  const handleBrandClick = () => navigate(brandTarget);

  const handleRealmChange = (value: string | null) => {
    if (value) {
      onRealmChange(value);
    }
  };

  return (
    <Group className={styles.demoHeaderInner} gap="lg" h="100%" wrap="nowrap">
      <UnstyledButton
        className={styles.demoHeaderBrand}
        onClick={handleBrandClick}
        title="回到当前领域首页"
      >
        <Group gap="sm" wrap="nowrap">
          <span aria-hidden="true" className={styles.brandMark}>
            <IconTerminal2 size={19} stroke={2.1} />
          </span>
          <div className={styles.brandText}>
            <Title className={styles.demoTitle} order={1}>
              Study Lab
            </Title>
          </div>
        </Group>
      </UnstyledButton>

      {activeMenuKey && menuData.length > 0 ? (
        <nav aria-label="Demo sections" className={styles.demoHeaderMenu}>
          <SegmentedControl
            className={styles.demoHeaderSegments}
            color="teal"
            data={menuData}
            onChange={handleMenuChange}
            radius="md"
            size="sm"
            value={activeMenuKey}
          />
        </nav>
      ) : null}

      <Group gap="xs" ml="auto" wrap="nowrap">
        <RealmSwitcher
          activeRealmKey={activeRealmKey}
          onRealmChange={handleRealmChange}
          realms={realms}
        />
        <ActionIcon
          aria-label="查看源码仓库"
          className={styles.githubLink}
          component="a"
          href="https://github.com/liangqingda/study-lab"
          size="lg"
          target="_blank"
          title="查看源码仓库"
          variant="subtle"
        >
          <IconBrandGithub size={20} />
        </ActionIcon>
        <ActionIcon
          aria-label={isDark ? '切换到亮色主题' : '切换到暗色主题'}
          className={styles.themeToggle}
          onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
          size="lg"
          title={isDark ? '切换到亮色主题' : '切换到暗色主题'}
          variant="subtle"
        >
          {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Group>
    </Group>
  );
};

export default Header;
