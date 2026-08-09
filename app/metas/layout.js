import AppShell from "../../components/AppShell";
import "../painel/painel.css";
import "./metas.css";

export const metadata = {
  title: "Minhas metas | ConquistIA",
  description:
    "Crie objetivos pessoais e acompanhe sua evolução de maneira simples e acolhedora.",
};

export default function MetasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}