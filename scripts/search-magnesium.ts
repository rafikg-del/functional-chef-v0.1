
import { searchArticles, getPaper } from '../src/lib/openalex';

async function main() {
  console.log('=== RECHERCHE 1: Magnesium + HRV / vagal tone ===\n');
  const papers1 = await searchArticles('magnesium supplementation heart rate variability vagal', { limit: 10 });
  for (const p of papers1) {
    console.log(`${p.pmid ? 'PMID '+p.pmid : 'N/A'.padEnd(8)} | ${p.year} | ${p.cited_by.toString().padStart(4)} cit. | ${p.journal?.substring(0,35)?.padEnd(37)} | ${p.title?.substring(0, 100)}`);
    if (p.abstract) console.log(`   📝 ${p.abstract.substring(0, 250)}`);
    if (p.oa_url) console.log(`   🆓 ${p.oa_url}`);
    console.log('');
  }
  
  console.log('=== RECHERCHE 2: Magnesium + cardiac autonomic + RCT ===\n');
  const papers2 = await searchArticles('magnesium cardiac autonomic function randomized controlled trial', { limit: 5 });
  for (const p of papers2) {
    console.log(`${p.pmid ? 'PMID '+p.pmid : 'N/A'.padEnd(8)} | ${p.year} | ${p.cited_by.toString().padStart(4)} cit. | ${p.journal?.substring(0,35)?.padEnd(37)} | ${p.title?.substring(0, 100)}`);
    if (p.oa_url) console.log(`   🆓 ${p.oa_url}`);
    console.log('');
  }
  
  console.log('=== RECHERCHE 3: Magnesium + parasympathetic + RCT ===\n');
  const papers3 = await searchArticles('magnesium parasympathetic nervous system randomized trial', { limit: 5 });
  for (const p of papers3) {
    console.log(`${p.pmid ? 'PMID '+p.pmid : 'N/A'.padEnd(8)} | ${p.year} | ${p.cited_by.toString().padStart(4)} cit. | ${p.journal?.substring(0,35)?.padEnd(37)} | ${p.title?.substring(0, 100)}`);
    console.log('');
  }
}
main();
