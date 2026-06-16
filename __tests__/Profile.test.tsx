import React from 'react';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import ProfilePage from '@/app/profile/page';
import { getAccessToken, saveAuthTokens } from '@/lib/auth/token-storage';
import { TestProviders } from '@/test/TestProviders';

const push = vi.fn();
const updateProfileMock = vi.fn();
const registerVehicleMock = vi.fn();
const updateVehicleMock = vi.fn();
const deleteVehicleMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const currentUser = {
  id: 'user-1',
  email: 'seoyeon@techstarter.test',
  name: '김서연',
  phone: '010-1234-5678',
  imageUrl: null,
  role: 'BOTH',
  employeeId: 'EMP-1004',
  companyId: 'company-1',
  rating: 4.8,
  rideCount: 42,
  company: {
    id: 'company-1',
    name: '테크스타터',
  },
  vehicles: [
    {
      id: 'vehicle-1',
      userId: 'user-1',
      model: '아이오닉 5',
      color: '블루',
      plate: '12가 3456',
      capacity: 4,
      createdAt: '2026-06-10T09:00:00.000Z',
    },
  ],
};

let vehicles = [...currentUser.vehicles];

const server = setupServer(
  graphql.query('Me', () => {
    return HttpResponse.json({ data: { me: currentUser } });
  }),
  graphql.query('MyVehicles', () => {
    return HttpResponse.json({ data: { myVehicles: vehicles } });
  }),
  graphql.mutation('UpdateProfile', ({ variables }) => {
    updateProfileMock(variables);

    return HttpResponse.json({
      data: {
        updateProfile: {
          ...currentUser,
          ...variables.input,
        },
      },
    });
  }),
  graphql.mutation('RegisterVehicle', ({ variables }) => {
    registerVehicleMock(variables);
    const vehicle = {
      id: 'vehicle-2',
      userId: 'user-1',
      createdAt: '2026-06-12T09:00:00.000Z',
      ...variables.input,
    };
    vehicles = [...vehicles, vehicle];

    return HttpResponse.json({ data: { registerVehicle: vehicle } });
  }),
  graphql.mutation('UpdateVehicle', ({ variables }) => {
    updateVehicleMock(variables);
    vehicles = vehicles.map((vehicle) =>
      vehicle.id === variables.id ? { ...vehicle, ...variables.input } : vehicle,
    );

    return HttpResponse.json({ data: { updateVehicle: vehicles[0] } });
  }),
  graphql.mutation('DeleteVehicle', ({ variables }) => {
    deleteVehicleMock(variables);
    vehicles = vehicles.filter((vehicle) => vehicle.id !== variables.id);

    return HttpResponse.json({ data: { deleteVehicle: true } });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  push.mockClear();
  updateProfileMock.mockClear();
  registerVehicleMock.mockClear();
  updateVehicleMock.mockClear();
  deleteVehicleMock.mockClear();
  vehicles = [...currentUser.vehicles];
});
afterAll(() => server.close());

function renderWithAuth(ui: React.ReactNode) {
  saveAuthTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  return render(<TestProviders>{ui}</TestProviders>);
}

describe('마이페이지', () => {
  it('프로필 요약과 차량 정보를 표시한다', async () => {
    renderWithAuth(<ProfilePage />);

    expect(await screen.findByRole('heading', { name: '마이페이지' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('lg:max-w-6xl');
    expect(await screen.findByLabelText('활동 요약')).toBeInTheDocument();
    expect(await screen.findByText('김서연')).toBeInTheDocument();
    expect(await screen.findByText('seoyeon@techstarter.test')).toBeInTheDocument();
    expect(screen.getByText('테크스타터')).toBeInTheDocument();
    expect(screen.getByText('평점 4.8')).toBeInTheDocument();
    expect(screen.getByText('42회 운행')).toBeInTheDocument();
    expect(screen.getByText('아이오닉 5')).toBeInTheDocument();
    expect(screen.getByText('12가 3456')).toBeInTheDocument();
  });

  it('차량이 없으면 단일 차량 등록 CTA를 표시한다', async () => {
    server.use(
      graphql.query('MyVehicles', () => {
        return HttpResponse.json({ data: { myVehicles: [] } });
      }),
    );

    renderWithAuth(<ProfilePage />);

    expect(await screen.findByText('등록된 차량이 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '차량 등록 준비하기' })).toBeInTheDocument();
  });

  it('프로필 수정 mutation을 호출한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ProfilePage />);

    await screen.findByText('김서연');
    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김리디');
    await user.clear(screen.getByLabelText('연락처'));
    await user.type(screen.getByLabelText('연락처'), '010-0000-1111');
    await user.selectOptions(screen.getByLabelText('역할'), 'DRIVER');
    await user.click(screen.getByRole('button', { name: '프로필 저장' }));

    expect(updateProfileMock).toHaveBeenCalledWith({
      input: expect.objectContaining({
        name: '김리디',
        phone: '010-0000-1111',
        role: 'DRIVER',
      }),
    });
    expect(await screen.findByText('프로필이 저장되었습니다.')).toBeInTheDocument();
  });

  it('차량 등록, 수정, 삭제 mutation을 호출한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ProfilePage />);

    await screen.findByText('아이오닉 5');
    await user.type(screen.getByLabelText('차량 모델'), '쏘나타');
    await user.type(screen.getByLabelText('차량 색상'), '화이트');
    await user.type(screen.getByLabelText('차량 번호'), '34나 5678');
    await user.clear(screen.getByLabelText('정원'));
    await user.type(screen.getByLabelText('정원'), '4');
    await user.click(screen.getByRole('button', { name: '차량 등록' }));

    expect(registerVehicleMock).toHaveBeenCalledWith({
      input: { model: '쏘나타', color: '화이트', plate: '34나 5678', capacity: 4 },
    });
    expect(await screen.findByText('차량 정보가 등록되었습니다.')).toBeInTheDocument();

    const vehicleCard = screen.getByTestId('vehicle-vehicle-1');
    await user.click(within(vehicleCard).getByRole('button', { name: '수정' }));
    await user.clear(screen.getByLabelText('차량 모델'));
    await user.type(screen.getByLabelText('차량 모델'), 'EV6');
    await user.click(screen.getByRole('button', { name: '차량 수정' }));

    expect(updateVehicleMock).toHaveBeenCalledWith({
      id: 'vehicle-1',
      input: expect.objectContaining({ model: 'EV6' }),
    });
    expect(await screen.findByText('차량 정보가 수정되었습니다.')).toBeInTheDocument();

    await user.click(within(vehicleCard).getByRole('button', { name: '삭제' }));

    expect(deleteVehicleMock).toHaveBeenCalledWith({ id: 'vehicle-1' });
    expect(await screen.findByText('차량 정보가 삭제되었습니다.')).toBeInTheDocument();
  });

  it('설정 토글과 로그아웃이 동작한다', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ProfilePage />);

    await screen.findByText('앱 설정');
    await user.click(screen.getByRole('switch', { name: '푸시 알림' }));
    await user.selectOptions(screen.getByLabelText('언어'), 'en');
    await user.selectOptions(screen.getByLabelText('테마'), 'dark');

    expect(screen.getByText('설정은 이 기기에서만 유지됩니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(getAccessToken()).toBeNull();
    expect(push).toHaveBeenCalledWith('/login');
    expect(screen.getByLabelText('위험 동작')).toBeInTheDocument();
  });

  it('조회 실패와 빈 차량 상태를 표시한다', async () => {
    server.use(
      graphql.query('Me', () => {
        return HttpResponse.json({ errors: [{ message: 'me failed' }] }, { status: 500 });
      }),
      graphql.query('MyVehicles', () => {
        return HttpResponse.json({ data: { myVehicles: [] } });
      }),
    );

    renderWithAuth(<ProfilePage />);

    expect(await screen.findByText('프로필 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });
});
