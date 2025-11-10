import { K8sObject } from './parser';

export interface Relationship {
  source: string;
  target: string;
  type: string;
}

export function extractRelationships(objects: K8sObject[]): Relationship[] {
  const relationships: Relationship[] = [];
  
  // Build lookup maps
  const servicesBySelector = new Map<string, K8sObject[]>();
  const deploymentsByLabel = new Map<string, K8sObject>();
  
  for (const obj of objects) {
    if (obj.kind === 'Service' && obj.spec?.selector) {
      const selectorKey = JSON.stringify(obj.spec.selector);
      if (!servicesBySelector.has(selectorKey)) {
        servicesBySelector.set(selectorKey, []);
      }
      servicesBySelector.get(selectorKey)!.push(obj);
    }
    
    if (obj.kind === 'Deployment' && obj.spec?.template?.metadata?.labels) {
      const labelKey = JSON.stringify(obj.spec.template.metadata.labels);
      deploymentsByLabel.set(labelKey, obj);
    }
  }
  
  // Find Service -> Deployment relationships
  for (const [selectorKey, services] of servicesBySelector.entries()) {
    const deployment = deploymentsByLabel.get(selectorKey);
    if (deployment) {
      for (const service of services) {
        relationships.push({
          source: service.id,
          target: deployment.id,
          type: 'routes-to',
        });
      }
    }
  }
  
  // Find Ingress -> Service relationships
  for (const obj of objects) {
    if (obj.kind === 'Ingress' && obj.spec?.rules) {
      for (const rule of obj.spec.rules) {
        if (rule.http?.paths) {
          for (const path of rule.http.paths) {
            const serviceName = path.backend?.service?.name || path.backend?.serviceName;
            if (serviceName) {
              const service = objects.find(
                o => o.kind === 'Service' && o.metadata.name === serviceName
              );
              if (service) {
                relationships.push({
                  source: obj.id,
                  target: service.id,
                  type: 'routes-to',
                });
              }
            }
          }
        }
      }
    }
  }
  
  // Find Deployment -> ConfigMap relationships
  for (const obj of objects) {
    if (obj.kind === 'Deployment' && obj.spec?.template?.spec) {
      const volumes = obj.spec.template.spec.volumes || [];
      for (const volume of volumes) {
        if (volume.configMap?.name) {
          const configMap = objects.find(
            o => o.kind === 'ConfigMap' && o.metadata.name === volume.configMap.name
          );
          if (configMap) {
            relationships.push({
              source: obj.id,
              target: configMap.id,
              type: 'uses',
            });
          }
        }
      }
      
      // Check env from configMap
      const containers = obj.spec.template.spec.containers || [];
      for (const container of containers) {
        const envFrom = container.envFrom || [];
        for (const env of envFrom) {
          if (env.configMapRef?.name) {
            const configMap = objects.find(
              o => o.kind === 'ConfigMap' && o.metadata.name === env.configMapRef.name
            );
            if (configMap) {
              relationships.push({
                source: obj.id,
                target: configMap.id,
                type: 'uses',
              });
            }
          }
        }
      }
    }
  }
  
  return relationships;
}
