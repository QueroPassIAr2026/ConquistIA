import AppShell from "../../components/AppShell";
import "../painel/painel.css";
import "./meu-diario.css";

export const metadata = {
  title: "Meu diário | ConquistIA",
  description:
    "Consulte, filtre e organize seus registros financeiros diários.",
};

export default function MeuDiarioLayout({
  children,
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}