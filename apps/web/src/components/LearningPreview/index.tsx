import { Suspense } from 'react';
import { Center, Loader, Modal } from '@mantine/core';

import type { ComponentType } from 'react';

import { learningPreviews } from '@/generated/learning-previews';

import { LearningPreviewContext } from './Context';

/**
 * 学习预览弹窗的受控状态。
 */
type LearningPreviewProps = {
  /** 当前预览步骤的路径；null 表示关闭。 */
  path: string | null;
  /** 切换预览步骤。 */
  onChange: (path: string) => void;
  /** 关闭弹窗并保留总览进度。 */
  onClose: () => void;
};

/**
 * 在学习路径上预览概念与实验，关闭后仍停留在原来的总览位置。
 */
const LearningPreview = ({ path, onChange, onClose }: LearningPreviewProps) => {
  const Component = path
    ? (learningPreviews as Partial<Record<string, ComponentType>>)[path]
    : undefined;

  return (
    <Modal fullScreen onClose={onClose} opened={Boolean(path)} title="学习预览">
      {path ? (
        <LearningPreviewContext value={{ path, navigate: onChange }}>
          <Suspense
            fallback={
              <Center p="xl">
                <Loader />
              </Center>
            }
          >
            {Component ? <Component key={path} /> : null}
          </Suspense>
        </LearningPreviewContext>
      ) : null}
    </Modal>
  );
};

export default LearningPreview;
