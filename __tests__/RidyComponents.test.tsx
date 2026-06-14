import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { MatchingCard } from '@/components/ridy/MatchingCard';
import { RouteInput } from '@/components/ridy/RouteInput';

describe('MatchingCard', () => {
  const defaultProps = {
    driverName: '김민수',
    departure: '강남역',
    destination: '판교역',
    departureTime: '08:30',
    estimatedFare: '5,000원',
    availableSeats: 3,
  };

  it('운전자 이름, 출발지/도착지, 시간, 요금, 잔여석을 렌더링한다', () => {
    render(<MatchingCard {...defaultProps} />);

    expect(screen.getByText('김민수')).toBeInTheDocument();
    expect(screen.getByText('강남역')).toBeInTheDocument();
    expect(screen.getByText('판교역')).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText('5,000원')).toBeInTheDocument();
    expect(screen.getByText('3석')).toBeInTheDocument();
  });

  it('클릭 가능한 카드에 button role과 디자인 시스템 class를 적용한다', () => {
    render(<MatchingCard {...defaultProps} onClick={vi.fn()} />);

    const card = screen.getByRole('button');

    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('클릭 시 onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<MatchingCard {...defaultProps} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('Enter와 Space 키로 onClick 핸들러를 호출한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<MatchingCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('onClick이 없어도 카드 내용을 렌더링하고 button role을 강제하지 않는다', () => {
    render(<MatchingCard {...defaultProps} availableSeats={1} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('1석')).toBeInTheDocument();
  });
});

describe('RouteInput', () => {
  it('출발지와 도착지 입력 필드를 렌더링한다', () => {
    render(<RouteInput />);

    expect(screen.getByPlaceholderText('출발지')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('도착지')).toBeInTheDocument();
  });

  it('출발지와 도착지 값을 표시한다', () => {
    render(
      <RouteInput departure="강남역" destination="판교역" />,
    );

    expect(screen.getByDisplayValue('강남역')).toBeInTheDocument();
    expect(screen.getByDisplayValue('판교역')).toBeInTheDocument();
  });

  it('onChange 핸들러가 호출된다', async () => {
    const handleChange = vi.fn();
    render(<RouteInput onDepartureChange={handleChange} />);

    await userEvent.type(screen.getByPlaceholderText('출발지'), '역');
    expect(handleChange).toHaveBeenCalled();
  });

  it('출발지와 도착지 변경 핸들러를 각각 호출한다', async () => {
    const user = userEvent.setup();
    const handleDepartureChange = vi.fn();
    const handleDestinationChange = vi.fn();

    render(
      <RouteInput
        onDepartureChange={handleDepartureChange}
        onDestinationChange={handleDestinationChange}
      />,
    );

    await user.type(screen.getByLabelText('출발지'), '강남');
    await user.type(screen.getByLabelText('도착지'), '판교');

    expect(handleDepartureChange).toHaveBeenCalled();
    expect(handleDestinationChange).toHaveBeenCalled();
  });

  it('입력 필드에 디자인 시스템 input 높이 class를 적용한다', () => {
    render(<RouteInput />);

    expect(screen.getByLabelText('출발지')).toHaveClass('h-input');
    expect(screen.getByLabelText('도착지')).toHaveClass('h-input');
  });
});

describe('BottomNavigation', () => {
  const tabs = [
    { id: 'home', label: '홈', icon: 'home' as const },
    { id: 'search', label: '검색', icon: 'search' as const },
    { id: 'chat', label: '채팅', icon: 'chat' as const },
    { id: 'profile', label: '프로필', icon: 'profile' as const },
  ];

  it('4개 탭을 렌더링한다', () => {
    render(<BottomNavigation tabs={tabs} activeTab="home" onTabChange={vi.fn()} />);

    expect(screen.getByLabelText('홈')).toBeInTheDocument();
    expect(screen.getByLabelText('검색')).toBeInTheDocument();
    expect(screen.getByLabelText('채팅')).toBeInTheDocument();
    expect(screen.getByLabelText('프로필')).toBeInTheDocument();
  });

  it('nav landmark와 list 구조를 렌더링한다', () => {
    render(<BottomNavigation tabs={tabs} activeTab="home" onTabChange={vi.fn()} />);

    const nav = screen.getByRole('navigation', { name: '하단 내비게이션' });

    expect(nav).toHaveClass('fixed');
    expect(within(nav).getAllByRole('listitem')).toHaveLength(4);
  });

  it('활성 탭에 aria-current를 설정한다', () => {
    render(<BottomNavigation tabs={tabs} activeTab="home" onTabChange={vi.fn()} />);

    expect(screen.getByLabelText('홈')).toHaveAttribute('aria-current', 'page');
  });

  it('탭 클릭 시 onTabChange가 호출된다', async () => {
    const handleTabChange = vi.fn();
    render(<BottomNavigation tabs={tabs} activeTab="home" onTabChange={handleTabChange} />);

    await userEvent.click(screen.getByLabelText('채팅'));
    expect(handleTabChange).toHaveBeenCalledWith('chat');
  });
});
