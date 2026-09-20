import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace patient — Functional Chef',
  description:
    'Menu culinaire 7 jours et liste de courses. Aide culinaire personnalisée, pas un avis médical ni un dispositif médical.',
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return children;
}
