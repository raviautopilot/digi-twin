# Personal ERP / Digital Twin Frontend Application (Phase 1)

This is the foundational frontend client for the Modular Personal ERP / Digital Twin control plane. Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4**, this application integrates real-time microservice status checking and dashboard setups for Configuration Management and Base Entity Setup.

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- Access to running backend services:
  - **Config Management Service**: `http://localhost:1705`
  - **Core Entity Setup Service**: `http://localhost:1706`

---

## Local Development Commands

To run the application locally for development:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   *The server runs locally by default at `http://localhost:5173/`.*

3. **Build Bundle (Strict Typechecks & Minification)**:
   ```bash
   npm run build
   ```

4. **Local Preview of Production Build**:
   ```bash
   npm run preview
   ```

---

## Operational Shell Script (`scripts/digi-twin.sh`)

An operational script has been provided at [scripts/digi-twin.sh](file:///home/ubuntu/code/github/raviautopilot/rWork/scripts/digi-twin.sh) to mirror the service control scripts used by the Go backend microservices.

### Commands Syntax:
All commands are run from the parent project directory or the `scripts` folder:

```bash
# Compile and build the application
./scripts/digi-twin.sh build

# Start the React/Vite development server in the background
./scripts/digi-twin.sh start

# Check the status of the background server and port binding
./scripts/digi-twin.sh status

# Monitor the running logs
./scripts/digi-twin.sh logs
./scripts/digi-twin.sh logs -f   # Follow logs stream

# Stop the background process gracefully
./scripts/digi-twin.sh stop

# Force kill any process holding the port 5173
./scripts/digi-twin.sh kill

# Clean compile artifacts (removes dist folder)
./scripts/digi-twin.sh clean

# Build and bundle the production build into a tarball
./scripts/digi-twin.sh package
```

---

## Production Deployment Guideline

Vite compiles the React application into a highly optimized, fully static directory: **`dist/`**. This directory contains index.html, JS chunks, and CSS assets.

Since the application uses client-side routing (`react-router-dom`), the web server **must** be configured to rewrite all non-file requests to `index.html` (Fallback Routing).

### 1. Simple Static Host (Testing/Internal Node Environment)
You can serve the static build using a simple static host:
```bash
# Host using sirv
npx -y sirv-cli dist --single --port 8080
```

### 2. Standard Nginx Server Configuration
For production deployments, place the following block in your Nginx configuration (e.g. `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name erp.digitaltwin.local;

    root /var/www/digi-twin/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Static Assets Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # SPA Client Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. API Proxy Configuration (Avoid CORS in Production)
If you deploy backend microservices behind the same domain, configure proxy paths:
```nginx
    location /api/v1/config/ {
        proxy_pass http://localhost:1705/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/v1/core/ {
        proxy_pass http://localhost:1706/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
```
