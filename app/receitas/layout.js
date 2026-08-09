import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./receitas.css";

export const metadata = {
  title: "Receitas | ConquistIA",

  description:
    "Registre manualmente os valores recebidos e acompanhe as entradas do mês.",
};

export default function ReceitasLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}