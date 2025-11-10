import { extractRelationships } from '../relationships';
import { K8sObject } from '../parser';

describe('Relationships', () => {
  describe('extractRelationships', () => {
    it('should find Service to Deployment relationships', () => {
      const objects: K8sObject[] = [
        {
          id: 'Service-myapp-service',
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'myapp-service' },
          spec: {
            selector: { app: 'myapp' },
          },
        },
        {
          id: 'Deployment-myapp-deployment',
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'myapp-deployment' },
          spec: {
            template: {
              metadata: {
                labels: { app: 'myapp' },
              },
            },
          },
        },
      ];

      const relationships = extractRelationships(objects);
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].source).toBe('Service-myapp-service');
      expect(relationships[0].target).toBe('Deployment-myapp-deployment');
      expect(relationships[0].type).toBe('routes-to');
    });

    it('should find Ingress to Service relationships', () => {
      const objects: K8sObject[] = [
        {
          id: 'Ingress-myapp-ingress',
          apiVersion: 'networking.k8s.io/v1',
          kind: 'Ingress',
          metadata: { name: 'myapp-ingress' },
          spec: {
            rules: [
              {
                http: {
                  paths: [
                    {
                      backend: {
                        service: {
                          name: 'myapp-service',
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: 'Service-myapp-service',
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'myapp-service' },
        },
      ];

      const relationships = extractRelationships(objects);
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].source).toBe('Ingress-myapp-ingress');
      expect(relationships[0].target).toBe('Service-myapp-service');
      expect(relationships[0].type).toBe('routes-to');
    });

    it('should find Deployment to ConfigMap relationships', () => {
      const objects: K8sObject[] = [
        {
          id: 'Deployment-myapp-deployment',
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'myapp-deployment' },
          spec: {
            template: {
              spec: {
                volumes: [
                  {
                    configMap: {
                      name: 'myapp-config',
                    },
                  },
                ],
              },
            },
          },
        },
        {
          id: 'ConfigMap-myapp-config',
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'myapp-config' },
        },
      ];

      const relationships = extractRelationships(objects);
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].source).toBe('Deployment-myapp-deployment');
      expect(relationships[0].target).toBe('ConfigMap-myapp-config');
      expect(relationships[0].type).toBe('uses');
    });

    it('should return empty array when no relationships exist', () => {
      const objects: K8sObject[] = [
        {
          id: 'Service-test',
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'test' },
        },
      ];

      const relationships = extractRelationships(objects);
      
      expect(relationships).toHaveLength(0);
    });
  });
});
