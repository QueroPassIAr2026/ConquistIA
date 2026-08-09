import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./conquistas.css";

export const metadata = {
  title: "Conquistas | ConquistIA",

  description:
    "Acompanhe sua evolução e desbloqueie conquistas por hábitos de organização financeira.",
};

export default function ConquistasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}