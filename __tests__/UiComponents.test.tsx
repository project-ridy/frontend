import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('기본 UI 컴포넌트', () => {
  it('Button variant와 click/disabled 상태를 처리한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const disabledClick = vi.fn();

    render(
      <div>
        <Button type="button" onClick={handleClick}>기본 버튼</Button>
        <Button type="button" variant="outline">보조 버튼</Button>
        <Button type="button" disabled onClick={disabledClick}>비활성 버튼</Button>
      </div>,
    );

    expect(screen.getByRole('button', { name: '기본 버튼' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: '보조 버튼' })).toHaveClass('border-border');

    await user.click(screen.getByRole('button', { name: '기본 버튼' }));
    await user.click(screen.getByRole('button', { name: '비활성 버튼' }));

    expect(handleClick).toHaveBeenCalledOnce();
    expect(disabledClick).not.toHaveBeenCalled();
  });

  it('Input은 label과 연결되고 입력 이벤트를 전달한다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <label htmlFor="company-name">
        회사명
        <Input id="company-name" onChange={handleChange} />
      </label>,
    );

    await user.type(screen.getByLabelText('회사명'), 'Ridy');

    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByLabelText('회사명')).toHaveValue('Ridy');
  });

  it('Card, Badge, Avatar fallback을 렌더링한다', () => {
    render(
      <Card role="region" aria-label="카풀 카드">
        <CardHeader>
          <CardTitle>카풀 카드</CardTitle>
          <CardDescription>디자인 시스템 카드</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">같은 회사</Badge>
          <Avatar>
            <AvatarFallback>리</AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>,
    );

    expect(screen.getByRole('region', { name: '카풀 카드' })).toBeInTheDocument();
    expect(screen.getByText('같은 회사')).toHaveClass('bg-secondary');
    expect(screen.getByText('리')).toBeInTheDocument();
  });

  it('Tabs는 기본 tablist와 선택된 content를 렌더링한다', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="passenger">
        <TabsList>
          <TabsTrigger value="passenger">탑승자</TabsTrigger>
          <TabsTrigger value="driver">차주</TabsTrigger>
        </TabsList>
        <TabsContent value="passenger">탑승자 화면</TabsContent>
        <TabsContent value="driver">차주 화면</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '탑승자' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('탑승자 화면')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '차주' }));

    expect(screen.getByRole('tab', { name: '차주' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('차주 화면')).toBeInTheDocument();
  });
});
