// Cdw-Spm
import UserDashboard from "@/components/user/UserDashboard";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";

export default function UserDashboardPage() {
  const raw = cookies().get(COOKIE_NAME)?.value;

  let plan: "free" | "pass" = "free";
  let userName = "Vous";

  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s?.role === "PASS_USER") plan = "pass";
      if (typeof s?.name === "string" && s.name.trim()) userName = s.name.trim();
    } catch {}
  }

  return <UserDashboard plan={plan} userName={userName} />;
}
