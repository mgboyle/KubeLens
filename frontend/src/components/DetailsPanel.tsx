import React from 'react';
import './DetailsPanel.css';
import { K8sObject } from '../App';

interface DetailsPanelProps {
  object: K8sObject;
  onClose: () => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ object, onClose }) => {
  const extractDetails = () => {
    const details: any = {
      apiVersion: object.apiVersion,
      kind: object.kind,
      name: object.metadata.name,
      namespace: object.metadata.namespace || 'default',
      labels: object.metadata.labels || {},
    };

    // Extract images from containers
    if (object.spec?.template?.spec?.containers) {
      details.images = object.spec.template.spec.containers.map((c: any) => c.image);
    }

    // Extract ports
    if (object.spec?.ports) {
      details.ports = object.spec.ports;
    } else if (object.spec?.template?.spec?.containers) {
      const allPorts = object.spec.template.spec.containers.flatMap((c: any) => c.ports || []);
      if (allPorts.length > 0) {
        details.ports = allPorts;
      }
    }

    // Extract replicas for deployments
    if (object.spec?.replicas !== undefined) {
      details.replicas = object.spec.replicas;
    }

    // Extract service type
    if (object.kind === 'Service' && object.spec?.type) {
      details.type = object.spec.type;
    }

    return details;
  };

  const details = extractDetails();

  return (
    <div className="details-panel">
      <div className="details-header">
        <h2>📄 Details</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      
      <div className="details-content">
        <div className="detail-section">
          <h3>Basic Info</h3>
          <div className="detail-row">
            <span className="detail-label">Kind:</span>
            <span className="detail-value">{details.kind}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{details.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Namespace:</span>
            <span className="detail-value">{details.namespace}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">API Version:</span>
            <span className="detail-value">{details.apiVersion}</span>
          </div>
        </div>

        {Object.keys(details.labels).length > 0 && (
          <div className="detail-section">
            <h3>Labels</h3>
            {Object.entries(details.labels).map(([key, value]) => (
              <div key={key} className="detail-row">
                <span className="detail-label">{key}:</span>
                <span className="detail-value">{value as string}</span>
              </div>
            ))}
          </div>
        )}

        {details.images && (
          <div className="detail-section">
            <h3>Container Images</h3>
            {details.images.map((image: string, idx: number) => (
              <div key={idx} className="detail-row">
                <span className="detail-label">Image {idx + 1}:</span>
                <span className="detail-value code">{image}</span>
              </div>
            ))}
          </div>
        )}

        {details.ports && (
          <div className="detail-section">
            <h3>Ports</h3>
            {details.ports.map((port: any, idx: number) => (
              <div key={idx} className="detail-row">
                <span className="detail-label">
                  {port.name || `Port ${idx + 1}`}:
                </span>
                <span className="detail-value">
                  {port.containerPort || port.port}
                  {port.protocol && ` (${port.protocol})`}
                </span>
              </div>
            ))}
          </div>
        )}

        {details.replicas !== undefined && (
          <div className="detail-section">
            <h3>Scaling</h3>
            <div className="detail-row">
              <span className="detail-label">Replicas:</span>
              <span className="detail-value">{details.replicas}</span>
            </div>
          </div>
        )}

        {details.type && (
          <div className="detail-section">
            <h3>Service Type</h3>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{details.type}</span>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Raw Metadata</h3>
          <pre className="json-preview">
            {JSON.stringify(object.metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
