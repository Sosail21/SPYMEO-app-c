"use client";

import { useEffect, useState } from "react";
import AgendaShell from "@/components/agenda/AgendaShell";
import SettingsBanner from "@/components/agenda/SettingsBanner";

export default function AgendaPageClient() {
  const [settings, setSettings] = useState<{ isConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/agenda/settings").then(r => r.json()).then(setSettings).catch(() => setSettings({ isConfigured:true }));
  }, []);

  return (
    <main className="section">
      <div className="container-spy grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Agenda & RDV</h1>
          <a href="/pro/agenda/settings" className="btn btn-outline">Paramètres</a>
        </div>

        {settings && !settings.isConfigured && (
          <SettingsBanner />
        )}

        <AgendaShell />
      </div>
    </main>
  );
}
