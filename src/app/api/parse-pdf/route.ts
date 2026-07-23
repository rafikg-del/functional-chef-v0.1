import { NextRequest, NextResponse } from 'next/server';
import { parseSynlabPDF, extractionToJSON } from '@/lib/synlab-pdf-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    const extraction = await parseSynlabPDF(buffer);
    const json = extractionToJSON(extraction);
    return NextResponse.json({
      success: true,
      data: json,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'PDF parsing failed' },
      { status: 500 }
    );
  }
}
