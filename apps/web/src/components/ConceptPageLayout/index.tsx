import { Text, Title } from '@mantine/core';

import type { ReactNode } from 'react';

import LearningPathControls from '@/components/LearningPathControls';

import styles from './index.scss';

type ConceptPageLayoutProps = {
  /** 页面 H1 标题。 */
  title: string;
  /** 页面副标题，展示在标题下方。 */
  description: string;
  /** 页面主体内容（概念讲解），放在页头下方。 */
  children: ReactNode;
};

/**
 * 概念介绍页的共用布局：统一内容宽度、页头与学习路径控件。
 *
 * 用于学习路径中的「概念」步骤页面（讲解型，没有可运行的实验与代码结构），
 * 因此不展示“代码结构/知识点讲解”弹窗入口；顶部仍保留学习路径控件，
 * 便于标记完成与熟练度、在模块内上/下跳转。
 */
const ConceptPageLayout = ({
  title,
  description,
  children,
}: ConceptPageLayoutProps) => (
  <div className={styles.shell}>
    <header className={styles.header}>
      <div>
        <Title order={1}>{title}</Title>
        <Text c="dimmed">{description}</Text>
      </div>
    </header>
    <LearningPathControls />
    <div className={styles.content}>{children}</div>
  </div>
);

export default ConceptPageLayout;
