// Centralized definition of the college's 9 Departments + Other
export const COLLEGE_DEPARTMENTS = [
  'EXTC',
  'Civil',
  'Mech',
  'AIDS',
  'CSE(IOT)',
  'MCA',
  'MBA',
  'CSE',
  'IT'
];

/**
 * Checks if a participant or coordinator department matches a target filter.
 * Handles exact matches, aliases, and case-insensitivity.
 */
export function matchDepartment(itemDept, targetDept) {
  if (!itemDept || !targetDept) return false;
  const a = itemDept.trim().toLowerCase();
  const b = targetDept.trim().toLowerCase();

  if (b === 'all') return true;
  if (a === b) return true;

  const aliases = {
    'extc': ['extc', 'electronics & communication', 'electronics & telecommunication', 'electronics', 'telecommunication'],
    'civil': ['civil', 'civil engineering'],
    'mech': ['mech', 'mechanical', 'mechanical engineering'],
    'aids': ['aids', 'ai&ds', 'artificial intelligence', 'artificial intelligence & data science', 'ai and ds'],
    'cse(iot)': ['cse(iot)', 'cse (iot)', 'cse-iot', 'iot', 'internet of things'],
    'mca': ['mca', 'master of computer applications'],
    'mba': ['mba', 'management studies', 'master of business administration', 'management studies (mba/bba)'],
    'cse': ['cse', 'computer engineering', 'computer science & engineering', 'computer science'],
    'it': ['it', 'information technology']
  };

  if (b === 'other') {
    // If target is Other, match items that either say "other" or are not in the primary 9 list
    const isKnown = Object.values(aliases).some(list => list.some(alias => a.includes(alias) || alias.includes(a)));
    return !isKnown || a.includes('other');
  }

  const aliasList = aliases[b];
  if (aliasList) {
    return aliasList.some(alias => a.includes(alias) || alias.includes(a));
  }

  return a.includes(b) || b.includes(a);
}
