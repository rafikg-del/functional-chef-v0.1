import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { canClaimPatientRole } from '@/lib/patient/claim-role';

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  const currentRole = user.app_metadata?.role;
  if (!canClaimPatientRole(currentRole)) {
    return NextResponse.json(
      { error: 'Ce compte n’est pas un compte patient.' },
      { status: 403 }
    );
  }

  if (currentRole === 'patient') {
    return NextResponse.json({ ok: true, role: 'patient' });
  }

  try {
    const admin = createServiceClient();
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, role: 'patient' },
    });
    if (error) {
      return NextResponse.json(
        { error: 'Impossible d’attribuer le rôle patient. Voir docs/PATIENT_B2C.md.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, role: 'patient' });
  } catch {
    return NextResponse.json(
      { error: 'Rôle patient à configurer (voir docs/PATIENT_B2C.md).' },
      { status: 503 }
    );
  }
}
