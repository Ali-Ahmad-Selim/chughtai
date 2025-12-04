import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// Define the types for better TypeScript support
interface Node {
  id: string;
  x?: number; // D3 will add these properties
  y?: number;
  fx?: number | null; // Fixed position for dragging
  fy?: number | null;
}

interface Link {
  source: string | Node; // Can be ID initially, D3 converts to Node object
  target: string | Node;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const WIDTH = 800;
const HEIGHT = 600;

const ForceGraph: React.FC<{ data: GraphData }> = ({ data }) => {
  // 1. Create a ref to attach the D3 visualization to
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // 2. Ensure the component is mounted and we have the ref
    if (!svgRef.current) return;

    // Deep copy the data to avoid modifying the original React state/prop
    const nodes: Node[] = data.nodes.map(d => ({ ...d }));
    const links: Link[] = data.links.map(d => ({ ...d }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering

    // 3. Setup the Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300)) // Nodes repel
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2)); // Center the graph

    // 4. Create Link Elements (Edges)
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // 5. Create Node Elements (Vertices)
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 10) // Radius of the node circle
      .attr('fill', '#69b3a2')
      .call(drag(simulation) as any); // Apply drag behavior

    // 6. Update positions on every tick of the simulation
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

  }, [data]); // Rerun effect if data changes

  // 7. Drag Handlers (Helper function for interactivity)
  const drag = (simulation: d3.Simulation<Node, undefined>) => {
    function dragstarted(event: d3.D3DragEvent<any, Node, any>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<any, Node, any>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<any, Node, any>) {
      if (!event.active) simulation.alphaTarget(0);
      // Optional: Set fx/fy to null to let forces take over again
      // event.subject.fx = null;
      // event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  return (
    <div style={{ border: '1px solid #ccc', maxWidth: WIDTH }}>
      {/* Attach the ref to the SVG element */}
      <svg ref={svgRef} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* D3 will populate the contents of this SVG */}
      </svg>
    </div>
  );
};

export default ForceGraph;