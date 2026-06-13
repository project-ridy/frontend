import type { Role } from '@/src/graphql/generated/graphql';

const roleLabels: Record<Role, string> = {
  PASSENGER: '탑승자',
  DRIVER: '차주',
  BOTH: '탑승자·차주',
  ADMIN: '관리자',
};

export function roleLabel(role: Role) {
  return roleLabels[role] ?? role;
}

export function profileInitial(name: string) {
  return name.trim().slice(0, 1) || 'R';
}

export function vehicleCapacityLabel(capacity: number) {
  return `${capacity}명 정원`;
}
