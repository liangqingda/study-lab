import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook2 } from '@tabler/icons-react';

import type { DemoKnowledgeDialogProps } from './types';

import KnowledgeDialog from '@/components/KnowledgeDialog';

/**
 * Demo 页的知识点讲解按钮，通过共享阅读弹窗展示内容。
 */
const DemoKnowledgeDialog = ({
  content,
  demoName,
}: DemoKnowledgeDialogProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        leftSection={<IconBook2 size={16} />}
        onClick={open}
        size="sm"
        variant="default"
      >
        知识点讲解
      </Button>
      <KnowledgeDialog
        content={content}
        onClose={close}
        opened={opened}
        title={`${demoName} · 知识点讲解`}
      />
    </>
  );
};

export default DemoKnowledgeDialog;
