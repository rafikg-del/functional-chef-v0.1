#!/usr/bin/env tsx
/**
 * Exécute les cas-pivot v0.1 (classifier + pipeline déterministe).
 * Exit 0 si tout passe, 1 sinon.
 */

import {
  formatValidationReport,
  runAllValidationChecks,
} from '../src/lib/testing/validation-runner';

const report = runAllValidationChecks();
console.log(formatValidationReport(report));
process.exit(report.ok ? 0 : 1);
