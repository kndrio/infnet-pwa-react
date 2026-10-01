import { useEffect, useState } from "react";

/**
 * Reimplementação do banner offline da Aula 6/7 (antes era um <div hidden>
 * manipulado via JS puro) - mesma ideia de UX (App Shell sempre visível,
 * avisando quando a rede cai), agora como componente React controlado por
 * estado. Continua tendo funcionalidade real com o Firestore: o SDK
 * guarda as escritas localmente e sincroniza sozinho quando a rede volta
 * (substitui a fila "outbox" manual das aulas anteriores).
 */
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status">
      Você está offline. Suas tasks continuam sendo salvas localmente e serão
      sincronizadas quando a conexão voltar.
    </div>
  );
}
