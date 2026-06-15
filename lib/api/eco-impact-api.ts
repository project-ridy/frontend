import {
  EcoImpactDashboardDocument,
  type EcoImpactDashboardQuery,
  type EcoImpactDashboardQueryVariables,
} from '@/src/graphql/generated/graphql';

import { executeGraphql } from '@/lib/api/graphql-client';

export async function fetchEcoImpactDashboard(
  variables: EcoImpactDashboardQueryVariables,
): Promise<EcoImpactDashboardQuery> {
  return executeGraphql<EcoImpactDashboardQuery, EcoImpactDashboardQueryVariables>(
    EcoImpactDashboardDocument,
    variables,
  );
}
