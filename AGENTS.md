# Base44 Setup Notes

## Stack
- Vite 8 + React 19 + TypeScript + TanStack Start (SSR) + Tailwind CSS 4
- Frontend-only; no backend, no database
- Blink SDK (`@blinkdotnew/sdk`) with hardcoded fallback credentials — no external secrets needed

## Running
- `docker compose -f docker-compose.base44.yml up -d`
- Dev server on port 3000 (configured in vite.config.ts: `server.port: 3000, host: true, allowedHosts: true`)
- Uses `npm install --legacy-peer-deps` (react/react-three peer conflict)
- react and react-dom must be explicit dependencies in package.json (they were missing originally)

## Key Files
- `src/routes/index.tsx` — main AuraStudio AI app (image/video generators, collection, presets)
- `src/lib/collection.ts` — localStorage persistence for creations, presets, prompt templates
- `src/components/CollectionGallery.tsx` — "Mi Colección" gallery grid
- `src/components/ImageUploader.tsx` — reusable image upload (single or multiple)
- `src/routes/app.tsx` + `src/routes/app/` — unused SaaS dashboard shell (opt-in)

## SSR Notes
- TanStack Start renders routes on the server; browser-only state (localStorage) must be in `useEffect`, not render
- Route tree is auto-generated in `src/routeTree.gen.ts` — do not edit manually
- The vite config has custom plugins for CSS injection and route-tree health checks
