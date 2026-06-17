'use client';

import { Bell, Car, LogOut, Settings, ShieldAlert, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { BottomNavigation } from '@/components/ridy/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useDeleteVehicleMutation,
  useMeQuery,
  useMyVehiclesQuery,
  useRegisterVehicleMutation,
  useUpdateProfileMutation,
  useUpdateVehicleMutation,
} from '@/hooks/useProfileQueries';
import { clearAuthTokens } from '@/lib/auth/token-storage';
import { profileInitial, roleLabel, vehicleCapacityLabel } from '@/lib/profile-format';
import type { MyVehiclesQuery, Role } from '@/src/graphql/generated/graphql';

const bottomTabs = [
  { id: 'home', label: '홈', icon: 'home' as const },
  { id: 'search', label: '검색', icon: 'search' as const },
  { id: 'chat', label: '채팅', icon: 'chat' as const },
  { id: 'profile', label: '내 정보', icon: 'profile' as const },
];

const roleOptions: ReadonlyArray<{ value: Role; label: string }> = [
  { value: 'PASSENGER', label: '탑승자' },
  { value: 'DRIVER', label: '차주' },
  { value: 'BOTH', label: '탑승자·차주' },
];

type Vehicle = MyVehiclesQuery['myVehicles'][number];

interface ProfileFormState {
  name: string;
  phone: string;
  imageUrl: string;
  employeeId: string;
  role: Role;
}

interface VehicleFormState {
  model: string;
  color: string;
  plate: string;
  capacity: string;
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  phone: '',
  imageUrl: '',
  employeeId: '',
  role: 'PASSENGER',
};

const emptyVehicleForm: VehicleFormState = {
  model: '',
  color: '',
  plate: '',
  capacity: '4',
};

export default function ProfilePage() {
  const router = useRouter();
  const meQuery = useMeQuery();
  const vehiclesQuery = useMyVehiclesQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const registerVehicleMutation = useRegisterVehicleMutation();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const deleteVehicleMutation = useDeleteVehicleMutation();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(emptyVehicleForm);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [matchingEnabled, setMatchingEnabled] = useState(true);
  const [settlementEnabled, setSettlementEnabled] = useState(true);
  const [language, setLanguage] = useState('ko');
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    setProfileForm({
      name: meQuery.data.name,
      phone: meQuery.data.phone ?? '',
      imageUrl: meQuery.data.imageUrl ?? '',
      employeeId: meQuery.data.employeeId ?? '',
      role: meQuery.data.role === 'ADMIN' ? 'PASSENGER' : meQuery.data.role,
    });
  }, [meQuery.data]);

  const handleTabChange = (tabId: string) => {
    const routes: Record<string, string> = {
      home: '/',
      search: '/matchings',
      chat: '/chat',
      profile: '/profile',
    };

    router.push(routes[tabId] ?? '/');
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      await updateProfileMutation.mutateAsync({
        input: {
          name: profileForm.name,
          phone: nullableText(profileForm.phone),
          imageUrl: nullableText(profileForm.imageUrl),
          employeeId: nullableText(profileForm.employeeId),
          role: profileForm.role,
        },
      });
      setMessage('프로필이 저장되었습니다.');
    } catch {
      setMessage('프로필 저장에 실패했습니다.');
    }
  };

  const handleVehicleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const input = {
      model: vehicleForm.model,
      color: nullableText(vehicleForm.color),
      plate: vehicleForm.plate,
      capacity: Number(vehicleForm.capacity),
    };

    try {
      if (editingVehicleId) {
        await updateVehicleMutation.mutateAsync({ id: editingVehicleId, input });
        setMessage('차량 정보가 수정되었습니다.');
      } else {
        await registerVehicleMutation.mutateAsync({ input });
        setMessage('차량 정보가 등록되었습니다.');
      }

      setVehicleForm(emptyVehicleForm);
      setEditingVehicleId(null);
    } catch {
      setMessage(editingVehicleId ? '차량 정보 수정에 실패했습니다.' : '차량 정보 등록에 실패했습니다.');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      model: vehicle.model,
      color: vehicle.color ?? '',
      plate: vehicle.plate,
      capacity: String(vehicle.capacity),
    });
  };

  const handleDeleteVehicle = async (id: string) => {
    setMessage(null);

    try {
      await deleteVehicleMutation.mutateAsync({ id });
      setMessage('차량 정보가 삭제되었습니다.');
    } catch {
      setMessage('차량 정보 삭제에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    router.push('/login');
  };

  const user = meQuery.data;
  const vehicles = vehiclesQuery.data ?? [];

  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-muted px-page-mobile pb-36 pt-5 sm:px-page-tablet lg:max-w-6xl lg:px-page-desktop lg:pb-page-desktop">
        <header aria-label="마이페이지 헤더">
          <p className="text-small font-medium text-text-tertiary-on-muted">내 카풀 활동 관리</p>
          <h1 className="mt-1 text-h2 text-text-primary">마이페이지</h1>
        </header>

        {meQuery.isPending ? <ProfileLoading /> : null}
        {meQuery.isError ? <ProfileError onRetry={() => void meQuery.refetch()} /> : null}
        {user ? <ProfileSummary user={user} /> : null}

        {user ? (
          <ProfileForm form={profileForm} setForm={setProfileForm} onSubmit={handleProfileSubmit} />
        ) : null}

        <VehicleSection
          vehicles={vehicles}
          isLoading={vehiclesQuery.isPending}
          isError={vehiclesQuery.isError}
          role={user?.role ?? 'PASSENGER'}
          form={vehicleForm}
          setForm={setVehicleForm}
          editingVehicleId={editingVehicleId}
          onSubmit={handleVehicleSubmit}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          onRetry={() => void vehiclesQuery.refetch()}
        />

        <SettingsSection
          pushEnabled={pushEnabled}
          matchingEnabled={matchingEnabled}
          settlementEnabled={settlementEnabled}
          language={language}
          theme={theme}
          setPushEnabled={setPushEnabled}
          setMatchingEnabled={setMatchingEnabled}
          setSettlementEnabled={setSettlementEnabled}
          setLanguage={setLanguage}
          setTheme={setTheme}
        />

        {message ? (
          <p className="mt-4 rounded-ridy-lg bg-primary-subtle px-4 py-3 text-caption font-medium text-primary">
            {message}
          </p>
        ) : null}

        <AccountSection onLogout={handleLogout} />
      </main>

      <BottomNavigation tabs={bottomTabs} activeTab="profile" onTabChange={handleTabChange} />
    </AuthGuard>
  );
}

function ProfileSummary({ user }: { user: NonNullable<ReturnType<typeof useMeQuery>['data']> }) {
  return (
    <Card className="mt-5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16" size="lg">
            {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={`${user.name} 프로필 사진`} /> : null}
            <AvatarFallback className="bg-primary/10 text-h3 font-semibold text-primary">
              {profileInitial(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-h3 text-text-primary">{user.name}</p>
              <Badge variant="secondary">{roleLabel(user.role)}</Badge>
            </div>
            <p className="mt-1 truncate text-caption text-text-tertiary">{user.email}</p>
            <p className="mt-1 text-caption text-text-tertiary">{user.company?.name ?? '회사 정보 없음'}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-caption">
          <div className="rounded-ridy-md bg-surface-secondary px-2 py-3">
            <p className="font-semibold text-text-primary">평점 {user.rating.toFixed(1)}</p>
            <p className="mt-1 text-text-tertiary">받은 평가</p>
          </div>
          <div className="rounded-ridy-md bg-surface-secondary px-2 py-3">
            <p className="font-semibold text-text-primary">{user.rideCount}회 운행</p>
            <p className="mt-1 text-text-tertiary">누적 활동</p>
          </div>
          <div className="rounded-ridy-md bg-surface-secondary px-2 py-3">
            <p className="font-semibold text-text-primary">{user.employeeId ?? '-'}</p>
            <p className="mt-1 text-text-tertiary">사번</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileForm({
  form,
  setForm,
  onSubmit,
}: {
  form: ProfileFormState;
  setForm: (form: ProfileFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mt-5" aria-labelledby="profile-edit-heading">
      <div className="mb-3 flex items-center gap-2">
        <UserRound aria-hidden="true" size={18} className="text-text-tertiary-on-muted" />
        <h2 id="profile-edit-heading" className="text-body font-semibold text-text-primary">
          프로필 수정
        </h2>
      </div>
      <Card>
        <CardContent className="p-4">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Field label="이름">
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </Field>
            <Field label="연락처">
              <Input id="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </Field>
            <Field label="프로필 이미지 URL">
              <Input
                id="profile-image-url"
                value={form.imageUrl}
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
              />
            </Field>
            <Field label="사번">
              <Input
                id="employee-id"
                value={form.employeeId}
                onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
              />
            </Field>
            <label className="block text-caption font-medium text-text-secondary" htmlFor="role">
              역할
            </label>
            <select
              id="role"
              className="h-10 w-full rounded-ridy-md border border-border-input bg-surface px-3 text-body text-text-primary"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" className="h-11 w-full">
              프로필 저장
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function VehicleSection({
  vehicles,
  isLoading,
  isError,
  role,
  form,
  setForm,
  editingVehicleId,
  onSubmit,
  onEdit,
  onDelete,
  onRetry,
}: {
  vehicles: ReadonlyArray<Vehicle>;
  isLoading: boolean;
  isError: boolean;
  role: Role;
  form: VehicleFormState;
  setForm: (form: VehicleFormState) => void;
  editingVehicleId: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}) {
  const canManageVehicle = role === 'DRIVER' || role === 'BOTH' || role === 'ADMIN';

  return (
    <section className="mt-5" aria-labelledby="vehicle-heading">
      <div className="mb-3 flex items-center gap-2">
        <Car aria-hidden="true" size={18} className="text-text-tertiary-on-muted" />
        <h2 id="vehicle-heading" className="text-body font-semibold text-text-primary">
          차량 정보
        </h2>
      </div>
      {!canManageVehicle ? (
        <p className="mb-3 rounded-ridy-lg bg-warning-subtle px-4 py-3 text-caption text-warning">
          차주로 전환하면 차량을 등록할 수 있습니다.
        </p>
      ) : null}
      <div className="space-y-gap-tight">
          {isLoading ? <div className="h-28 rounded-ridy-lg bg-surface-secondary" aria-label="차량 정보를 불러오는 중" /> : null}
        {isError ? (
          <Card className="border-orange-100 bg-orange-50/60">
            <CardContent className="p-4 text-center">
              <p className="text-body font-semibold text-text-primary">차량 정보를 불러오지 못했습니다.</p>
              <Button type="button" variant="outline" className="mt-3" onClick={onRetry}>
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {!isLoading && !isError && vehicles.length === 0 ? (
          <Card className="border-dashed border-primary/20 bg-primary-subtle/40 bg-surface">
            <CardContent className="p-4 text-center">
              <p className="text-body font-semibold text-text-primary">등록된 차량이 없습니다.</p>
              <p className="mt-1 text-caption text-text-tertiary">차량을 등록하면 차주로 운행할 수 있습니다.</p>
            </CardContent>
          </Card>
        ) : null}
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} data-testid={`vehicle-${vehicle.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body font-semibold text-text-primary">{vehicle.model}</p>
                  <p className="mt-1 text-caption text-text-tertiary">{vehicle.plate}</p>
                  <p className="mt-2 text-caption text-text-secondary">
                    {vehicle.color ?? '색상 미등록'} · {vehicleCapacityLabel(vehicle.capacity)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
                    수정
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(vehicle.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <VehicleForm form={form} setForm={setForm} editingVehicleId={editingVehicleId} onSubmit={onSubmit} />
    </section>
  );
}

function VehicleForm({
  form,
  setForm,
  editingVehicleId,
  onSubmit,
}: {
  form: VehicleFormState;
  setForm: (form: VehicleFormState) => void;
  editingVehicleId: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="mt-3">
      <CardContent className="p-4">
        <form className="space-y-3" onSubmit={onSubmit}>
          <Field label="차량 모델">
            <Input
              id="vehicle-model"
              value={form.model}
              onChange={(event) => setForm({ ...form, model: event.target.value })}
              required
            />
          </Field>
          <Field label="차량 색상">
            <Input
              id="vehicle-color"
              value={form.color}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
            />
          </Field>
          <Field label="차량 번호">
            <Input
              id="vehicle-plate"
              value={form.plate}
              onChange={(event) => setForm({ ...form, plate: event.target.value })}
              required
            />
          </Field>
          <Field label="정원">
            <Input
              id="vehicle-capacity"
              type="number"
              min={1}
              max={8}
              value={form.capacity}
              onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              required
            />
          </Field>
          <Button type="submit" className="h-11 min-h-11 w-full">
            {editingVehicleId ? '차량 수정' : '차량 등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SettingsSection({
  pushEnabled,
  matchingEnabled,
  settlementEnabled,
  language,
  theme,
  setPushEnabled,
  setMatchingEnabled,
  setSettlementEnabled,
  setLanguage,
  setTheme,
}: {
  pushEnabled: boolean;
  matchingEnabled: boolean;
  settlementEnabled: boolean;
  language: string;
  theme: string;
  setPushEnabled: (enabled: boolean) => void;
  setMatchingEnabled: (enabled: boolean) => void;
  setSettlementEnabled: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
}) {
  return (
    <section className="mt-5" aria-labelledby="settings-heading">
      <div className="mb-3 flex items-center gap-2">
        <Settings aria-hidden="true" size={18} className="text-gray-500" />
        <h2 id="settings-heading" className="text-body font-semibold text-gray-900">
          앱 설정
        </h2>
      </div>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2" aria-label="알림 설정">
            <div className="flex items-center gap-2 text-caption font-semibold text-gray-700">
              <Bell aria-hidden="true" size={16} /> 알림 설정
            </div>
            <ToggleRow label="푸시 알림" enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
            <ToggleRow label="매칭 알림" enabled={matchingEnabled} onToggle={() => setMatchingEnabled(!matchingEnabled)} />
            <ToggleRow label="정산 알림" enabled={settlementEnabled} onToggle={() => setSettlementEnabled(!settlementEnabled)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-caption font-medium text-gray-700" htmlFor="language">
              언어
              <select
                id="language"
                className="mt-1 h-10 w-full rounded-lg border border-input bg-white px-3 text-body"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="text-caption font-medium text-gray-700" htmlFor="theme">
              테마
              <select
                id="theme"
                className="mt-1 h-10 w-full rounded-lg border border-input bg-white px-3 text-body"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                <option value="system">시스템</option>
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </label>
          </div>
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-caption text-gray-500">
            설정은 이 기기에서만 유지됩니다.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-caption text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={enabled}
        onClick={onToggle}
        className={`h-6 w-11 rounded-full p-0.5 transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <span
          className={`block size-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function AccountSection({ onLogout }: { onLogout: () => void }) {
  return (
    <section className="mt-5" aria-label="계정 관리">
      <Card>
        <CardContent className="space-y-3 p-4">
          <Button type="button" variant="outline" className="h-11 w-full" onClick={onLogout}>
            <LogOut aria-hidden="true" /> 로그아웃
          </Button>
          <div className="rounded-card border border-orange-100 bg-orange-50/60 p-3 text-caption text-gray-600">
            <div className="flex items-center gap-2 font-semibold text-danger">
              <ShieldAlert aria-hidden="true" size={16} /> 회원탈퇴
            </div>
            <p className="mt-1">회원탈퇴 기능은 backend API가 준비된 뒤 제공됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = labelToId(label);

  return (
    <label className="block text-caption font-medium text-gray-700" htmlFor={id}>
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ProfileLoading() {
  return <div className="mt-5 h-40 rounded-card bg-gray-100" aria-label="프로필 정보를 불러오는 중" />;
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="mt-5">
      <CardContent className="p-4 text-center">
        <p className="text-body font-semibold text-gray-900">프로필 정보를 불러오지 못했습니다.</p>
        <Button type="button" variant="outline" className="mt-3" onClick={onRetry}>
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );
}

function nullableText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function labelToId(label: string) {
  const ids: Record<string, string> = {
    이름: 'name',
    연락처: 'phone',
    '프로필 이미지 URL': 'profile-image-url',
    사번: 'employee-id',
    '차량 모델': 'vehicle-model',
    '차량 색상': 'vehicle-color',
    '차량 번호': 'vehicle-plate',
    정원: 'vehicle-capacity',
  };

  return ids[label] ?? label;
}
