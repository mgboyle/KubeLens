# 🔍 HelmScope

A fully-featured TypeScript application for visualizing Kubernetes Helm manifests. HelmScope parses Helm manifests, extracts Kubernetes objects and their relationships, and provides an interactive graph visualization with detailed information about each resource.

![HelmScope](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## ✨ Features

- 🎯 **Helm Manifest Parsing**: Parse YAML manifests and extract Kubernetes objects
- 📊 **Interactive Graph Visualization**: Cytoscape-powered graph showing resources and relationships
- 🔍 **Detailed Resource Information**: Expandable panels with metadata, labels, images, and ports
- 📥 **JSON Export**: Export parsed data for further analysis
- 🧪 **Sample Manifest**: Built-in sample for quick testing
- ✅ **Comprehensive Testing**: Unit tests with Jest and E2E tests with Playwright
- 🐳 **Docker Support**: Full Docker and docker-compose setup for immediate deployment

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OR Node.js 18+ and npm

### Run with Docker Compose (Recommended)

The fastest way to get HelmScope running:

```bash
docker-compose up
```

Then open your browser to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Run Locally for Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

The backend API will be available at http://localhost:3001

#### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at http://localhost:3000

## 📚 API Documentation

### Endpoints

#### `POST /api/parse`

Parse a Helm manifest and extract Kubernetes objects and relationships.

**Request:**
```
Content-Type: text/yaml

<YAML manifest content>
```

**Response:**
```json
{
  "objects": [
    {
      "id": "Deployment-myapp-deployment",
      "apiVersion": "apps/v1",
      "kind": "Deployment",
      "metadata": {
        "name": "myapp-deployment",
        "labels": {...}
      },
      "spec": {...}
    }
  ],
  "relationships": [
    {
      "source": "Service-myapp-service",
      "target": "Deployment-myapp-deployment",
      "type": "routes-to"
    }
  ],
  "metadata": {
    "totalObjects": 4,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/sample`

Get a sample Helm manifest for testing.

**Response:**
```
Content-Type: text/yaml

<Sample YAML manifest>
```

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Backend Unit Tests

```bash
cd backend
npm test
```

Tests cover:
- YAML manifest parsing
- Kubernetes object extraction
- Relationship detection (Service→Deployment, Ingress→Service, Deployment→ConfigMap)

### Frontend Tests

```bash
cd frontend
npm test
```

### E2E Integration Tests (Playwright)

```bash
cd tests
npm install
npm test
```

The integration test covers:
- Loading and parsing sample manifests
- Graph visualization rendering
- JSON export functionality

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)

- **`src/index.ts`**: Express server with CORS and API endpoints
- **`src/parser.ts`**: YAML parsing and K8s object extraction
- **`src/relationships.ts`**: Relationship detection between resources

### Frontend (React + TypeScript)

- **`App.tsx`**: Main application component
- **`ManifestInput.tsx`**: Manifest input and parsing control
- **`GraphVisualization.tsx`**: Cytoscape graph rendering
- **`DetailsPanel.tsx`**: Expandable details for selected resources

### Relationship Detection

HelmScope automatically detects:
- **Service → Deployment**: Via label selectors
- **Ingress → Service**: Via backend service references
- **Deployment → ConfigMap**: Via volume mounts and environment variables

## 🎨 Resource Types & Visualization

Resources are color-coded in the graph:
- 🟢 **Deployment**: Green
- 🔵 **Service**: Blue
- 🟠 **Ingress**: Orange
- 🟣 **ConfigMap**: Purple
- 🔴 **Secret**: Red

## 📂 Project Structure

```
.
├── backend/                 # Backend API
│   ├── src/
│   │   ├── __tests__/      # Jest unit tests
│   │   ├── index.ts        # Express server
│   │   ├── parser.ts       # YAML parser
│   │   └── relationships.ts # Relationship detection
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── tsconfig.json
├── tests/                  # E2E tests
│   ├── e2e/
│   │   └── helmscope.spec.ts
│   ├── playwright.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev      # Start with hot reload
npm run build    # Build TypeScript
npm test         # Run tests
npm run lint     # Lint code
```

### Frontend Development

```bash
cd frontend
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 🐳 Docker

### Build Images

```bash
# Backend
docker build -t helmscope-backend ./backend

# Frontend
docker build -t helmscope-frontend ./frontend
```

### Run Containers

```bash
docker-compose up -d
```

### Stop Containers

```bash
docker-compose down
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT

## 🙏 Acknowledgments

- [Cytoscape.js](https://js.cytoscape.org/) for graph visualization
- [js-yaml](https://github.com/nodeca/js-yaml) for YAML parsing
- [Express](https://expressjs.com/) for the backend framework
- [React](https://react.dev/) for the frontend framework