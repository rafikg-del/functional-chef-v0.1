import * as pdfjsLib from 'pdfjs-dist';

export interface BiomarkerValue {
  biomarker: string;
  result: number | string | null;
  unit: string;
  ref_min: number | string | null;
  ref_max: number | string | null;
  status: 'normal' | 'low' | 'high' | 'missing' | 'error';
  raw_text: string;
}

export interface SynlabExtraction {
  patient_id: string;
  patient_age: number;
  patient_gender: 'M' | 'F';
  sample_date: string;
  lab_ref: string;
  biomarkers: BiomarkerValue[];
  extraction_confidence: number;
  extraction_notes: string[];
}

const BIOMARKER_ALIASES: Record<string, string> = {
  'Glycémie à jeun': 'fasting_glucose',
  'Insuline': 'fasting_insulin',
  'Index HOMA': 'homa_ir',
  'HbA1c NGSP': 'hba1c',
  'Triglycérides': 'triglycerides',
  'Cholestérol HDL': 'hdl',
  'Cholestérol LDL (calculé)': 'ldl',
  'Cholestérol total': 'total_cholesterol',
  'Rapport AA/EPA': 'aa_epa_ratio',
  'Rapport W6/W3': 'omega6_omega3_ratio',
  'w3 totaux': 'omega3_total',
  'w6 Totaux': 'omega6_total',
  'Index w3': 'omega3_index',
  'CRP ultra-sensible': 'crp_us',
  'TSH': 'tsh',
  'T3 libre': 't3_free',
  'T4 libre': 't4_free',
  '25-hydroxy-Vitamine D': 'vitamin_d',
  'Zinc': 'zinc',
  'Sélénium': 'selenium',
  'Vitamine B12': 'b12',
  'Folates érythrocytaires': 'folate',
  'Fer': 'iron',
  'Vitamine E': 'vitamin_e',
  'Vitamine A': 'vitamin_a',
  'Coenzyme Q10': 'coq10',
  'Homocystéine': 'homocysteine',
  'Créatinine': 'creatinine',
  'GFR (CKD-EPI)': 'gfr',
  'Acide urique': 'uric_acid',
};

export async function parseSynlabPDF(pdfBuffer: ArrayBuffer): Promise<SynlabExtraction> {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const extraction: SynlabExtraction = {
    patient_id: '',
    patient_age: 0,
    patient_gender: 'M',
    sample_date: '',
    lab_ref: '',
    biomarkers: [],
    extraction_confidence: 0,
    extraction_notes: [],
  };
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  _extractMetadata(fullText, extraction);
  _parseBiomarkerTable(fullText, extraction);
  extraction.extraction_confidence = Math.min(1, extraction.biomarkers.length / 20);
  return extraction;
}

function _extractMetadata(text: string, extraction: SynlabExtraction) {
  const patientIdMatch = text.match(/([A-Z]{2}-[A-Z]{2}-[A-Z]{2}-[A-Z]{2})/);
  if (patientIdMatch) extraction.patient_id = patientIdMatch[1];
  const ageGenderMatch = text.match(/Date de naissance\s*:\s*\d{2}\/\d{2}\/\d{4}\s*\/\s*([FM])\s+(\d+)\s+ans/);
  if (ageGenderMatch) {
    extraction.patient_gender = ageGenderMatch[1] === 'F' ? 'F' : 'M';
    extraction.patient_age = parseInt(ageGenderMatch[2], 10);
  }
  const sampleMatch = text.match(/Échantillon\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/);
  if (sampleMatch) {
    extraction.sample_date = `${sampleMatch[3]}-${sampleMatch[2]}-${sampleMatch[1]}`;
  }
  const refMatch = text.match(/Ref:\s*(N\d+\s+\d+)/);
  if (refMatch) extraction.lab_ref = refMatch[1];
}

function _parseBiomarkerTable(text: string, extraction: SynlabExtraction) {
  const sections = text.split(/HEMATOLOGIE|FONCTION RENALE|BIOCHIMIE DES GLUCIDES|BIOCHIMIE DES LIPIDES|STATUT DES ACIDES GRAS|TESTS INFLAMMAT|ENDOCRINOLOGIE/i);
  
  for (const section of sections) {
    const lines = section.split('\n');
    for (const line of lines) {
      const parsed = _parseBiomarkerLine(line.trim());
      if (parsed) extraction.biomarkers.push(parsed);
    }
  }
}

function _parseBiomarkerLine(line: string): BiomarkerValue | null {
  if (!line || line.length < 3) return null;
  const pattern = /^([A-Z][^0-9±\-\+]+?)\s+([\+\-]*)?\s*(\d+\.?\d*)\s+(.+)$/i;
  const match = line.match(pattern);
  if (!match) return null;
  const [, rawName, flag, resultStr, rest] = match;
  const biomarkerName = rawName.trim();
  const canonicalName = BIOMARKER_ALIASES[biomarkerName];
  if (!canonicalName) return null;
  let result: number | null = null;
  let status: 'normal' | 'low' | 'high' | 'missing' | 'error' = 'normal';
  const numResult = parseFloat(resultStr);
  result = isNaN(numResult) ? null : numResult;
  if (flag === '+') status = 'high';
  if (flag === '-') status = 'low';
  const unitMatch = rest.match(/^(\S+\/\S+|\S+)\s+(.*)$/);
  const unit = unitMatch ? unitMatch[1] : '';
  const refStr = unitMatch ? unitMatch[2] : rest;
  let ref_min: number | null = null;
  let ref_max: number | null = null;
  const refRange = refStr.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
  if (refRange) {
    ref_min = parseFloat(refRange[1]);
    ref_max = parseFloat(refRange[2]);
  }
  return {
    biomarker: canonicalName,
    result,
    unit,
    ref_min,
    ref_max,
    status,
    raw_text: line,
  };
}

export function extractionToJSON(extraction: SynlabExtraction) {
  return {
    patient: {
      id: extraction.patient_id,
      age: extraction.patient_age,
      gender: extraction.patient_gender,
    },
    sample_date: extraction.sample_date,
    lab_ref: extraction.lab_ref,
    biomarkers: Object.fromEntries(
      extraction.biomarkers.map(bm => [
        bm.biomarker,
        {
          value: bm.result,
          unit: bm.unit,
          status: bm.status,
          ref: { min: bm.ref_min, max: bm.ref_max },
        },
      ])
    ),
    extraction_confidence: extraction.extraction_confidence,
    notes: extraction.extraction_notes,
  };
}
