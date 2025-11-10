import React, { useState } from 'react';
import './App.css';
import ManifestInput from './components/ManifestInput';
import GraphVisualization from './components/GraphVisualization';
import DetailsPanel from './components/DetailsPanel';

export interface K8sObject {
  id: string;
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec?: any;
  data?: any;
}

export interface Relationship {
  source: string;
  target: string;
  type: string;
}

export interface ParsedData {
  objects: K8sObject[];
  relationships: Relationship[];
  metadata: {
    totalObjects: number;
    timestamp: string;
  };
}

function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedObject, setSelectedObject] = useState<K8sObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParsedData = (data: ParsedData) => {
    setParsedData(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setParsedData(null);
  };

  const handleNodeSelect = (objectId: string) => {
    if (parsedData) {
      const obj = parsedData.objects.find(o => o.id === objectId);
      setSelectedObject(obj || null);
    }
  };

  const handleExportJson = () => {
    if (parsedData) {
      const dataStr = JSON.stringify(parsedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'helmscope-export.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 HelmScope</h1>
        <p>Kubernetes Helm Manifest Visualizer</p>
      </header>
      
      <div className="App-container">
        <ManifestInput 
          onParsedData={handleParsedData}
          onError={handleError}
        />
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {parsedData && (
          <>
            <div className="controls">
              <button onClick={handleExportJson} className="export-button">
                📥 Export JSON
              </button>
              <div className="stats">
                Objects: {parsedData.metadata.totalObjects} | 
                Relationships: {parsedData.relationships.length}
              </div>
            </div>
            
            <div className="visualization-container">
              <GraphVisualization 
                data={parsedData}
                onNodeSelect={handleNodeSelect}
              />
              {selectedObject && (
                <DetailsPanel 
                  object={selectedObject}
                  onClose={() => setSelectedObject(null)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
