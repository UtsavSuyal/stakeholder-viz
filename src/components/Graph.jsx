import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TYPE_COLORS, TYPE_RING, STATE_COLORS } from "../constants";

export default function Graph({ data, selectedId, onSelect, activeTypes, searchTerm }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simRef = useRef(null);
  const dataRef = useRef({ nodes: [], links: [] });

  // Build simulation once
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const nodes = data.nodes.map((d) => ({ ...d }));
    const idToNode = new Map(nodes.map((n) => [n.id, n]));
    const links = data.edges
      .filter((e) => idToNode.has(e.source) && idToNode.has(e.target))
      .map((e) => ({ ...e }));
    dataRef.current = { nodes, links };

    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    const linkG = g.append("g").attr("class", "links");
    const nodeG = g.append("g").attr("class", "nodes");
    const labelG = g.append("g").attr("class", "labels");

    const link = linkG
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => STATE_COLORS[d.state] || "#8B96A8")
      .attr("stroke-width", (d) => 1 + d.strength * 0.7)
      .attr("stroke-dasharray", (d) => (d.state === "deteriorating" ? "5,4" : null))
      .attr("stroke-opacity", 0.55);

    const radius = (d) => (d.type === "client" ? 20 : 7 + d.influence * 2.6);

    const node = nodeG
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", radius)
      .attr("fill", (d) => TYPE_COLORS[d.type] || "#999")
      .attr("stroke", "#0b0e14")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelect(d.id);
      })
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simRef.current.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simRef.current.alphaTarget(0);
            // keep node pinned where the user dropped it — improves legibility
          })
      );

    const label = labelG
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.name)
      .attr("font-size", (d) => (d.type === "client" ? 13 : 10))
      .attr("font-weight", (d) => (d.type === "client" ? 700 : 500)) 
      .attr("fill", "#E5E7EB")
      .attr("paint-order", "stroke")
      .attr("stroke", "#0b0e14")
      .attr("stroke-width", 3)
      .attr("dx", (d) => radius(d) + 4)
      .attr("dy", 4)
      .style("pointer-events", "none");

    const ringRadius = (type) => 55 + TYPE_RING[type] * 150;

    const sim = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => 210 - d.strength * 18)
          .strength((d) => 0.15 + d.strength * 0.06)
      )
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d) => radius(d) + 14))
      .force(
        "radial",
        d3
          .forceRadial((d) => ringRadius(d.type), width / 2, height / 2)
          .strength((d) => (d.type === "client" ? 1 : 0.35))
      )
      .on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        label.attr("x", (d) => d.x).attr("y", (d) => d.y);
      });

    simRef.current = sim;

    // zoom / pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);
    svg.on("click", () => onSelect(null));

    return () => sim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Visual updates for selection / filters / search — no re-simulation
  useEffect(() => {
    const g = d3.select(gRef.current);
    const { nodes, links } = dataRef.current;
    if (!nodes.length) return;

    const connected = new Set();
    if (selectedId) {
      connected.add(selectedId);
      links.forEach((l) => {
        const s = l.source.id ?? l.source;
        const t = l.target.id ?? l.target;
        if (s === selectedId) connected.add(t);
        if (t === selectedId) connected.add(s);
      });
    }

    const term = (searchTerm || "").trim().toLowerCase();
    const matches = (d) => !term || d.name.toLowerCase().includes(term);
    const typeOk = (d) => activeTypes.has(d.type);

    g.selectAll("circle")
      .attr("stroke", (d) => (d.id === selectedId ? "#ffffff" : "#0b0e14"))
      .attr("stroke-width", (d) => (d.id === selectedId ? 3.5 : 2));

    g.selectAll("text").attr("opacity", (d) => {
      if (!(typeOk(d) && matches(d))) return 0;
      if (selectedId) return connected.has(d.id) ? 1 : 0.15;
      return d.type === "client" ? 1 : 0.85;
    });

    g.selectAll("line").attr("opacity", (d) => {
      const s = d.source.id ?? d.source;
      const t = d.target.id ?? d.target;
      const sNode = nodes.find((n) => n.id === s);
      const tNode = nodes.find((n) => n.id === t);
      const bothVisible = sNode && tNode && typeOk(sNode) && typeOk(tNode);
      if (!bothVisible) return 0.03;
      if (selectedId) return s === selectedId || t === selectedId ? 0.9 : 0.06;
      return 0.55;
    });

    g.selectAll("circle").attr("opacity", (d) => {
      if (!(typeOk(d) && matches(d))) return 0.06;
      if (selectedId) return connected.has(d.id) ? 1 : 0.15;
      return 1;
    });
  }, [selectedId, activeTypes, searchTerm]);

  return (
    <svg ref={svgRef} className="w-full h-full">
      <g ref={gRef} />
    </svg>
  );
}
