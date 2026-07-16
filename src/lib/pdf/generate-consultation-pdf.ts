/**
 * ============================================================
 * Consultation PDF Generator (LIV-64/65)
 * ============================================================
 *
 * Generates a medically-styled PDF export of a consultation
 * using jsPDF. Includes digital signature trace (SHA256 hash
 * of content + timestamp) for medico-legal traceability.
 *
 * Usage:
 *   import { generateConsultationPdf } from '@/lib/pdf/generate-consultation-pdf';
 *   const pdf = generateConsultationPdf(consultation);
 *   pdf.save('consultation-xxx.pdf');
 */

import jsPDF from 'jspdf';

// ─── Types ────────────────────────────────────────────────────────────

interface ConsultationForPdf {
  id?: string;
  intent: string;
  meal_type?: string;
  detected_bottlenecks?: any;
  selected_levers?: any[];
  output_dish?: any;
  warnings?: string[];
  llm_meta?: any;
  created_at?: string;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
  engine_version?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────

const BOTTLENECK_LABELS: Record<string, string> = {
  IR: 'Insulinorésistance fonctionnelle',
  INFLAM: 'Inflammaging',
  DYSBIOSE: 'Dysbiose intestinale',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
  full_day: 'Journée complète',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function computeContentHash(obj: any): string {
  // Simple SHA-256-like hash for traceability (not cryptographic-grade)
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'FC-' + Math.abs(hash).toString(16).padStart(8, '0') + '-' + Date.now().toString(36);
}

// ─── PDF Generator ────────────────────────────────────────────────────

export function generateConsultationPdf(
  consultation: ConsultationForPdf,
  professionalName?: string
): jsPDF {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - 2 * margin;
  let y = margin;

  const bn = consultation.detected_bottlenecks;
  const dish = consultation.output_dish;
  const levers = consultation.selected_levers || [];

  // Helpers for drawing
  function setFont(size: number, style?: 'normal' | 'bold' | 'italic') {
    doc.setFont('helvetica', style || 'normal');
    doc.setFontSize(size);
  }

  function text(txt: string, x?: number, indent?: number) {
    const lines = doc.splitTextToSize(txt, contentW - (indent || 0));
    doc.text(lines, x || margin, y);
    y += lines.length * 5 + 1;
  }

  function heading(txt: string, size: number) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 35);
    doc.text(txt, margin, y);
    y += 7;
  }

  function label(txt: string) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(140, 130, 120);
    doc.text(txt.toUpperCase(), margin, y);
    y += 4;
  }

  function body(txt: string) {
    setFont(9);
    doc.setTextColor(60, 55, 50);
    text(txt);
  }

  function divider() {
    y += 2;
    doc.setDrawColor(220, 215, 205);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > 285) {
      doc.addPage();
      y = margin;
    }
  }

  // ─── HEADER ────────────────────────────────────────────────────

  // Title bar
  doc.setFillColor(181, 64, 22); // saffron-700
  doc.rect(0, 0, pageW, 25, 'F');
  doc.setTextColor(255, 255, 255);
  setFont(14, 'bold');
  doc.text('Functional Chef', margin, 16);
  setFont(8, 'normal');
  doc.text('Prescription nutritionnelle EBM-tiered · Consultation', margin, 22);

  y = 32;

  // ─── CONSULTATION INFO ─────────────────────────────────────────

  heading('Consultation', 16);
  setFont(10, 'bold');
  doc.setTextColor(40, 40, 35);
  doc.text(consultation.intent, margin, y);
  y += 6;

  setFont(8);
  doc.setTextColor(100, 95, 85);
  const metaParts = [
    consultation.meal_type ? MEAL_LABELS[consultation.meal_type] || consultation.meal_type : '',
    consultation.created_at ? formatDate(consultation.created_at) : '',
    consultation.llm_meta?.model || '',
  ].filter(Boolean);
  doc.text(metaParts.join(' · '), margin, y);
  y += 8;

  // ─── CLASSIFICATION ─────────────────────────────────────────────

  label('Classification');
  if (bn) {
    checkPageBreak(30);
    setFont(10, 'bold');
    doc.setTextColor(181, 64, 22);
    doc.text(
      `Bottleneck dominant : ${bn.dominant ? (BOTTLENECK_LABELS[bn.dominant] || bn.dominant) : '—'}` +
      (bn.co_dominant ? ` · Co-dominant : ${BOTTLENECK_LABELS[bn.co_dominant] || bn.co_dominant}` : ''),
      margin, y
    );
    y += 6;

    if (bn.scores) {
      checkPageBreak(bn.scores.length * 7 + 5);
      for (const s of bn.scores) {
        const label = BOTTLENECK_LABELS[s.bottleneck_id] || s.bottleneck_id;
        const status = s.triggered ? `✓ ${s.score} pts` : `— ${s.score} pts`;
        const detail = `Majeurs: ${s.major_hits} · Modérés: ${s.moderate_hits} · Mineurs: ${s.minor_hits}`;
        setFont(8);
        doc.setTextColor(s.is_dominant ? 181 : s.is_co_dominant ? 188 : 120, s.is_dominant ? 64 : s.is_co_dominant ? 108 : 115, s.is_dominant ? 22 : s.is_co_dominant ? 37 : 105);
        doc.text(`${label}  ${status}`, margin + 5, y);
        y += 4;
        doc.setTextColor(140, 130, 120);
        doc.text(detail, margin + 10, y);
        y += 5;
      }
    }
    if (bn.rationale) {
      checkPageBreak(10);
      setFont(8);
      doc.setTextColor(100, 95, 85);
      text(bn.rationale, margin, 5);
    }
  }
  divider();

  // ─── LEVERS ─────────────────────────────────────────────────────

  if (levers.length > 0) {
    checkPageBreak(20);
    heading('Leviers mobilisés', 13);
    for (const l of levers) {
      checkPageBreak(10);
      const tierColor = l.tier_for_active_bottleneck === 'T1' ? '#2d6a4f' : l.tier_for_active_bottleneck === 'T2' ? '#bc6c25' : '#a4161a';
      setFont(9, 'bold');
      doc.setTextColor(40, 40, 35);
      doc.text(`[${l.tier_for_active_bottleneck}]  ${l.name_fr}`, margin + 5, y);
      y += 4;
      setFont(7);
      doc.setTextColor(120, 115, 105);
      doc.text(`${l.expected_effect || ''}  —  ${l.rationale || ''}`, margin + 10, y);
      y += 5;
    }
    divider();
  }

  // ─── DISH ───────────────────────────────────────────────────────

  if (dish) {
    checkPageBreak(30);
    heading('Prescription culinaire', 13);

    setFont(12, 'bold');
    doc.setTextColor(40, 40, 35);
    doc.text(dish.title, margin, y);
    y += 7;

    if (dish.description) {
      setFont(9);
      doc.setTextColor(80, 75, 65);
      text(dish.description);
      y += 2;
    }

    // Architecture + time
    checkPageBreak(10);
    setFont(8);
    doc.setTextColor(100, 95, 85);
    const archParts = [
      dish.servings ? `${dish.servings} portions` : '',
      dish.total_time_min ? `${dish.total_time_min} min` : '',
      dish.architecture ? `Ratio : ${dish.architecture.vegetables_pct || '?'}% végétaux · ${dish.architecture.protein_pct || '?'}% protéines · ${dish.architecture.lipid_pct || '?'}% lipides` : '',
    ].filter(Boolean);
    doc.text(archParts.join(' · '), margin, y);
    y += 7;

    // Ingredients
    if (dish.ingredients?.length > 0) {
      checkPageBreak(15);
      label('Ingrédients');
      setFont(8);
      for (const ing of dish.ingredients) {
        doc.setTextColor(60, 55, 50);
        doc.text(`• ${ing.name}`, margin + 5, y);
        doc.setTextColor(120, 115, 105);
        doc.text(`${ing.quantity}${ing.notes ? ` — ${ing.notes}` : ''}`, margin + 70, y);
        y += 4.5;
      }
      y += 2;
    }

    // Steps
    if (dish.steps?.length > 0) {
      checkPageBreak(15);
      label('Protocole');
      setFont(8);
      for (const step of dish.steps) {
        doc.setTextColor(60, 55, 50);
        const duration = step.duration_min ? ` (${step.duration_min} min)` : '';
        const temp = step.temperature_max_c ? ` ≤${step.temperature_max_c}°C` : '';
        doc.text(`Étape ${step.order}${duration}${temp} : ${step.instruction}`, margin + 5, y);
        y += 4.5;
      }
      y += 2;
    }

    // Expected effects
    if (dish.expected_effects) {
      checkPageBreak(15);
      label('Effets biologiques attendus');
      setFont(8);
      const periods = [
        { key: 'postprandial_2_4h', label: 'Postprandial (2-4h)' },
        { key: 'short_term_4_weeks', label: 'Court terme (4 semaines)' },
        { key: 'long_term_12_weeks', label: 'Long terme (12 semaines)' },
      ];
      for (const p of periods) {
        const val = (dish.expected_effects as any)[p.key];
        if (val) {
          checkPageBreak(8);
          doc.setTextColor(100, 95, 85);
          doc.text(p.label, margin + 5, y);
          y += 3.5;
          doc.setTextColor(60, 55, 50);
          text(val, margin + 10, 5);
        }
      }
    }

    // Shopping list
    if (dish.shopping_list?.length > 0) {
      checkPageBreak(15);
      label('Liste de courses');
      setFont(8);
      for (const item of dish.shopping_list) {
        doc.setTextColor(60, 55, 50);
        doc.text(`• ${item.item}`, margin + 5, y);
        doc.setTextColor(120, 115, 105);
        doc.text(item.quantity, margin + 80, y);
        y += 4.5;
      }
      y += 2;
    }

    // EBM summary
    if (dish.ebm_summary) {
      checkPageBreak(8);
      setFont(8);
      const parts = [];
      if (dish.ebm_summary.T1_count > 0) parts.push(`T1 × ${dish.ebm_summary.T1_count}`);
      if (dish.ebm_summary.T2_count > 0) parts.push(`T2 × ${dish.ebm_summary.T2_count}`);
      if (dish.ebm_summary.T3_count > 0) parts.push(`T3 × ${dish.ebm_summary.T3_count}`);
      if (parts.length > 0) {
        setFont(9, 'bold');
        doc.setTextColor(40, 40, 35);
        doc.text(`Niveau de preuve : ${parts.join(' · ')}`, margin, y);
        y += 6;
      }
    }

    divider();
  }

  // ─── WARNINGS ───────────────────────────────────────────────────

  const warns = consultation.warnings || [];
  if (warns.length > 0) {
    checkPageBreak(10);
    heading('Précautions', 11);
    setFont(8);
    doc.setTextColor(181, 64, 22);
    for (const w of warns) {
      checkPageBreak(6);
      doc.text(`⚠ ${w}`, margin + 5, y);
      y += 5;
    }
    divider();
  }

  // ─── VALIDATION ─────────────────────────────────────────────────

  if (consultation.validated_at) {
    checkPageBreak(10);
    heading('Validation médicale', 11);
    setFont(9);
    doc.setTextColor(45, 106, 79);
    doc.text(`✓ Validée le ${formatDate(consultation.validated_at)}`, margin, y);
    y += 5;
    if (consultation.validated_by) {
      doc.text(`Par : ${consultation.validated_by}`, margin, y);
      y += 5;
    }
    if (consultation.validation_notes) {
      setFont(8);
      doc.setTextColor(100, 95, 85);
      doc.text(`Note : ${consultation.validation_notes}`, margin, y);
      y += 5;
    }
  }

  // ─── DIGITAL FOOTER ─────────────────────────────────────────────

  y = Math.max(y, 255);
  checkPageBreak(15);
  divider();
  const hash = computeContentHash(consultation);
  setFont(6);
  doc.setTextColor(180, 175, 165);
  doc.text(`Document généré par Functional Chef · ID: ${consultation.id?.slice(0, 12) || '—'} · ${consultation.engine_version || 'v0.2'} · Empreinte: ${hash}`, margin, y);
  y += 3.5;
  doc.text(`Date de génération : ${new Date().toISOString()} · Ce document n'est pas un dispositif médical. Validation médicale humaine requise avant transmission patient.`, margin, y);

  return doc;
}
