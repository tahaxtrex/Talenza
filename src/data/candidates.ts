export interface Candidate {
  rank: number;
  name: string;
  role: string;
  source: 'internal' | 'external';
  fitScore: number;
  scores: {
    crisis_mgmt: number;
    ops_depth: number;
    change_adapt: number;
    stakeholder: number;
    external_net: number;
  };
  headline_strength: string;
  headline_risk: string;
}

export const crisisCandidates: Candidate[] = [
  {
    rank: 1,
    name: "Thomas Richter",
    role: "Plant Manager, BMW Leipzig",
    source: "internal",
    fitScore: 87,
    scores: { crisis_mgmt: 9.2, ops_depth: 9.0, change_adapt: 3.8, stakeholder: 7.1, external_net: 2.1 },
    headline_strength: "Led Leipzig plant through major unplanned shutdown with zero SLA breach.",
    headline_risk: "360° feedback consistently flags resistance to digital process change.",
  },
  {
    rank: 2,
    name: "Claire Dubois",
    role: "COO, Stellantis Manufacturing",
    source: "external",
    fitScore: 71,
    scores: { crisis_mgmt: 8.5, ops_depth: 9.1, change_adapt: 6.8, stakeholder: 8.7, external_net: 9.0 },
    headline_strength: "22 years multi-plant automotive P&L, restructuring at scale.",
    headline_risk: "18-week notice period and €400K package expectation — impossible timeline for active crisis.",
  },
  {
    rank: 3,
    name: "Mehmet Yilmaz",
    role: "Senior Director, BMW Debrecen",
    source: "internal",
    fitScore: 64,
    scores: { crisis_mgmt: 6.1, ops_depth: 6.8, change_adapt: 5.5, stakeholder: 7.9, external_net: 4.2 },
    headline_strength: "Deep Debrecen regional trust, bilingual, BMW institutional knowledge.",
    headline_risk: "Limited budget ownership history. Has not operated at VP crisis level.",
  },
  {
    rank: 4,
    name: "Kai Hofmann",
    role: "Head of QA, BMW Munich",
    source: "internal",
    fitScore: 52,
    scores: { crisis_mgmt: 5.2, ops_depth: 5.8, change_adapt: 5.1, stakeholder: 7.5, external_net: 2.8 },
    headline_strength: "Process excellence, IATF certified, trusted cross-functionally.",
    headline_risk: "No P&L ownership. Never managed beyond 500 people.",
  },
  {
    rank: 5,
    name: "Priya Nair",
    role: "Director Smart Manufacturing, Siemens",
    source: "external",
    fitScore: 31,
    scores: { crisis_mgmt: 2.4, ops_depth: 3.1, change_adapt: 9.4, stakeholder: 5.8, external_net: 9.1 },
    headline_strength: "Industry 4.0 expertise, WEF speaker, exceptional external network.",
    headline_risk: "Zero automotive crisis experience. Ramp time of 6+ months in active crisis is fatal.",
  },
  {
    rank: 6,
    name: "Sara Lindqvist",
    role: "VP Operations, Northvolt",
    source: "external",
    fitScore: 28,
    scores: { crisis_mgmt: 2.1, ops_depth: 5.9, change_adapt: 9.1, stakeholder: 6.4, external_net: 8.7 },
    headline_strength: "Built gigafactory operational team, led EV supply chain transformation.",
    headline_risk: "No documented crisis experience. Transformation specialist in wrong context.",
  },
];

export const scoreLabels: Record<string, string> = {
  crisis_mgmt: 'Crisis',
  ops_depth: 'Ops',
  change_adapt: 'Change',
  stakeholder: 'Stakehld',
  external_net: 'Network',
};

export function getCandidatesForScenario(scenario: string): Candidate[] {
  const base = [...crisisCandidates];
  if (scenario === 'transformation') {
    return base.reverse().map((c, i) => ({
      ...c,
      rank: i + 1,
      fitScore: Math.max(20, 95 - i * 14),
    }));
  }
  if (scenario === 'growth') {
    const order = [2, 0, 3, 1, 4, 5];
    return order.map((idx, i) => ({
      ...base[idx],
      rank: i + 1,
      fitScore: Math.max(20, 88 - i * 12),
    }));
  }
  if (scenario === 'succession') {
    const order = [2, 3, 0, 1, 5, 4];
    return order.map((idx, i) => ({
      ...base[idx],
      rank: i + 1,
      fitScore: Math.max(20, 85 - i * 11),
    }));
  }
  return base;
}

export const questions = [
  "What is the specific role title and seniority level you're trying to fill?",
  "What is your realistic timeline? How many weeks do you have before this vacancy becomes critical to operations?",
  "Do you have internal candidates already identified, or is this purely an external search? If internal candidates exist, how many?",
  "What is the single most important capability you need from whoever fills this role — based on where the business is right now?",
  "Are there any hard constraints — package expectations, relocation requirements, language requirements — that would disqualify strong candidates?",
];
