export const TYPE_COLORS = {
  client:      "#F5B942",
  government:  "#4C8BF5",
  regulator:   "#8B7CFC",
  jv_partner:  "#34D399",
  competitor:  "#FB923C",
  supplier:    "#38BDF8",
  customer:    "#A3E635",
  financier:   "#FACC15",
  union:       "#F472B6",
  ngo:         "#2DD4BF",
  individual:  "#CBD5E1",
};

export const TYPE_LABELS = {
  client:      "Client",
  government:  "Government",
  regulator:   "Regulator",
  jv_partner:  "Subsidiary / JV",
  competitor:  "Competitor",
  supplier:    "Supplier",
  customer:    "Customer",
  financier:   "Financier",
  union:       "Union",
  ngo:         "NGO",
  individual:  "Individual",
};

// Concentric ring per type — distance from the client reflects category,
// independent of link force, to keep the 34-node graph legible.
export const TYPE_RING = {
  client: 0,
  government: 1,
  regulator: 1,
  jv_partner: 1,
  competitor: 2,
  supplier: 2,
  customer: 2,
  financier: 2,
  union: 3,
  ngo: 3,
  individual: 3,
};

export const STATE_COLORS = {
  improving: "#22C55E",
  stable: "#8B96A8",
  deteriorating: "#EF4444",
};

export const RELATIONSHIP_COLORS = {
  self: "#F5B942",
  aligned: "#22C55E",
  neutral: "#8B96A8",
  tension: "#F59E0B",
  adversarial: "#EF4444",
};

export const RELATIONSHIP_LABELS = {
  self: "Client",
  aligned: "Aligned",
  neutral: "Neutral",
  tension: "Tension",
  adversarial: "Adversarial",
};
