// Cdw-Spm
import SettingsForm from "@/components/agenda/SettingsForm";

export const metadata = {
  title: "Paramètres agenda — SPYMEO",
};

export default function SettingsPage() {
  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <h1 className="text-2xl font-semibold">Paramètres de l’agenda</h1>
        <SettingsForm />
      </div>
    </main>
  );
}
