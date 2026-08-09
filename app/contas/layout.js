import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./contas.css";

export const metadata = {
  title: "Contas a pagar | ConquistIA",

  description:
    "Organize seus compromissos do mês e acompanhe pagamentos e vencimentos.",
};

export default function ContasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}