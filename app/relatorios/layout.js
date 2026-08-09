import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./relatorios.css";

export const metadata = {
  title: "Relatórios | ConquistIA",

  description:
    "Acompanhe a evolução dos seus registros e compreenda seus hábitos financeiros.",
};

export default function RelatoriosLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}