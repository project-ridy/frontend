import { executeGraphql } from '@/lib/api/graphql-client';
import {
  DeleteVehicleDocument,
  MeDocument,
  MyVehiclesDocument,
  RegisterVehicleDocument,
  UpdateProfileDocument,
  UpdateVehicleDocument,
  type DeleteVehicleMutation,
  type DeleteVehicleMutationVariables,
  type MeQuery,
  type MeQueryVariables,
  type MyVehiclesQuery,
  type MyVehiclesQueryVariables,
  type RegisterVehicleMutation,
  type RegisterVehicleMutationVariables,
  type UpdateProfileMutation,
  type UpdateProfileMutationVariables,
  type UpdateVehicleMutation,
  type UpdateVehicleMutationVariables,
} from '@/src/graphql/generated/graphql';

export async function fetchMe(): Promise<NonNullable<MeQuery['me']>> {
  const data = await executeGraphql<MeQuery, MeQueryVariables>(MeDocument, {});

  if (!data.me) {
    throw new Error('프로필 응답이 비어 있습니다.');
  }

  return data.me;
}

export async function fetchMyVehicles(): Promise<MyVehiclesQuery['myVehicles']> {
  const data = await executeGraphql<MyVehiclesQuery, MyVehiclesQueryVariables>(MyVehiclesDocument, {});

  return data.myVehicles;
}

export async function updateProfile(
  variables: UpdateProfileMutationVariables,
): Promise<NonNullable<UpdateProfileMutation['updateProfile']>> {
  const data = await executeGraphql<UpdateProfileMutation, UpdateProfileMutationVariables>(
    UpdateProfileDocument,
    variables,
  );

  if (!data.updateProfile) {
    throw new Error('프로필 저장 응답이 비어 있습니다.');
  }

  return data.updateProfile;
}

export async function registerVehicle(
  variables: RegisterVehicleMutationVariables,
): Promise<NonNullable<RegisterVehicleMutation['registerVehicle']>> {
  const data = await executeGraphql<RegisterVehicleMutation, RegisterVehicleMutationVariables>(
    RegisterVehicleDocument,
    variables,
  );

  if (!data.registerVehicle) {
    throw new Error('차량 등록 응답이 비어 있습니다.');
  }

  return data.registerVehicle;
}

export async function updateVehicle(
  variables: UpdateVehicleMutationVariables,
): Promise<NonNullable<UpdateVehicleMutation['updateVehicle']>> {
  const data = await executeGraphql<UpdateVehicleMutation, UpdateVehicleMutationVariables>(
    UpdateVehicleDocument,
    variables,
  );

  if (!data.updateVehicle) {
    throw new Error('차량 수정 응답이 비어 있습니다.');
  }

  return data.updateVehicle;
}

export async function deleteVehicle(
  variables: DeleteVehicleMutationVariables,
): Promise<NonNullable<DeleteVehicleMutation['deleteVehicle']>> {
  const data = await executeGraphql<DeleteVehicleMutation, DeleteVehicleMutationVariables>(
    DeleteVehicleDocument,
    variables,
  );

  if (data.deleteVehicle === null) {
    throw new Error('차량 삭제 응답이 비어 있습니다.');
  }

  return data.deleteVehicle;
}
