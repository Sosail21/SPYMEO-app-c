import { cookies } from "next/headers";
import ProHeader from "@/components/pro/ProHeader";
import { COOKIE_NAME } from "@/lib/auth/session";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const raw = cookies().get(COOKIE_NAME)?.value;
  let role: string = "PRACTITIONER";
  let name: string | undefined = "Utilisateur";
  try {
    if (raw) {
      const s = JSON.parse(raw);
      role = s?.role ?? role;
      name = s?.name ?? name;
    }
  } catch {}
  return (
    <>
      <header className="site-header border-b">
        <div className="container-spy py-3">
          <ProHeader role={role} name={name} />
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
