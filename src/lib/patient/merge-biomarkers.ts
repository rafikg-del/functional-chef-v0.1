import type { BiomarkerMap } from './types';

function isEmptyString(value: number | string | null): boolean {
  return value === '';
}

/**
 * Combine parser output with patient edits.
 * Edited wins when the key is present and not an empty string.
 * Empty strings are dropped from the result.
 */
export function mergeBiomarkers(parsed: BiomarkerMap, edited: BiomarkerMap): BiomarkerMap {
  const merged: BiomarkerMap = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (isEmptyString(value)) continue;
    merged[key] = value;
  }

  for (const [key, value] of Object.entries(edited)) {
    if (isEmptyString(value)) continue;
    merged[key] = value;
  }

  return merged;
}
