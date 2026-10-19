import { useState } from 'react';
import {
  Button,
  Group,
  SegmentedControl,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import KnowledgeReader from '@/components/KnowledgeDialog/Reader';

import { useReaderViewport } from './hooks/useReaderViewport';
import {
  INTRODUCTION,
  PRACTICE,
  QUESTION_CATEGORIES,
  QUESTIONS,
} from './constants';

import styles from './index.scss';

/**
 * AI 使用面试题库：按主题与全文关键词筛选，复用统一知识阅读器。
 */
const UseAi = () => {
  const viewportRef = useReaderViewport();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const keywords = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const questions = QUESTIONS.filter(
    (question) =>
      (category === 'all' || question.category === category) &&
      keywords.every((keyword) =>
        question.content.toLocaleLowerCase().includes(keyword),
      ),
  );
  const content = [
    INTRODUCTION,
    ...QUESTION_CATEGORIES.flatMap((group) => {
      const matches = questions.filter(
        (question) => question.category === group.value,
      );

      return matches.length > 0
        ? [
            `## ${group.label}\n\n${matches.map((question) => question.content).join('\n\n')}`,
          ]
        : [];
    }),
    PRACTICE,
  ].join('\n\n');

  return (
    <div className={styles.shell} ref={viewportRef}>
      <header className={styles.header}>
        <Title order={1}>AI 使用面试题与参考答案</Title>
        <Text c="dimmed">
          从需求实现、代码验证和知识问答，到 Agent 与 PR Review，练习用证据说明
          AI 的实际效果。
        </Text>
      </header>
      <section aria-label="题库筛选" className={styles.filters}>
        <SegmentedControl
          aria-label="题目主题"
          className={styles.topics}
          data={[{ value: 'all', label: '全部问题' }, ...QUESTION_CATEGORIES]}
          onChange={setCategory}
          value={category}
        />
        <TextInput
          className={styles.search}
          label="搜索问题与答案"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="例如：误报、测试、上下文"
          type="search"
          value={query}
        />
        <Text aria-live="polite" role="status" size="sm">
          显示 {questions.length} / {QUESTIONS.length} 题
        </Text>
      </section>
      <div className={styles.reader}>
        {questions.length > 0 ? (
          <KnowledgeReader
            contained
            content={content}
            key={`${category}:${query.trim()}`}
          />
        ) : (
          <Group className={styles.empty} gap="md">
            <Text>没有匹配的问题，试试其他关键词或查看全部题目。</Text>
            <Button
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
              variant="light"
            >
              重置筛选
            </Button>
          </Group>
        )}
      </div>
    </div>
  );
};

export default UseAi;
