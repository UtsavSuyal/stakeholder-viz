import { useMemo, useState } from "react";
import data from "./data/stakeholders.json";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import Controls from "./components/Controls";
import { TYPE_LABELS } from "./constants";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTypes, setActiveTypes] = useState(new Set(Object.keys(TYPE_LABELS)));

  const nodesById = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), []);
  const selectedNode = selectedId ? nodesById.get(selectedId) : null;

  // edges resolved to node objects, mirroring what Graph builds internally,
  // so Sidebar can look up connections without re-deriving simulation state
  const edgesResolved = useMemo(
    () =>
      data.edges.map((e) => ({
        ...e,
        source: nodesById.get(e.source) ? { id: e.source } : e.source,
        target: nodesById.get(e.target) ? { id: e.target } : e.target,
      })),
    [nodesById]
  );

  const toggleType = (t) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0e14] text-slate-200">
      <header className="px-5 py-3 border-b border-slate-800 flex items-baseline gap-3">
        <h1 className="text-base font-semibold tracking-tight">
          Stakeholder Relationship Visualiser
        </h1>
        <span className="text-xs text-slate-500">
          Client: Iberdrola · {data.nodes.length} stakeholders · {data.edges.length} relationships
        </span>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <Controls
            activeTypes={activeTypes}
            onToggleType={toggleType}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
          <div className="flex-1 min-h-0">
            <Graph
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              activeTypes={activeTypes}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        <aside className="w-[340px] shrink-0 border-l border-slate-800 bg-slate-900/40">
          <Sidebar
            node={selectedNode}
            edges={edgesResolved}
            nodesById={nodesById}
            onSelect={setSelectedId}
          />
        </aside>
      </div>
    </div>
  );
}
