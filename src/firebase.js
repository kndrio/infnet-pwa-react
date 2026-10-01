/**
 * Inicialização do Firebase (Aula 8 - fechamento do projeto em React).
 *
 * Por que isso substitui o "backend" que nunca existiu nas Aulas 3-7:
 *   - Auth: antes tínhamos um login fake (checava usuário/senha fixos no
 *     localStorage). Agora é autenticação de verdade, com sessão persistida
 *     pelo próprio SDK do Firebase.
 *   - Firestore: antes tínhamos IndexedDB (via Dexie) + uma fila "outbox" +
 *     Background Sync pra tentar reenviar quando a rede voltasse, porque
 *     não existia servidor nenhum (o fetch ia pro jsonplaceholder, uma API
 *     fake que não guardava nada de verdade). O Firestore tem cache local
 *     e sincronização offline EMBUTIDOS no SDK: grava local primeiro,
 *     sincroniza quando a rede volta, sem nós termos que escrever a fila
 *     manualmente. É o sucessor natural do padrão outbox que já tínhamos.
 *
 * As credenciais reais do projeto Firebase NÃO ficam hard-coded aqui -
 * vêm de variáveis de ambiente (ver .env.example). Enquanto você não tiver
 * um projeto Firebase real configurado, o app roda contra o Firebase Local
 * Emulator Suite (VITE_USE_EMULATORS=true), que não precisa de nenhuma
 * credencial de verdade.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-infnet-pwa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-infnet-pwa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-infnet-pwa.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:demo",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

// Firestore com cache local persistente (IndexedDB por baixo dos panos) e
// suporte a múltiplas abas abertas - é o que dá o comportamento "offline
// first" sem nenhum código de outbox manual.
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true";

if (useEmulators) {
  console.info("[firebase] Conectando aos emuladores locais (Auth :9099, Firestore :8080).");
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

// Cloud Messaging só existe em contexto seguro (https/localhost) e em
// navegadores com suporte - por isso a checagem assíncrona antes de pedir
// a instância.
export async function getMessagingIfSupported() {
  if (!(await isMessagingSupported())) return null;
  try {
    return getMessaging(firebaseApp);
  } catch (err) {
    console.warn("[firebase] Messaging indisponível:", err);
    return null;
  }
}

export const firebaseConfigForServiceWorker = firebaseConfig;
