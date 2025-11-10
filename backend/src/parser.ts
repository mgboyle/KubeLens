import * as yaml from 'js-yaml';

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

export function parseManifest(manifestContent: string): K8sObject[] {
  const objects: K8sObject[] = [];
  
  // Split by YAML document separator
  const documents = manifestContent.split(/^---$/m);
  
  for (const doc of documents) {
    const trimmed = doc.trim();
    if (!trimmed) {
      continue;
    }
    
    try {
      const parsed = yaml.load(trimmed) as any;
      
      if (!parsed || typeof parsed !== 'object') {
        continue;
      }
      
      // Skip if missing required fields
      if (!parsed.kind || !parsed.metadata?.name) {
        continue;
      }
      
      const obj: K8sObject = {
        id: `${parsed.kind}-${parsed.metadata.name}`,
        apiVersion: parsed.apiVersion || 'v1',
        kind: parsed.kind,
        metadata: {
          name: parsed.metadata.name,
          namespace: parsed.metadata.namespace,
          labels: parsed.metadata.labels,
          annotations: parsed.metadata.annotations,
        },
        spec: parsed.spec,
        data: parsed.data,
      };
      
      objects.push(obj);
    } catch (error) {
      console.error('Failed to parse document:', error);
      // Continue parsing other documents
    }
  }
  
  return objects;
}

export function extractObjectDetails(obj: K8sObject) {
  const details: any = {
    apiVersion: obj.apiVersion,
    kind: obj.kind,
    name: obj.metadata.name,
    namespace: obj.metadata.namespace || 'default',
    labels: obj.metadata.labels || {},
  };

  // Extract images from containers
  if (obj.spec?.template?.spec?.containers) {
    details.images = obj.spec.template.spec.containers.map((c: any) => c.image);
  }

  // Extract ports
  if (obj.spec?.ports) {
    details.ports = obj.spec.ports;
  } else if (obj.spec?.template?.spec?.containers) {
    const allPorts = obj.spec.template.spec.containers.flatMap((c: any) => c.ports || []);
    if (allPorts.length > 0) {
      details.ports = allPorts;
    }
  }

  // Extract replicas for deployments
  if (obj.spec?.replicas !== undefined) {
    details.replicas = obj.spec.replicas;
  }

  // Extract selector
  if (obj.spec?.selector) {
    details.selector = obj.spec.selector;
  }

  // Extract service type
  if (obj.kind === 'Service' && obj.spec?.type) {
    details.type = obj.spec.type;
  }

  return details;
}
