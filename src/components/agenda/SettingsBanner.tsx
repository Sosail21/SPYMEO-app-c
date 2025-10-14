// Cdw-Spm
"use client";

export default function SettingsBanner() {
  return (
    <div className="soft-card border border-amber-300 bg-amber-50 p-3 rounded-xl flex items-center justify-between">
      <div className="text-sm">
        Votre agenda n’est pas encore configuré (créneaux, couleurs, notifications…).
      </div>
      <a href="/pro/agenda/settings" className="btn btn-amber">Configurer</a>
    </div>
  );
}
