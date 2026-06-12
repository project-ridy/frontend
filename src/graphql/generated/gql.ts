/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation JoinWithInviteCode($input: JoinWithInviteCodeInput!) {\n  joinWithInviteCode(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation UpdateProfile($input: UpdateProfileInput!) {\n  updateProfile(input: $input) {\n    id\n    email\n    name\n    phone\n    imageUrl\n    role\n    employeeId\n    companyId\n    rating\n    rideCount\n  }\n}\n\nmutation RegisterVehicle($input: RegisterVehicleInput!) {\n  registerVehicle(input: $input) {\n    id\n    userId\n    model\n    color\n    plate\n    capacity\n  }\n}": typeof types.JoinWithInviteCodeDocument,
    "query Health {\n  health {\n    status\n    service\n  }\n}": typeof types.HealthDocument,
    "query MyHomeRides($status: RideStatus, $pagination: PaginationInput) {\n  myRides(status: $status, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}\n\nquery SearchRides($input: SearchRidesInput!, $pagination: PaginationInput) {\n  searchRides(input: $input, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}": typeof types.MyHomeRidesDocument,
};
const documents: Documents = {
    "mutation JoinWithInviteCode($input: JoinWithInviteCodeInput!) {\n  joinWithInviteCode(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation UpdateProfile($input: UpdateProfileInput!) {\n  updateProfile(input: $input) {\n    id\n    email\n    name\n    phone\n    imageUrl\n    role\n    employeeId\n    companyId\n    rating\n    rideCount\n  }\n}\n\nmutation RegisterVehicle($input: RegisterVehicleInput!) {\n  registerVehicle(input: $input) {\n    id\n    userId\n    model\n    color\n    plate\n    capacity\n  }\n}": types.JoinWithInviteCodeDocument,
    "query Health {\n  health {\n    status\n    service\n  }\n}": types.HealthDocument,
    "query MyHomeRides($status: RideStatus, $pagination: PaginationInput) {\n  myRides(status: $status, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}\n\nquery SearchRides($input: SearchRidesInput!, $pagination: PaginationInput) {\n  searchRides(input: $input, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}": types.MyHomeRidesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation JoinWithInviteCode($input: JoinWithInviteCodeInput!) {\n  joinWithInviteCode(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation UpdateProfile($input: UpdateProfileInput!) {\n  updateProfile(input: $input) {\n    id\n    email\n    name\n    phone\n    imageUrl\n    role\n    employeeId\n    companyId\n    rating\n    rideCount\n  }\n}\n\nmutation RegisterVehicle($input: RegisterVehicleInput!) {\n  registerVehicle(input: $input) {\n    id\n    userId\n    model\n    color\n    plate\n    capacity\n  }\n}"): (typeof documents)["mutation JoinWithInviteCode($input: JoinWithInviteCodeInput!) {\n  joinWithInviteCode(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      name\n      phone\n      imageUrl\n      role\n      employeeId\n      companyId\n      rating\n      rideCount\n    }\n  }\n}\n\nmutation UpdateProfile($input: UpdateProfileInput!) {\n  updateProfile(input: $input) {\n    id\n    email\n    name\n    phone\n    imageUrl\n    role\n    employeeId\n    companyId\n    rating\n    rideCount\n  }\n}\n\nmutation RegisterVehicle($input: RegisterVehicleInput!) {\n  registerVehicle(input: $input) {\n    id\n    userId\n    model\n    color\n    plate\n    capacity\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Health {\n  health {\n    status\n    service\n  }\n}"): (typeof documents)["query Health {\n  health {\n    status\n    service\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyHomeRides($status: RideStatus, $pagination: PaginationInput) {\n  myRides(status: $status, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}\n\nquery SearchRides($input: SearchRidesInput!, $pagination: PaginationInput) {\n  searchRides(input: $input, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}"): (typeof documents)["query MyHomeRides($status: RideStatus, $pagination: PaginationInput) {\n  myRides(status: $status, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}\n\nquery SearchRides($input: SearchRidesInput!, $pagination: PaginationInput) {\n  searchRides(input: $input, pagination: $pagination) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      id\n      departure {\n        lat\n        lng\n      }\n      departureAddr\n      arrival {\n        lat\n        lng\n      }\n      arrivalAddr\n      departureTime\n      availableSeats\n      fare\n      status\n      driver {\n        id\n        name\n        rating\n        rideCount\n      }\n      requests {\n        id\n        status\n      }\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;