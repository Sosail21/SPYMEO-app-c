// Cdw-Spm
import Link from "next/link";

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_VERSION || "v0.1.0";

  return (
    <footer id="spymeo-fixed-footer" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Ligne 1 : logo + services */}
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <SpymeoLogo className="h-6 w-6" />
            <span className="font-semibold tracking-tight text-slate-900">SPYMEO</span>
            <span className="hidden sm:inline text-sm text-slate-500">· mieux entreprendre, mieux vivre</span>
          </Link>

          <nav aria-label="Services">
            <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
              <li><Link className="pill pill-ghost" href="/pass">🔖 PASS</Link></li>
              <li><Link className="pill pill-ghost" href="/services/spymeo-web">🌐 SPYMEO Web</Link></li>
              <li><Link className="pill pill-ghost" href="/services/spymeo-start">🚀 SPYMEO Start</Link></li>
              <li><Link className="pill pill-solid" href="/devenir-membre-pro">✨ Devenir membre pro</Link></li>
            </ul>
          </nav>
        </div>

        {/* Ligne 2 : juridique + réseaux + version */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2 text-sm text-slate-600">
          <nav aria-label="Juridique">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <li><Link href="/legal/mentions-legales" className="hover:underline">Mentions légales</Link></li>
              <li><Link href="/legal/cgu" className="hover:underline">Conditions d’utilisation</Link></li>
              <li><Link href="/legal/confidentialite" className="hover:underline">Confidentialité</Link></li>
              <li><Link href="/pro/impact" className="hover:underline">Rejoindre l’équipe</Link></li>
            </ul>
          </nav>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4">
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/company/spymeo" target="_blank" rel="noreferrer" title="LinkedIn">🔗 LinkedIn</a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" title="Instagram">📸 Instagram</a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" title="X">🐦 X</a>
            </div>
            <span className="tabular-nums text-xs text-slate-500">{version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SpymeoLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#17a2b8" />
          <stop offset="100%" stopColor="#5ce0ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#g)" />
      <path
        d="M10 19c1.8 1.6 3.5 2.4 5 2.4 2.7 0 4.6-1.7 4.6-4 0-2.1-1.6-3.5-3.9-3.5-1 0-1.8.2-2.5.6l.5-3.3h6.4v-2H12l-1.3 8.3c1-.7 2.1-1.1 3.5-1.1 1.4 0 2.4.8 2.4 2 0 1.3-1.1 2.3-2.8 2.3-1.3 0-2.6-.6-3.8-1.7L10 19z"
        fill="white"
      />
    </svg>
  );
}