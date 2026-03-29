import { Candidate, crisisCandidates } from '@/data/candidates';

const STORAGE_KEY = 'talenza_candidates';

export async function fetchCandidates(): Promise<Candidate[]> {
  try {
    const res = await fetch('/n8n-data/candidates/index.json');
    if (res.ok) {
      const data = await res.json();
      return data.map((c: any, i: number) => ({
        rank: i + 1,
        candidate_id: c.candidate_id,
        name: c.full_name,
        role: c.current_role,
        source: c.source_type,
        fitScore: 0,
        scores: { crisis_mgmt: 0, ops_depth: 0, change_adapt: 0, stakeholder: 0, external_net: 0 },
        headline_strength: `Scanned from n8n pipeline`,
        headline_risk: 'Ready for evaluation',
        file: c.file
      }));
    }
  } catch (err) {
    console.warn("Could not fetch n8n candidates, falling back to legacy", err);
  }
  return loadCandidates();
}

export function loadCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with default data on first load
  saveCandidates(crisisCandidates);
  return crisisCandidates;
}

export function saveCandidates(candidates: Candidate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

export function deleteCandidate(name: string) {
  const list = loadCandidates().filter(c => c.name !== name);
  // Re-rank
  list.forEach((c, i) => (c.rank = i + 1));
  saveCandidates(list);
  return list;
}

export function updateCandidate(original: string, updated: Candidate) {
  const list = loadCandidates().map(c => (c.name === original ? updated : c));
  saveCandidates(list);
  return list;
}

export function addCandidate(candidate: Candidate) {
  const list = loadCandidates();
  candidate.rank = list.length + 1;
  list.push(candidate);
  saveCandidates(list);
  return list;
}
