import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";
import Sidebar from "@/components/pro/Sidebar";
import Topbar from "@/components/pro/Topbar";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get(COOKIE_NAME)?.value;
  let role: string | undefined = "PRACTITIONER";
  let name: string | undefined = "Utilisateur";
  try {
    if (raw) {
      const s = JSON.parse(raw);
      role = s?.role ?? role;
      name = s?.name ?? name;
    }
  } catch {}

  return (
    <div className="min-h-screen flex">
      <Sidebar role={role} name={name} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar name={name} />
        <div className="section">{children}</div>
      </div>
    </div>
  );
}
