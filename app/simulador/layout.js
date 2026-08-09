import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./simulador.css";

export const metadata = {
  title: "Simulador E se? | ConquistIA",

  description:
    "Simule cenários financeiros sem alterar seus registros reais.",
};

export default function SimuladorLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}