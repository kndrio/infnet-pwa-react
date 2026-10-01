import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

/**
 * Botão de instalação (beforeinstallprompt) - é o que torna concreta a
 * competência da Aula 8: "como fazer o PWA se comportar como um APP".
 * Sem isso, o PWA é só um site que funciona offline; com isso, o usuário
 * pode colocar um ícone na tela inicial/dock e abrir o app numa janela
 * própria, sem a barra de endereço do navegador (display: "standalone" no
 * manifest cuida da parte visual - ver vite.config.js).
 */
export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    function onBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function onAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  async function handleInstall() {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário ${outcome} a instalação do PWA`);
    setDeferredPrompt(null);
  }

  return (
    <Button size="sm" variant="outline-light" onClick={handleInstall}>
      Instalar app
    </Button>
  );
}
