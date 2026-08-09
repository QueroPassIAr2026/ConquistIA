import AppShell from "../../components/AppShell";

import "./painel.css";
import "./fim-mes.css";
import "./app-shell.css";

export const metadata = {
  title:
    "Visão Geral | ConquistIA",

  description:
    "Organização financeira simples, consciente e inteligente.",
};

export default function PainelLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}