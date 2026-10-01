import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { getToken } from "firebase/messaging";
import { getMessagingIfSupported } from "../firebase.js";

/**
 * Continuação direta da Aula 7. Lá, o botão "Ativar notificações" só
 * conseguia mostrar notificações DISPARADAS PELO PRÓPRIO NAVEGADOR
 * (showNotification local, ou o painel "Push" do DevTools simulando um
 * evento) porque não existia backend nenhum para de fato enviar um push
 * pela rede. Agora, com Firebase Cloud Messaging, existe: getToken() pede
 * ao navegador um "endereço" único (o token) para o qual QUALQUER backend
 * (inclusive o Firebase Console, sem escrever uma linha de servidor) pode
 * mandar uma notificação de verdade, mesmo com o app fechado - é a peça
 * que faltava e fecha o assunto "Notificações" do curso.
 */
export default function NotificationButton() {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("");

  async function fetchToken() {
    const messaging = await getMessagingIfSupported();
    if (!messaging) {
      setStatus("Push não suportado neste navegador/contexto.");
      return;
    }
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      setStatus(
        "Permissão concedida, mas falta VITE_FIREBASE_VAPID_KEY no .env para obter o token de push (veja README.md)."
      );
      return;
    }
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });
      if (currentToken) {
        setToken(currentToken);
        setStatus("Notificações ativadas. Token de push obtido com sucesso.");
      } else {
        setStatus("Não foi possível obter o token de push.");
      }
    } catch (err) {
      setStatus("Erro ao obter token de push: " + err.message);
    }
  }

  useEffect(() => {
    if (permission === "granted" && !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClick() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await fetchToken();
    } else {
      setStatus("Notificações não autorizadas.");
    }
  }

  if (permission === "unsupported") {
    return <small className="text-muted">Este navegador não suporta notificações.</small>;
  }

  if (permission === "granted") {
    return <small className="text-success">{status || "Notificações ativadas."}</small>;
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <Button size="sm" variant="outline-primary" onClick={handleClick}>
        Ativar notificações
      </Button>
      {status && <small className="text-muted">{status}</small>}
    </div>
  );
}
