import {
  ActionIcon,
  Group,
  Select,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconMoon,
  IconSun,
  IconTerminal2,
} from '@tabler/icons-react';

import type { DemoMenuItem } from '@/generated/routes';

import styles from './index.scss';

type HeaderProps = {
  activeRealmKey?: string;
  onRealmChange: (key: string) => void;
  realms: DemoMenuItem[];
};

const capitalize = (value: string) =>
  value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;

const Header = ({ activeRealmKey, onRealmChange, realms }: HeaderProps) => {
  const { setColorScheme } = useMantineColorScheme();
  const isDark = useComputedColorScheme('light') === 'dark';
  const realmData = realms.map((item) => ({
    label: capitalize(item.label),
    value: item.key,
  }));

  const handleRealmChange = (value: string) => {
    onRealmChange(value);
  };

  return (
    <Group className={styles.demoHeaderInner} gap="lg" h="100%" wrap="nowrap">
      <Group className={styles.demoHeaderBrand} gap="sm" wrap="nowrap">
        <span aria-hidden="true" className={styles.brandMark}>
          <IconTerminal2 size={19} stroke={2.1} />
        </span>
        <div className={styles.brandText}>
          <Title className={styles.demoTitle} order={1}>
            Study Lab
          </Title>
          <Text className={styles.brandTagline} component="span">
            fullstack demos
          </Text>
        </div>
      </Group>

      <Group gap="xs" ml="auto" wrap="nowrap">
        <Select
          aria-label="切换领域"
          className={styles.realmSelect}
          data={realmData}
          onChange={(value) => {
            if (value) {
              handleRealmChange(value);
            }
          }}
          placeholder="领域"
          radius="md"
          size="sm"
          value={activeRealmKey}
          w={120}
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
