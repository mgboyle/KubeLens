import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import './GraphVisualization.css';
import { ParsedData } from '../App';

cytoscape.use(dagre);

interface GraphVisualizationProps {
  data: ParsedData;
  onNodeSelect: (nodeId: string) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create nodes from K8s objects
    const nodes = data.objects.map(obj => ({
      data: {
        id: obj.id,
        label: `${obj.kind}\n${obj.metadata.name}`,
        kind: obj.kind,
      },
    }));

    // Create edges from relationships
    const edges = data.relationships.map((rel, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: rel.source,
        target: rel.target,
        label: rel.type,
      },
    }));

    // Color mapping for different K8s resource types
    const kindColors: Record<string, string> = {
      'Deployment': '#4caf50',
      'Service': '#2196f3',
      'Ingress': '#ff9800',
      'ConfigMap': '#9c27b0',
      'Secret': '#f44336',
      'Pod': '#00bcd4',
      'StatefulSet': '#3f51b5',
      'DaemonSet': '#795548',
    };

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => kindColors[ele.data('kind')] || '#757575',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': 2,
            'width': 120,
            'height': 80,
            'font-size': '12px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '3px',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#ffd700',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 100,
      } as any,
    });

    // Add click event listener
    cy.on('tap', 'node', (event: any) => {
      const nodeId = event.target.data('id');
      onNodeSelect(nodeId);
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, onNodeSelect]);

  return (
    <div className="graph-container">
      <div ref={containerRef} className="cytoscape-container" />
      <div className="legend">
        <h3>Resource Types</h3>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#4caf50' }}></span>
          Deployment
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#2196f3' }}></span>
          Service
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ff9800' }}></span>
          Ingress
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#9c27b0' }}></span>
          ConfigMap
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;
