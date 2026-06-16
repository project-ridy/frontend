const visualQaUser = {
  id: 'user-visual-qa',
  email: 'seoyeon@techstarter.test',
  name: '김서연',
  phone: '010-1234-5678',
  imageUrl: null,
  role: 'BOTH',
  employeeId: 'EMP-1004',
  companyId: 'company-visual-qa',
  rating: 4.8,
  rideCount: 42,
  company: {
    id: 'company-visual-qa',
    name: '테크스타터',
  },
  vehicles: [
    {
      id: 'vehicle-visual-qa-1',
      userId: 'user-visual-qa',
      model: '아이오닉 5',
      color: '블루',
      plate: '12가 3456',
      capacity: 4,
      createdAt: '2026-06-10T09:00:00.000Z',
    },
  ],
};

const visualQaRides = [
  {
    id: 'ride-visual-qa-1',
    departure: { lat: 37.4979, lng: 127.0276 },
    departureAddr: '강남역 2호선 1번 출구 앞 장기 텍스트',
    arrival: { lat: 37.2636, lng: 127.0286 },
    arrivalAddr: '수원역 환승센터 장기 텍스트',
    departureTime: '2026-06-12T08:30:00.000Z',
    availableSeats: 2,
    fare: 5000,
    status: 'OPEN',
    driver: {
      id: 'driver-visual-qa-1',
      name: '박준서',
      rating: 4.8,
      rideCount: 42,
    },
    requests: [],
  },
  {
    id: 'ride-visual-qa-2',
    departure: { lat: 37.3947, lng: 127.1112 },
    departureAddr: '판교테크노밸리',
    arrival: { lat: 37.5665, lng: 126.978 },
    arrivalAddr: '서울시청',
    departureTime: '2026-06-12T08:45:00.000Z',
    availableSeats: 1,
    fare: 4500,
    status: 'OPEN',
    driver: {
      id: 'driver-visual-qa-2',
      name: '이민수',
      rating: 4.5,
      rideCount: 28,
    },
    requests: [],
  },
];

interface GraphqlRequestBody {
  operationName?: string;
  query?: string;
}

export async function POST(request: Request) {
  if (process.env.RIDY_VISUAL_QA_FIXTURE !== '1') {
    return new Response(null, { status: 404 });
  }

  const body = (await request.json()) as GraphqlRequestBody;
  const operationName = body.operationName ?? inferOperationName(body.query ?? '');

  if (operationName === 'MyHomeRides') {
    return jsonResponse({
      data: {
        myRides: {
          totalCount: visualQaRides.length,
          pageInfo: { hasNextPage: false, endCursor: visualQaRides.at(-1)?.id ?? null },
          nodes: visualQaRides,
        },
      },
    });
  }

  if (operationName === 'SearchRides') {
    return jsonResponse({
      data: {
        searchRides: {
          totalCount: visualQaRides.length,
          pageInfo: { hasNextPage: false, endCursor: visualQaRides.at(-1)?.id ?? null },
          nodes: visualQaRides,
        },
      },
    });
  }

  if (operationName === 'Me') {
    return jsonResponse({ data: { me: visualQaUser } });
  }

  if (operationName === 'MyVehicles') {
    return jsonResponse({ data: { myVehicles: visualQaUser.vehicles } });
  }

  return jsonResponse({ errors: [{ message: `Visual QA fixture does not handle ${operationName ?? 'unknown operation'}` }] }, 400);
}

function inferOperationName(query: string): string | null {
  const match = /(?:query|mutation)\s+(\w+)/.exec(query);

  return match?.[1] ?? null;
}

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}
