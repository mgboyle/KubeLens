import React, { useState } from 'react';
import './ManifestInput.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface ManifestInputProps {
  onParsedData: (data: any) => void;
  onError: (error: string) => void;
}

const ManifestInput: React.FC<ManifestInputProps> = ({ onParsedData, onError }) => {
  const [manifest, setManifest] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!manifest.trim()) {
      onError('Please enter a Helm manifest');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/yaml',
        },
        body: manifest,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse manifest');
      }

      const data = await response.json();
      onParsedData(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/sample`);
      if (!response.ok) {
        throw new Error('Failed to load sample manifest');
      }
      const sampleManifest = await response.text();
      setManifest(sampleManifest);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manifest-input">
      <div className="input-header">
        <h2>Helm Manifest Input</h2>
        <div className="button-group">
          <button 
            onClick={handleLoadSample} 
            disabled={loading}
            className="sample-button"
          >
            📋 Load Sample
          </button>
          <button 
            onClick={handleParse} 
            disabled={loading || !manifest.trim()}
            className="parse-button"
          >
            {loading ? '⏳ Parsing...' : '🔍 Parse Manifest'}
          </button>
        </div>
      </div>
      <textarea
        className="manifest-textarea"
        value={manifest}
        onChange={(e) => setManifest(e.target.value)}
        placeholder="Paste your Helm manifest YAML here or click 'Load Sample'..."
        rows={15}
      />
    </div>
  );
};

export default ManifestInput;
