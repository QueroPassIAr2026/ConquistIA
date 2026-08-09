import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./categorias.css";

export const metadata = {
  title: "Categorias | ConquistIA",

  description:
    "Entenda como seus gastos estão distribuídos por categoria.",
};

export default function CategoriasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}