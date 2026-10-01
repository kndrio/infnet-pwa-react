import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "generateSW" faz o vite-plugin-pwa montar o service worker pra
      // gente (via Workbox), recriando em cima de Vite/React exatamente o
      // que era escrito à mão em sw.js nas Aulas 3-7: precache do App
      // Shell (HTML/CSS/JS/ícones, aqui chamados de "arquivos com hash de
      // build") + estratégias de runtime caching por tipo de requisição.
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        id: "/",
        name: "Minhas Tasks",
        short_name: "Tasks",
        description:
          "PWA de tarefas com login (Firebase Auth), sincronização (Firestore) e notificações (FCM).",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#212529",
        lang: "pt-BR",
        icons: [
          { src: "icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        // Shortcuts: atalho que aparece ao pressionar/segurar o ícone do
        // app instalado (como nos apps nativos) — outro pedaço concreto
        // da competência "comportar como um APP" da Aula 8.
        shortcuts: [
          {
            name: "Nova task",
            short_name: "Nova task",
            url: "/home",
            icons: [{ src: "icons/icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Dashboard",
            short_name: "Dashboard",
            url: "/dashboard",
            icons: [{ src: "icons/icon-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        // App Shell: cache-first para os arquivos estáticos do build
        // (equivalente ao array ASSETS + cacheFirst() da Aula 6).
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // Firestore fala com o backend via streams/websocket-like
            // (gRPC-web) — não faz sentido (nem funciona bem) colocar
            // cache-de-navegador em cima disso; o próprio SDK já resolve
            // o "offline" via persistentLocalCache (ver firebase.js).
            urlPattern: ({ url }) => url.hostname.includes("firestore.googleapis.com"),
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        // Permite testar o service worker também em `vite dev`, não só
        // no build de produção — facilita o teste automatizado abaixo.
        enabled: true,
        type: "module",
      },
    }),
  ],
});
