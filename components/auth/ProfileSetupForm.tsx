'use client';

import { Camera, CarFront } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProfileSetupMutation } from '@/hooks/useAuthMutations';
import { cn } from '@/lib/utils';

export function ProfileSetupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [message, setMessage] = useState('');
  const profileMutation = useProfileSetupMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage('이름을 입력해주세요.');
      return;
    }

    if (isDriver && (!vehicleModel.trim() || !vehiclePlate.trim())) {
      setMessage('차량 모델과 차량 번호를 입력해주세요.');
      return;
    }

    setMessage('');

    try {
      await profileMutation.mutateAsync({
        name: name.trim(),
        employeeId: employeeId.trim(),
        phone: phone.trim(),
        isDriver,
        vehicle: {
          model: vehicleModel.trim(),
          color: vehicleColor.trim(),
          plate: vehiclePlate.trim(),
          capacity: Number(capacity),
        },
      });
      router.push('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '프로필 설정에 실패했습니다.');
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-page-mobile py-8 sm:px-page-tablet">
      <Card className="border-gray-100 shadow-lg">
        <CardHeader>
          <h1 className="text-h1 font-bold text-gray-900">프로필 설정</h1>
          <CardDescription>회사 동료가 알아볼 수 있도록 기본 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-gap-normal" onSubmit={(event) => void handleSubmit(event)}>
            <div className="flex justify-center">
              <button
                type="button"
                className="flex size-20 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-500"
                aria-label="프로필 사진 추가"
              >
                <Camera className="size-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-small font-semibold text-gray-900">
                이름
              </label>
              <Input id="name" aria-label="이름" value={name} onChange={(event) => setName(event.target.value)} className="h-input" />
            </div>

            <div className="space-y-2">
              <label htmlFor="employee-id" className="text-small font-semibold text-gray-900">
                사번
              </label>
              <Input
                id="employee-id"
                aria-label="사번"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="h-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-small font-semibold text-gray-900">
                연락처
              </label>
              <Input
                id="phone"
                aria-label="연락처"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                className="h-input"
              />
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CarFront className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">차주로 시작</p>
                    <p className="text-small text-gray-500">운행을 등록하고 동료를 태울 수 있어요.</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="차주로 시작"
                  aria-checked={isDriver}
                  onClick={() => setIsDriver((current) => !current)}
                  className={cn(
                    'relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    isDriver ? 'bg-primary' : 'bg-gray-100',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform',
                      isDriver ? 'translate-x-5' : 'translate-x-1',
                    )}
                  />
                </button>
              </div>

              {isDriver ? (
                <div className="mt-4 grid gap-3">
                  <div className="space-y-2">
                    <label htmlFor="vehicle-model" className="text-small font-semibold text-gray-900">
                      차량 모델
                    </label>
                    <Input
                      id="vehicle-model"
                      aria-label="차량 모델"
                      value={vehicleModel}
                      onChange={(event) => setVehicleModel(event.target.value)}
                      className="h-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vehicle-color" className="text-small font-semibold text-gray-900">
                      차량 색상
                    </label>
                    <Input
                      id="vehicle-color"
                      aria-label="차량 색상"
                      value={vehicleColor}
                      onChange={(event) => setVehicleColor(event.target.value)}
                      className="h-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vehicle-plate" className="text-small font-semibold text-gray-900">
                      차량 번호
                    </label>
                    <Input
                      id="vehicle-plate"
                      aria-label="차량 번호"
                      value={vehiclePlate}
                      onChange={(event) => setVehiclePlate(event.target.value)}
                      className="h-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vehicle-capacity" className="text-small font-semibold text-gray-900">
                      탑승 정원
                    </label>
                    <Input
                      id="vehicle-capacity"
                      aria-label="탑승 정원"
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                      inputMode="numeric"
                      className="h-input"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {message ? <p className="text-small text-danger">{message}</p> : null}

            <Button type="submit" className="h-12 w-full" disabled={profileMutation.isPending}>
              시작하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
