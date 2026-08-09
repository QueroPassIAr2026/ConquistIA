import AppShell from "../../components/AppShell";

import "../painel/painel.css";
import "./registrar-gasto.css";

export const metadata = {
  title:
    "Registrar gasto | ConquistIA",

  description:
    "Registre seus gastos de forma simples, consciente e organizada.",
};

export default function RegistrarGastoLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}