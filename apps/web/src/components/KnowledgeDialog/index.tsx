import { Modal, Text } from '@mantine/core';

import type { KnowledgeDialogProps } from './types';

import KnowledgeReader from './Reader';

import styles from './index.scss';

/**
 * Demo 知识讲解与学习阶段共用的全屏阅读弹窗。
 */
const KnowledgeDialog = ({
  content,
  title,
  subtitle = 'Markdown',
  opened,
  onClose,
  footer,
}: KnowledgeDialogProps) => (
  <Modal
    classNames={{
      body: styles.modalBody,
      content: styles.modalContent,
      header: styles.modalHeader,
    }}
    fullScreen
    onClose={onClose}
    opened={opened}
    title={
      <div className={styles.modalTitle}>
        <strong>{title}</strong>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </div>
    }
  >
    <KnowledgeReader content={content} footer={footer} key={content} />
  </Modal>
);

export default KnowledgeDialog;
