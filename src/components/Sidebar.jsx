import {
  TYPE_COLORS,
  TYPE_LABELS,
  RELATIONSHIP_COLORS,
  RELATIONSHIP_LABELS,
  STATE_COLORS,
} from "../constants";

const TrendArrow = ({ trend }) => {
  if (trend === "improving") return <span className="text-emerald-400">▲ improving</span>;
  if (trend === "deteriorating") return <span className="text-red-400">▼ deteriorating</span>;
  return <span className="text-slate-400">▬ stable</span>;
};

export default function Sidebar({ node, edges, nodesById, onSelect }) {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-slate-500">
        <div className="text-sm">
          Click a node to see the stakeholder's profile, current relationship
          state, and every connection tied to it.
        </div>
      </div>
    );
  }

  const related = edges.filter((e) => {
    const s = e.source.id ?? e.source;
    const t = e.target.id ?? e.target;
    return s === node.id || t === node.id;
  });

  return (
    <div className="h-full overflow-y-auto px-5 py-5 text-slate-200">
      <div className="flex items-start gap-3 mb-1">
        <span
          className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
          style={{ background: TYPE_COLORS[node.type] }}
        />
        <div>
          <h2 className="text-lg font-semibold leading-tight">{node.name}</h2>
          <div className="text-xs text-slate-400">{TYPE_LABELS[node.type]} · {node.region}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            background: `${RELATIONSHIP_COLORS[node.relationship]}22`,
            color: RELATIONSHIP_COLORS[node.relationship],
            border: `1px solid ${RELATIONSHIP_COLORS[node.relationship]}55`,
          }}
        >
          {RELATIONSHIP_LABELS[node.relationship]}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          <TrendArrow trend={node.trend} />
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          Influence {node.influence}/5
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mt-4">{node.description}</p>
      <div className="text-xs text-slate-500 mt-2">Last updated {node.lastUpdate}</div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Connections ({related.length})
        </div>
        <div className="space-y-2">
          {related.map((e, i) => {
            const s = e.source.id ?? e.source;
            const t = e.target.id ?? e.target;
            const otherId = s === node.id ? t : s;
            const other = nodesById.get(otherId);
            if (!other) return null;
            return (
              <button
                key={i}
                onClick={() => onSelect(otherId)}
                className="w-full text-left bg-slate-800/60 hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: TYPE_COLORS[other.type] }}
                    />
                    <span className="text-sm font-medium text-slate-200">{other.name}</span>
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: STATE_COLORS[e.state] }}
                  >
                    {e.state}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 pl-4">
                  {e.type} · {e.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
