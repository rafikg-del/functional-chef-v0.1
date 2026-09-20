import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/patient/require-patient', () => ({
  requirePatientUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { requirePatientUser } from '@/lib/patient/require-patient';

describe('patient plans API auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requirePatientUser).mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });
  });

  it('GET /api/patient/plans returns 401', async () => {
    const { GET } = await import('@/app/api/patient/plans/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('POST /api/patient/plans returns 401', async () => {
    const { POST } = await import('@/app/api/patient/plans/route');
    const res = await POST(
      new NextRequest('http://localhost/api/patient/plans', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/patient/plans/[id] returns 401', async () => {
    const { GET } = await import('@/app/api/patient/plans/[id]/route');
    const res = await GET(new Request('http://localhost/api/patient/plans/p1'), {
      params: { id: 'p1' },
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/patient/plans/[id]/regenerate returns 401', async () => {
    const { POST } = await import('@/app/api/patient/plans/[id]/regenerate/route');
    const res = await POST(new Request('http://localhost/api/patient/plans/p1/regenerate'), {
      params: { id: 'p1' },
    });
    expect(res.status).toBe(401);
  });
});
