// pages/index.tsx
"use client"
import ForceGraph from '../app/components/ForceGraph';
import Head from 'next/head';

// Define the sample data
const sampleGraphData = {
  nodes: [
    { id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }, { id: "E" },
    { id: "F" }, { id: "G" }, { id: "H" }, { id: "I" }, { id: "J" },
  ],
  links: [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "D" },
    { source: "D", target: "A" },
    { source: "A", target: "E" },
    { source: "B", target: "F" },
    { source: "E", target: "I" },
    { source: "F", target: "J" },
    { source: "I", target: "J" },
    { source: "G", target: "H" },
    { source: "C", target: "G" },
  ],
};

const HomePage: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Force-Directed Graph Viewer</title>
      </Head>

      <main style={{ padding: '20px' }}>
        <h1>Force-Directed Network Viewer (D3 in Next.js)</h1>
        <p>Drag the nodes to interact with the simulation.</p>
        <ForceGraph data={sampleGraphData} />
      </main>
    </div>
  );
};

export default HomePage;