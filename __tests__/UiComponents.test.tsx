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

  it('목적별 버튼 variant를 렌더링한다', () => {
    render(
      <div>
        <Button type="button">Primary</Button>
        <Button type="button" variant="secondary">Secondary</Button>
        <Button type="button" variant="ghost">Ghost</Button>
        <Button type="button" variant="destructive">Destructive</Button>
        <Button type="button" variant="action" aria-label="필터">F</Button>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveClass('border-primary');
    expect(screen.getByRole('button', { name: 'Ghost' })).toHaveClass('bg-transparent');
    expect(screen.getByRole('button', { name: 'Destructive' })).toHaveClass('bg-red-50');
    expect(screen.getByRole('button', { name: '필터' })).toHaveClass('min-h-11');
    expect(screen.getByRole('button', { name: '필터' })).toHaveClass('min-w-11');
  });

  it('모바일 주요 CTA touch target을 유지한다', () => {
    render(<Button type="button" size="lg">주요 CTA</Button>);

    expect(screen.getByRole('button', { name: '주요 CTA' })).toHaveClass('h-12');
  });

  it('disabled 버튼은 클릭되지 않는다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button type="button" disabled onClick={handleClick}>비활성 CTA</Button>);

    await user.click(screen.getByRole('button', { name: '비활성 CTA' }));

    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '비활성 CTA' })).toHaveClass('disabled:cursor-not-allowed');
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

  it('입력 필드 상태 class를 노출한다', () => {
    render(
      <div>
        <label htmlFor="default-input">기본</label>
        <Input id="default-input" />
        <label htmlFor="error-input">오류</label>
        <Input id="error-input" aria-invalid="true" />
        <label htmlFor="disabled-input">비활성</label>
        <Input id="disabled-input" disabled />
      </div>,
    );

    expect(screen.getByLabelText('기본')).toHaveClass('h-input');
    expect(screen.getByLabelText('기본')).toHaveClass('border-border-input');
    expect(screen.getByLabelText('기본')).toHaveClass('focus-visible:border-primary');
    expect(screen.getByLabelText('오류')).toHaveClass('aria-invalid:border-danger');
    expect(screen.getByLabelText('비활성')).toHaveClass('disabled:bg-gray-100');
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

  it('상태 badge variant를 상태 텍스트와 함께 렌더링한다', () => {
    render(
      <div>
        <Badge variant="open">OPEN</Badge>
        <Badge variant="matched">MATCHED</Badge>
        <Badge variant="pending">PENDING</Badge>
        <Badge variant="failed">FAILED</Badge>
        <Badge variant="cancelled">CANCELLED</Badge>
        <Badge variant="neutral">차량 정보</Badge>
      </div>,
    );

    expect(screen.getByText('OPEN')).toHaveClass('bg-blue-50');
    expect(screen.getByText('MATCHED')).toHaveClass('bg-green-50');
    expect(screen.getByText('PENDING')).toHaveClass('bg-orange-50');
    expect(screen.getByText('FAILED')).toHaveClass('bg-red-50');
    expect(screen.getByText('CANCELLED')).toHaveClass('bg-red-50');
    expect(screen.getByText('차량 정보')).toHaveClass('bg-gray-100');
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
