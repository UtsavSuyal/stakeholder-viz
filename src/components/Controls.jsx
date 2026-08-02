import { TYPE_COLORS, TYPE_LABELS, STATE_COLORS } from "../constants";

export default function Controls({ activeTypes, onToggleType, searchTerm, onSearch }) {
  const types = Object.keys(TYPE_LABELS);

  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-slate-900/70 backdrop-blur border-b border-slate-800">
      <input
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search stakeholders…"
        className="w-full max-w-xs bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-400/60"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {types.map((t) => {
          const active = activeTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => onToggleType(t)}
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                active
                  ? "border-slate-600 bg-slate-800 text-slate-200"
                  : "border-slate-800 bg-transparent text-slate-600"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: active ? TYPE_COLORS[t] : "#475569" }}
              />
              {TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-500">
        <span className="font-medium text-slate-400">Edge trend:</span>
        {Object.entries(STATE_COLORS).map(([state, color]) => (
          <span key={state} className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-0.5"
              style={{
                background: color,
                borderBottom: state === "deteriorating" ? `2px dashed ${color}` : "none",
              }}
            />
            {state}
          </span>
        ))}
      </div>
    </div>
  );
}
