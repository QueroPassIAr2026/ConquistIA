import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./reflexoes.css";

export const metadata = {
  title: "Escolhas conscientes | ConquistIA",

  description:
    "Observe padrões de gastos e reflita sobre suas escolhas de forma simples e sem julgamentos.",
};

export default function ReflexoesLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}