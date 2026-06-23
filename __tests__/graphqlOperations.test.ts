import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('GraphQL operations', () => {
  it('FE-NW-001: nearbyCommuteOffers operation이 정의된다', () => {
    const document = readFileSync('src/graphql/operations/matching.graphql', 'utf8');

    expect(document).toContain('query NearbyCommuteOffers');
    expect(document).toContain('nearbyCommuteOffers(input: $input, pagination: $pagination)');
    expect(document).toContain('pickupLabel');
    expect(document).toContain('workplace');
  });
});
