import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "../painel/app-shell.css";
import "./alertas.css";

/*
  =========================================================
  CONQUISTIA
  LAYOUT — ALERTAS INTELIGENTES
  =========================================================

  Esta página depende de:
  - sessão autenticada
  - dados do navegador
  - localStorage
  - informações calculadas em tempo real

  Portanto, não queremos que o Next.js
  tente gerar uma versão estática dela
  durante o build.
*/

export const dynamic =
  "force-dynamic";

export const metadata = {
  title:
    "Alertas Inteligentes | ConquistIA",

  description:
    "Acompanhe vencimentos, compromissos e mudanças no ritmo dos seus gastos.",
};

export default function AlertasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}