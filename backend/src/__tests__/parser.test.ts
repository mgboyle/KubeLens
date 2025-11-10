import { parseManifest, extractObjectDetails } from '../parser';

describe('Parser', () => {
  describe('parseManifest', () => {
    it('should parse a simple deployment manifest', () => {
      const manifest = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
  labels:
    app: test
spec:
  replicas: 3
`;

      const objects = parseManifest(manifest);
      
      expect(objects).toHaveLength(1);
      expect(objects[0].kind).toBe('Deployment');
      expect(objects[0].metadata.name).toBe('test-deployment');
      expect(objects[0].spec.replicas).toBe(3);
    });

    it('should parse multiple YAML documents', () => {
      const manifest = `
apiVersion: v1
kind: Service
metadata:
  name: test-service
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
`;

      const objects = parseManifest(manifest);
      
      expect(objects).toHaveLength(2);
      expect(objects[0].kind).toBe('Service');
      expect(objects[1].kind).toBe('Deployment');
    });

    it('should skip empty documents', () => {
      const manifest = `
---
apiVersion: v1
kind: Service
metadata:
  name: test-service
---
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
---
`;

      const objects = parseManifest(manifest);
      
      expect(objects).toHaveLength(2);
    });

    it('should handle comments', () => {
      const manifest = `
# This is a comment
apiVersion: v1
kind: Service
metadata:
  name: test-service
`;

      const objects = parseManifest(manifest);
      
      expect(objects).toHaveLength(1);
      expect(objects[0].kind).toBe('Service');
    });
  });

  describe('extractObjectDetails', () => {
    it('should extract basic details', () => {
      const obj = {
        id: 'Deployment-test',
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: 'test-deployment',
          labels: { app: 'test' },
        },
        spec: {
          replicas: 3,
        },
      };

      const details = extractObjectDetails(obj);
      
      expect(details.kind).toBe('Deployment');
      expect(details.name).toBe('test-deployment');
      expect(details.replicas).toBe(3);
    });

    it('should extract container images', () => {
      const obj = {
        id: 'Deployment-test',
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'test-deployment' },
        spec: {
          template: {
            spec: {
              containers: [
                { name: 'nginx', image: 'nginx:1.21' },
                { name: 'sidecar', image: 'sidecar:latest' },
              ],
            },
          },
        },
      };

      const details = extractObjectDetails(obj);
      
      expect(details.images).toHaveLength(2);
      expect(details.images).toContain('nginx:1.21');
      expect(details.images).toContain('sidecar:latest');
    });

    it('should extract ports from service', () => {
      const obj = {
        id: 'Service-test',
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: 'test-service' },
        spec: {
          ports: [
            { port: 80, targetPort: 8080 },
          ],
        },
      };

      const details = extractObjectDetails(obj);
      
      expect(details.ports).toHaveLength(1);
      expect(details.ports[0].port).toBe(80);
    });
  });
});
