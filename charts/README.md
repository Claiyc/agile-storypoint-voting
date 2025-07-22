# Agile App Helm Chart

This Helm chart deploys the Agile Story Point Voting App stack (Nuxt3 frontend, Node.js backend, Redis, and optional Ollama) on Kubernetes.

## Features
- Deploys frontend, backend, and Redis as separate deployments/services
- Optional Ollama AI service for agile explanations
- Configurable ingress for frontend and backend
- All environment variables, images, and resources configurable via `values.yaml`
- Supports persistent Redis storage

## Usage

```sh
helm install agile-app ./helm \
  --set frontend.image.repository=your-frontend-image \
  --set backend.image.repository=your-backend-image
```

## Configuration
See `values.yaml` for all available options. Key settings:

- `frontend.*`: Image, env, resources, ingress, service
- `backend.*`: Image, env, resources, ingress, service
- `redis.*`: Enable/disable, image, persistence, password
- `ollama.*`: Enable/disable, image, service
- `nodeSelector`, `tolerations`, `affinity`: Pod scheduling

## Example: Enable Ollama
```yaml
ollama:
  enabled: true
  image:
    repository: ollama/ollama
    tag: latest
```

## Example: Enable Ingress
```yaml
frontend:
  ingress:
    enabled: true
    hosts:
      - host: agile.local
        paths:
          - /
```

## Notes
- Set the correct image repositories/tags for your frontend and backend builds.
- If using Ollama, ensure the backend's `OLLAMA_URL` env is set to the correct service URL.
- For production, enable Redis persistence and set a password. 