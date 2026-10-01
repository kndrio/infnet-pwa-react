# Minhas Tasks — PWA em React + Firebase

Fechamento do projeto do curso **Desenvolvimento de Apps Híbridos com PWA**.
Evolui o app de Notes (vanilla JS) para um app de Tasks em React,
com backend de verdade (Firebase Auth + Firestore) e as três telas do
projeto final: **Login**, **Home** (cadastro de tasks) e **Dashboard**
(tasks feitas do dia).

## Por que React + Firebase encerra bem o curso

Para mostrar como um sistema atual com React incorpora a utilização do PWA, para 
fazê-lo se comportar como um APP. Este projeto materializa isso em cima
de tudo que já foi construído:

| Conceito das aulas anteriores | Sucessor aqui |
|---|---|
| Login fake (usuário/senha no localStorage) | Firebase Auth de verdade (e-mail/senha) |
| IndexedDB (Dexie) + fila "outbox" manual | Firestore com cache local persistente (offline nativo) |
| Background Sync (`sync-notes`) | Sincronização automática do próprio SDK do Firestore |
| `sw.js` escrito à mão (App Shell, cache-first) | `vite-plugin-pwa` (Workbox) gerando o App Shell no build |
| Botão "Ativar notificações" só testável via DevTools (sem backend) | Firebase Cloud Messaging: push de verdade, de qualquer origem, até pelo próprio Console do Firebase |
| `beforeinstallprompt` (já existia) | Mantido e reforçado — é o coração de "comportar como um APP" |

## Rodando localmente

```bash
npm install
cp .env.example .env   # ajuste conforme a seção abaixo
npm run dev
```

**Sem nenhum ajuste além do `cp` acima, as *tasks* (Home/Dashboard) já
funcionam** — `VITE_DATA_BACKEND=mock` no `.env.example` liga um dublê em
memória. **O *login* não funciona sozinho**: o app tenta falar com o
Firebase Auth Emulator em `127.0.0.1:9099`, e só existe alguém ali depois
que você roda o comando da opção 0 abaixo (ou configura um projeto real -
opção B). Sem isso, "Criar conta"/"Entrar" falha com erro de rede.

### Opção 0 — caminho mais rápido pra ver funcionando (só o login)

Não precisa de Java nem de projeto Firebase real — o emulador de Auth é
JavaScript puro, embutido no `firebase-tools`:

```bash
npx firebase emulators:start --only auth
```

Deixa isso rodando num terminal, `npm run dev` rodando em outro. Agora
"Criar conta" (aba da tela de Login) funciona de verdade contra esse
emulador, e as tasks continuam no dublê em memória (`VITE_DATA_BACKEND=mock`).
Essa foi exatamente a combinação usada para testar este projeto (ver
"Como foi testado" abaixo).

### Opção A — com os emuladores do Firebase, incluindo Firestore (para testar tasks de verdade)

Mantenha `VITE_USE_EMULATORS=true` e `VITE_DATA_BACKEND=firestore` no `.env`,
e em outro terminal:

```bash
npx firebase emulators:start --only auth,firestore
```

### Opção B — com um projeto Firebase real

1. Crie um projeto em <https://console.firebase.google.com>.
2. Ative **Authentication > Sign-in method > E-mail/senha**.
3. Crie um banco **Firestore** (modo produção) e publique as regras deste
   repositório: `npx firebase deploy --only firestore:rules` (ou cole o
   conteúdo de `firestore.rules` no Console).
4. Em **Project Settings > Your apps**, crie um app Web e copie a config
   para o `.env` (as chaves `VITE_FIREBASE_*`).
5. Para notificações push: **Project Settings > Cloud Messaging > Web
   Push certificates > Generate key pair** e cole em
   `VITE_FIREBASE_VAPID_KEY`. Também troque o `firebaseConfig` fixo no
   topo de `public/firebase-messaging-sw.js` pelos mesmos valores do
   `.env` (o service worker não lê variáveis de ambiente do Vite).
6. Defina `VITE_USE_EMULATORS=false` e `VITE_DATA_BACKEND=firestore`.

## Onde está o Service Worker / o PWA propriamente dito?

Diferente do projeto anterior (JS Puro), não existe um `sw.js` escrito à mão neste
projeto. Ele é **gerado no build** pelo `vite-plugin-pwa` (Workbox), a
partir da configuração em `vite.config.js` (bloco `VitePWA({...})`) — é o
equivalente ao array `ASSETS` + `cacheFirst`/`networkFirst`/`CACHE_VERSION`
de antes, só que descrito como configuração em vez de código manual.

- **`npm run dev`**: como `devOptions.enabled: true` está ligado no
  `vite.config.js`, o SW já registra em modo desenvolvimento. Confira em
  DevTools → Application → Service Workers.
- **`npm run build`**: gera os arquivos de verdade em `dist/` —
  `dist/sw.js`, `dist/workbox-*.js`, `dist/manifest.webmanifest`,
  `dist/registerSW.js`. Rode `npm run preview` depois pra servir esse
  build e ver o comportamento de produção (inclusive o botão de instalar).
- **`public/firebase-messaging-sw.js`**: esse sim é um arquivo estático
  de verdade (não gerado) — é um *segundo* service worker, específico
  para o Firebase Cloud Messaging (push em background).

## Estrutura

```
src/
  firebase.js                    # init do SDK (Auth, Firestore, Messaging)
  contexts/AuthContext.jsx       # sessão do usuário (onAuthStateChanged)
  services/
    taskService.firestore.js     # implementação real (Firestore)
    taskService.mock.js          # dublê em memória (mesma interface)
    taskServiceProvider.js       # escolhe uma das duas via VITE_DATA_BACKEND
  components/
    ProtectedRoute.jsx           # bloqueia /home e /dashboard sem login
    OfflineBanner.jsx            # App Shell: aviso de "você está offline"
    InstallPwaButton.jsx         # beforeinstallprompt — "comportar como APP"
    NotificationButton.jsx       # pede permissão + token de push (FCM)
    NavBar.jsx
  pages/
    Login.jsx                    # login/registro (Firebase Auth)
    Home.jsx                     # cadastro de tasks (Firestore)
    Dashboard.jsx                # tasks feitas hoje (Firestore)
vite.config.js                   # vite-plugin-pwa: manifest + App Shell
public/firebase-messaging-sw.js  # service worker do FCM (push em background)
firebase.json / firestore.rules  # config do projeto Firebase / regras de acesso
```

## Como foi testado

- `npm run build` — build de produção sem erros, gera o service worker
  (Workbox) e o `manifest.webmanifest`.
- Playwright (Chromium headless) contra `npm run preview`, cobrindo:
  registro e login reais contra o **Firebase Auth Emulator**, persistência
  de sessão após reload, rota protegida redirecionando usuário deslogado,
  mensagem de erro traduzida para credenciais inválidas, cadastro/edição/
  exclusão de tasks e a tela Dashboard separando "feitas hoje" de
  "pendentes" (contra o dublê `taskService.mock.js`), manifest com
  `display: "standalone"` e `shortcuts`, service worker registrado, e o
  banner de offline aparecendo/sumindo com os eventos `online`/`offline`
  do navegador. Todas as asserções passaram.
-  durante a aula do dia 30/09/2026 o fluxo de login/registro foi testado de ponta a ponta contra um Firebase Auth real.
- O que **não** deu para testar ao vivo neste ambiente: Recebimento de um push via FCM. O código de produção (`taskService.firestore.js`, `firebase-messaging-sw.js`) foi
  escrito contra a API oficial e documentada do SDK; validar isso depende da VAPID_KEY a ser gerada por vocês no Firebase Console.