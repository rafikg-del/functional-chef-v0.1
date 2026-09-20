import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/patient/require-patient', () => ({
  requirePatientUser: vi.fn(),
}));

vi.mock('@/lib/synlab-pdf-parser', () => ({
  parseSynlabPDF: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { requirePatientUser } from '@/lib/patient/require-patient';
import { parseSynlabPDF } from '@/lib/synlab-pdf-parser';
import { createClient } from '@/lib/supabase/server';

const patientUser = { id: 'pat-1', app_metadata: { role: 'patient' } };

function jsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function pdfRequest(): NextRequest {
  const form = new FormData();
  form.set('file', new File([new Uint8Array([1, 2, 3])], 'lab.pdf', { type: 'application/pdf' }));
  return new NextRequest('http://localhost/api/patient/parse-lab', {
    method: 'POST',
    body: form,
  });
}

describe('POST /api/patient/parse-lab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no patient session', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });

    const { POST } = await import('@/app/api/patient/parse-lab/route');
    const res = await POST(jsonRequest('http://localhost/api/patient/parse-lab', {}));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/auth/i);
  });

  it('returns 403 when the session is not a patient', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({
      ok: false,
      status: 403,
      error: 'Patient role required',
    });

    const { POST } = await import('@/app/api/patient/parse-lab/route');
    const res = await POST(pdfRequest());
    expect(res.status).toBe(403);
  });

  it('returns 422 manual_required when the PDF cannot be parsed', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({ ok: true, user: patientUser });
    vi.mocked(parseSynlabPDF).mockRejectedValue(new Error('not a synlab pdf'));

    const { POST } = await import('@/app/api/patient/parse-lab/route');
    const res = await POST(pdfRequest());
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.manual_required).toBe(true);
    expect(body.error).toMatch(/manuellement/i);
  });

  it('returns flattened biomarkers on a successful parse', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({ ok: true, user: patientUser });
    vi.mocked(parseSynlabPDF).mockResolvedValue({
      patient_id: 'XX-XX',
      patient_age: 40,
      patient_gender: 'F',
      sample_date: '2026-01-01',
      lab_ref: 'N1',
      biomarkers: [
        {
          biomarker: 'homa_ir',
          result: 2.1,
          unit: '',
          ref_min: null,
          ref_max: null,
          status: 'high',
          raw_text: 'Index HOMA 2.1',
        },
        {
          biomarker: 'crp_us',
          result: 0.4,
          unit: 'mg/L',
          ref_min: 0,
          ref_max: 1,
          status: 'normal',
          raw_text: 'CRP 0.4',
        },
      ],
      extraction_confidence: 0.5,
      extraction_notes: [],
    });

    const { POST } = await import('@/app/api/patient/parse-lab/route');
    const res = await POST(pdfRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.biomarkers).toEqual({ homa_ir: 2.1, crp_us: 0.4 });
    expect(body).not.toHaveProperty('patient_id');
  });
});

describe('POST /api/patient/labs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no patient session', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });

    const { POST } = await import('@/app/api/patient/labs/route');
    const res = await POST(jsonRequest('http://localhost/api/patient/labs', {}));
    expect(res.status).toBe(401);
  });

  it('persists merged biomarkers and returns the lab id', async () => {
    vi.mocked(requirePatientUser).mockResolvedValue({ ok: true, user: patientUser });
    const single = vi.fn().mockResolvedValue({ data: { id: 'lab-1' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ insert }),
    } as never);

    const { POST } = await import('@/app/api/patient/labs/route');
    const res = await POST(
      jsonRequest('http://localhost/api/patient/labs', {
        parsed_biomarkers: { homa_ir: 1.1, crp_us: 0.8 },
        edited_biomarkers: { homa_ir: 2.2, crp_us: '' },
        storage_path: 'pat-1/lab.pdf',
      })
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ id: 'lab-1' });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'pat-1',
        source: 'pdf_edited',
        parsed_biomarkers: { homa_ir: 1.1, crp_us: 0.8 },
        edited_biomarkers: { homa_ir: 2.2, crp_us: 0.8 },
        storage_path: 'pat-1/lab.pdf',
      })
    );
  });
});
