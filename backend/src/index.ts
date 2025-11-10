import express, { Request, Response } from 'express';
import cors from 'cors';
import { parseManifest } from './parser';
import { extractRelationships } from './relationships';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/yaml', limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Parse Helm manifest endpoint
app.post('/api/parse', (req: Request, res: Response) => {
  try {
    const manifest = typeof req.body === 'string' ? req.body : req.body.manifest;
    
    if (!manifest) {
      return res.status(400).json({ error: 'No manifest provided' });
    }

    const objects = parseManifest(manifest);
    const relationships = extractRelationships(objects);

    res.json({
      objects,
      relationships,
      metadata: {
        totalObjects: objects.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      error: 'Failed to parse manifest',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get sample manifest
app.get('/api/sample', (req: Request, res: Response) => {
  const sampleManifest = `---
# Source: mychart/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.21.0
        ports:
        - containerPort: 80
          name: http
---
# Source: mychart/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  labels:
    app: myapp
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
---
# Source: mychart/templates/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  labels:
    app: myapp
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
---
# Source: mychart/templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  labels:
    app: myapp
data:
  config.json: |
    {
      "environment": "production",
      "logLevel": "info"
    }
`;

  res.type('text/yaml').send(sampleManifest);
});

app.listen(PORT, () => {
  console.log(`HelmScope backend running on port ${PORT}`);
});

export default app;
