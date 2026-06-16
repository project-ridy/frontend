import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/graphql/route';

const ORIGINAL_VISUAL_QA_FIXTURE = process.env.RIDY_VISUAL_QA_FIXTURE;

afterEach(() => {
  process.env.RIDY_VISUAL_QA_FIXTURE = ORIGINAL_VISUAL_QA_FIXTURE;
});

function createGraphqlRequest(operationName: string, query: string) {
  return new Request('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ operationName, query, variables: {} }),
  });
}

async function parseJson(response: Response) {
  return response.json() as Promise<{ data?: Record<string, unknown>; errors?: Array<{ message: string }> }>;
}

describe('visual QA GraphQL fixture route', () => {
  it('fixture flag가 꺼져 있으면 mock GraphQL 응답을 제공하지 않는다', async () => {
    delete process.env.RIDY_VISUAL_QA_FIXTURE;

    const response = await POST(createGraphqlRequest('Me', 'query Me { me { id } }'));

    expect(response.status).toBe(404);
  });

  it('fixture flag가 켜져 있으면 홈/매칭/프로필 정상 데이터 query를 반환한다', async () => {
    process.env.RIDY_VISUAL_QA_FIXTURE = '1';

    const home = await parseJson(
      await POST(createGraphqlRequest('MyHomeRides', 'query MyHomeRides { myRides { nodes { id } } }')),
    );
    const matchings = await parseJson(
      await POST(createGraphqlRequest('SearchRides', 'query SearchRides { searchRides { nodes { id } } }')),
    );
    const me = await parseJson(await POST(createGraphqlRequest('Me', 'query Me { me { id } }')));
    const vehicles = await parseJson(
      await POST(createGraphqlRequest('MyVehicles', 'query MyVehicles { myVehicles { id } }')),
    );

    expect(home.data?.myRides).toMatchObject({ totalCount: 2 });
    expect(matchings.data?.searchRides).toMatchObject({ totalCount: 2 });
    expect(me.data?.me).toMatchObject({ name: '김서연', company: { name: '테크스타터' } });
    expect(vehicles.data?.myVehicles).toEqual(
      expect.arrayContaining([expect.objectContaining({ model: '아이오닉 5', plate: '12가 3456' })]),
    );
  });
});
