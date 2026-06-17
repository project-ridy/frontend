import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('FE-KT-002 KT UI primitives', () => {
  it('버튼과 입력이 KT touch target과 focus 스타일을 제공한다', () => {
    render(
      <div>
        <Button type="button">출근 카풀 찾기</Button>
        <label htmlFor="departure">출발지</label>
        <Input id="departure" />
      </div>,
    );

    expect(screen.getByRole('button', { name: '출근 카풀 찾기' })).toHaveClass('min-h-11');
    expect(screen.getByRole('button', { name: '출근 카풀 찾기' })).toHaveClass('rounded-ridy-md');
    expect(screen.getByRole('button', { name: '출근 카풀 찾기' })).toHaveClass('focus-visible:ring-primary/30');
    expect(screen.getByRole('button', { name: '출근 카풀 찾기' })).toHaveClass('duration-fast');
    expect(screen.getByLabelText('출발지')).toHaveClass('h-input');
    expect(screen.getByLabelText('출발지')).toHaveClass('min-h-11');
    expect(screen.getByLabelText('출발지')).toHaveClass('focus-visible:ring-primary/30');
  });

  it('disabled action은 opacity만이 아니라 상태 텍스트를 연결할 수 있다', () => {
    render(
      <div>
        <Button type="button" disabled aria-describedby="cta-disabled-reason">
          탑승 요청
        </Button>
        <p id="cta-disabled-reason">잔여 좌석이 없어 요청할 수 없습니다.</p>
      </div>,
    );

    expect(screen.getByRole('button', { name: '탑승 요청' })).toHaveAttribute(
      'aria-describedby',
      'cta-disabled-reason',
    );
    expect(screen.getByRole('button', { name: '탑승 요청' })).toHaveClass('disabled:bg-gray-100');
    expect(screen.getByRole('button', { name: '탑승 요청' })).toHaveClass('disabled:text-text-tertiary-on-muted');
    expect(screen.getByText('잔여 좌석이 없어 요청할 수 없습니다.')).toBeInTheDocument();
  });

  it('Card와 Badge가 KT radius/elevation/metadata token을 사용한다', () => {
    render(
      <Card role="region" aria-label="카풀 요약">
        <CardHeader>
          <CardTitle>판교행 카풀</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="neutral">동승 가능</Badge>
        </CardContent>
      </Card>,
    );

    expect(screen.getByRole('region', { name: '카풀 요약' })).toHaveClass('rounded-ridy-lg');
    expect(screen.getByRole('region', { name: '카풀 요약' })).toHaveClass('shadow-1');
    expect(screen.getByText('동승 가능')).toHaveClass('bg-surface-secondary');
    expect(screen.getByText('동승 가능')).toHaveClass('text-text-secondary');
    expect(screen.getByText('동승 가능')).toHaveClass('rounded-pill');
  });

  it('line tab은 pill indicator와 44px 터치 높이를 유지한다', () => {
    render(
      <Tabs defaultValue="passenger">
        <TabsList variant="line">
          <TabsTrigger value="passenger">탑승자</TabsTrigger>
          <TabsTrigger value="driver">차주</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: '탑승자' })).toHaveClass('min-h-11');
    expect(screen.getByRole('tab', { name: '탑승자' })).toHaveClass('after:rounded-pill');
    expect(screen.getByRole('tab', { name: '탑승자' })).toHaveClass('focus-visible:ring-primary/30');
  });
});
