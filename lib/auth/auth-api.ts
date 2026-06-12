import {
  JoinWithInviteCodeDocument,
  LoginDocument,
  RegisterVehicleDocument,
  UpdateProfileDocument,
  type JoinWithInviteCodeMutation,
  type JoinWithInviteCodeMutationVariables,
  type LoginMutation,
  type LoginMutationVariables,
  type RegisterVehicleMutation,
  type RegisterVehicleMutationVariables,
  type UpdateProfileMutation,
  type UpdateProfileMutationVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export type SocialProvider = 'kakao' | 'google';

export async function joinWithInviteCode(input: JoinWithInviteCodeMutationVariables['input']) {
  const data = await executeGraphql<JoinWithInviteCodeMutation, JoinWithInviteCodeMutationVariables>(
    JoinWithInviteCodeDocument,
    { input },
  );

  if (!data.joinWithInviteCode) {
    throw new Error('가입 응답이 비어 있습니다.');
  }

  return data.joinWithInviteCode;
}

export async function login(input: LoginMutationVariables['input']) {
  const data = await executeGraphql<LoginMutation, LoginMutationVariables>(LoginDocument, { input });

  if (!data.login) {
    throw new Error('로그인 응답이 비어 있습니다.');
  }

  return data.login;
}

export async function updateProfile(input: UpdateProfileMutationVariables['input']) {
  const data = await executeGraphql<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, { input });

  if (!data.updateProfile) {
    throw new Error('프로필 수정 응답이 비어 있습니다.');
  }

  return data.updateProfile;
}

export async function registerVehicle(input: RegisterVehicleMutationVariables['input']) {
  const data = await executeGraphql<RegisterVehicleMutation, RegisterVehicleMutationVariables>(RegisterVehicleDocument, {
    input,
  });

  if (!data.registerVehicle) {
    throw new Error('차량 등록 응답이 비어 있습니다.');
  }

  return data.registerVehicle;
}
