// utils/networkAnalysis.ts

import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import * as centrality from 'graphology-metrics/centrality';
import randomColor from 'randomcolor';
import { RawNode, RawLink, GraphData, AnalyzedNode } from '../types/network';

/**
 * Process raw nodes/links into analyzed GraphData suitable for d3 (with community, color, centrality, degree).
 */
export function processNetworkData(rawNodes: RawNode[], rawLinks: RawLink[]): GraphData {
  // Create an undirected graph (safe default for many network visualizations)
  const graph = new Graph({ type: 'undirected' });

  // Add nodes (avoid duplicates)
  rawNodes.forEach((node) => {
    const nodeId = String(node.id);
    if (!graph.hasNode(nodeId)) {
      // store a shallow copy of attributes to avoid mutating input objects later
      const attrs = { ...node };
      // Ensure we don't store `id` twice as a property and avoid non-plain values
      delete (attrs as any).id;
      graph.addNode(nodeId, attrs);
    }
  });

  // Add edges (avoid duplicates)
  rawLinks.forEach((link) => {
    const source = String(link.source);
    const target = String(link.target);

    if (graph.hasNode(source) && graph.hasNode(target)) {
      // check existence to avoid exception on duplicate edges
      if (!graph.hasEdge(source, target) && source !== target) {
        graph.addEdge(source, target);
      }
    }
  });

  // --- ANALYSIS ---

  // 1) Communities (Louvain) - returns a mapping nodeId -> communityId
  // louvain(graph) usually returns an object mapping node keys to community ids
  const communities = ((): Record<string, number> => {
    try {
      const result = louvain(graph);
      // force keys to be strings and values to numbers (defensive)
      const normalized: Record<string, number> = {};
      Object.entries(result || {}).forEach(([k, v]) => {
        normalized[String(k)] = Number(v);
      });
      return normalized;
    } catch (err) {
      // If Louvain fails for any reason, return empty mapping
      return {};
    }
  })();

  // Build colors for discovered communities
  const communityColors: Record<number, string> = {};
  Object.values(communities).forEach((commId) => {
    const idNum = Number(commId);
    if (!Number.isNaN(idNum) && communityColors[idNum] == null) {
      // Use the community id string as seed so colors are stable
      communityColors[idNum] = randomColor({ luminosity: 'light', seed: String(idNum) });
    }
  });

  // 2) Betweenness centrality (defensive call)
  let centralityScores: Record<string, number> = {};
  try {
    // The centrality module may have named exports; attempt to call the betweenness function if available.
    // Some versions export `betweennessCentrality` or `betweenness`.
    if (typeof (centrality as any).betweennessCentrality === 'function') {
      centralityScores = (centrality as any).betweennessCentrality(graph) || {};
    } else if (typeof (centrality as any).betweenness === 'function') {
      centralityScores = (centrality as any).betweenness(graph) || {};
    } else {
      // fallback: empty scores
      centralityScores = {};
    }
    // Normalize numeric values just in case
    Object.keys(centralityScores).forEach((k) => {
      centralityScores[k] = Number(centralityScores[k]) || 0;
    });
  } catch (err) {
    centralityScores = {};
  }

  // 3) Build analyzed nodes array
  const d3Nodes: AnalyzedNode[] = [];
  graph.forEachNode((nodeId, attributes) => {
    // community id might be undefined -> fallback to -1
    const comm = communities[nodeId];
    const commId = typeof comm !== 'undefined' ? Number(comm) : -1;
    const color = commId !== -1 && communityColors[commId] ? communityColors[commId] : randomColor({ luminosity: 'light', seed: nodeId });

    const nodeCentrality = typeof centralityScores[nodeId] !== 'undefined' ? centralityScores[nodeId] : 0;
    const nodeDegree = (() => {
      try {
        return graph.degree(nodeId);
      } catch {
        return 0;
      }
    })();

    const nodeData: AnalyzedNode = {
      id: nodeId,
      // copy original attributes (attributes may already be plain)
      ...(attributes as Record<string, any>),
      group: commId,
      color,
      centrality: nodeCentrality,
      degree: nodeDegree,
    };

    d3Nodes.push(nodeData);
  });

  // 4) For links, it's usually fine to pass rawLinks for D3; ensure sources/targets are string IDs
  const d3Links: RawLink[] = rawLinks.map((l) => ({
    ...l,
    source: String(l.source),
    target: String(l.target),
  }));

  return { nodes: d3Nodes, links: d3Links };
}
