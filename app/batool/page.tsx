// app/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import ForceGraph from '../components/force';
import { processNetworkData } from '../utils/networkAnalysis';
import { GraphData, RawNode, RawLink } from '../types/network';

// Example Data (Using TS types for safety)
const rawData: { nodes: RawNode[], links: RawLink[] } = {
  nodes: [
    { id: "Alice" }, { id: "Bob" }, { id: "Charlie" }, { id: "Diana" },
    { id: "Edward" }, { id: "Frank" }, { id: "George" }, { id: "Hannah" },
    { id: "Ivan" }, { id: "BridgeNode" }
  ],
  links: [
    { source: "Alice", target: "Bob" },
    { source: "Alice", target: "Charlie" },
    { source: "Bob", target: "Charlie" },
    { source: "Alice", target: "Diana" },
    
    { source: "Edward", target: "Frank" },
    { source: "Frank", target: "George" },
    { source: "George", target: "Edward" },

    { source: "Hannah", target: "Ivan" },

    { source: "Alice", target: "BridgeNode" },
    { source: "BridgeNode", target: "Edward" }
  ]
};

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    // Run the Social Network Analysis algorithms
    const processedData = processNetworkData(rawData.nodes, rawData.links);
    setGraphData(processedData);
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>⚛️ Social Network Analysis (Next.js + D3.js + TypeScript)</h1>
      <hr/>
      <p>
        This visualization uses **Graphology** to calculate two key metrics, which are mapped to visual properties in **D3.js**:<br/>
        • **Color:** Community Detection (Louvain Algorithm) - Identifies natural clusters.<br/>
        • **Size:** Betweenness Centrality - Indicates influence and bridge nodes.
      </p>
      
      {graphData ? (
        <ForceGraph data={graphData} />
      ) : (
        <p>Analyzing network...</p>
      )}
    </div>
  );
}