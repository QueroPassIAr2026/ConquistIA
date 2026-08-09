import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./alertas.css";

export const metadata = {
  title: "Alertas Inteligentes | ConquistIA",

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