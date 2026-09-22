/**
 * Lightweight Jaro-Winkler fuzzy matcher for 404 "did you mean" suggestions.
 * No npm dependency (replaces the `string-similarity` package used by the old Gatsby site).
 *
 * Paths are compared by their last segment only: comparing full paths lets the
 * shared `/collection/` prefix inflate scores for unrelated garbage URLs.
 */

const SIMILARITY_THRESHOLD = 0.6;

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (!s1.length || !s2.length) return 0;

  const window = Math.max(0, Math.floor(Math.max(s1.length, s2.length) / 2) - 1);
  const s1Matches = new Array<boolean>(s1.length).fill(false);
  const s2Matches = new Array<boolean>(s2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - window);
    const end = Math.min(i + window + 1, s2.length);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;

  // Winkler boost for a shared prefix; gated at jaro > 0.7 so weak matches stay weak.
  let prefix = 0;
  while (prefix < 4 && s1[prefix] === s2[prefix]) prefix++;
  const winkler = jaro > 0.7 ? jaro + prefix * 0.1 * (1 - jaro) : jaro;

  // Scale by how much of the input the candidate matches: bare Jaro-Winkler
  // lets 2-3 character candidates score highly against long garbage URLs.
  return winkler * (matches / s1.length);
}

function lastSegment(path: string): string {
  return path.replace(/\/+$/, "").split("/").pop() ?? "";
}

export function findSimilar(input: string, candidates: string[], max = 3): string[] {
  const segment = lastSegment(input);
  if (!segment) return [];
  return candidates
    .map((candidate) => ({ path: candidate, score: jaroWinkler(segment, lastSegment(candidate)) }))
    .filter(({ score }) => score > SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ path }) => path);
}
