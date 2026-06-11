import React from 'react';
import { render, screen } from '@testing-library/react';
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

  it('클릭 시 onClick 핸들러가 호출된다', async () => {
    const handleClick = vi.fn();
    render(<MatchingCard {...defaultProps} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
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
