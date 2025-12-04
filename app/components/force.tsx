// components/ForceGraph.tsx
"use client";

import React, { useEffect, useRef, FC } from "react";
import * as d3 from "d3";
import { GraphData, AnalyzedNode, AnalyzedLink } from "../types/network";

interface ForceGraphProps {
  data: GraphData;
}

// ✅ D3 link type
type D3Link = d3.SimulationLinkDatum<AnalyzedNode>;

// ✅ Drag node = app node + D3 simulation node
type DragNode = AnalyzedNode & d3.SimulationNodeDatum;

const ForceGraph: FC<ForceGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data?.nodes?.length) return;

    // ✅ Clone data (D3 mutates)
    const nodes: AnalyzedNode[] = data.nodes.map((d) => ({ ...d }));

    const links: D3Link[] = data.links.map((l) => ({
      source: l.source,
      target: l.target,
    }));

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f8f9fa")
      .style("border", "1px solid #ccc");

    // ✅ Simulation
    const simulation = d3
      .forceSimulation<AnalyzedNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<AnalyzedNode, D3Link>(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // ✅ Links
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    // ✅ Drag handlers (FULLY typed)
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, AnalyzedNode, unknown>
    ) {
      const d = event.subject as DragNode;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, AnalyzedNode, unknown>
    ) {
      const d = event.subject as DragNode;
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, AnalyzedNode, unknown>
    ) {
      const d = event.subject as DragNode;
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const dragBehavior = d3
      .drag<SVGGElement, AnalyzedNode>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

    // ✅ Nodes (group = circle + title)
    const nodeGroup = svg
      .append("g")
      .selectAll<SVGGElement, AnalyzedNode>("g")
      .data(nodes)
      .join("g")
      .call(dragBehavior);

    const radius = (d: AnalyzedNode) =>
      Math.max(5, Math.sqrt((d.centrality ?? 0) * 500));

    nodeGroup
      .append("circle")
      .attr("r", radius)
      .attr("fill", (d) => d.color ?? "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeGroup
      .append("title")
      .text(
        (d) =>
          `ID: ${d.id}
Community: ${d.group}
Centrality: ${(d.centrality ?? 0).toFixed(4)}
Degree: ${d.degree ?? 0}`
      );

    // ✅ Tick update
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as AnalyzedNode).x ?? 0)
        .attr("y1", (d) => (d.source as AnalyzedNode).y ?? 0)
        .attr("x2", (d) => (d.target as AnalyzedNode).x ?? 0)
        .attr("y2", (d) => (d.target as AnalyzedNode).y ?? 0);

      nodeGroup.attr(
        "transform",
        (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`
      );
    });

    // ✅ Cleanup
    return () => {
      simulation.stop();
      svg.selectAll("*").remove();
    };
  }, [data]);

  return <svg ref={svgRef} />;
};

export default ForceGraph;
