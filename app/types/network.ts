// types/network.ts

// The basic structure of the raw data
export interface RawNode {
  id: string;
  [key: string]: any; // Allows for other properties
}

export interface RawLink {
  source: string;
  target: string;
}

// The structure of the node after analysis by graphology
export interface AnalyzedNode extends RawNode, d3.SimulationNodeDatum {
  group: number;      // Community ID assigned by Louvain
  color: string;      // Color derived from the community ID
  centrality: number; // Betweenness Centrality score
  degree: number;     // Number of connections
}

// The structure of the link after analysis (d3 expects objects for source/target)
export interface AnalyzedLink extends d3.SimulationLinkDatum<AnalyzedNode> {
  source: string | AnalyzedNode; // Can be ID string or the actual Node object
  target: string | AnalyzedNode;
}

// The final data structure passed to the D3 component
export interface GraphData {
  nodes: AnalyzedNode[];
  links: AnalyzedLink[];
}