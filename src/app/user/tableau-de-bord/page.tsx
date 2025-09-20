// src/app/user/tableau-de-bord/page.tsx
import UserDashboard from "@/components/user/UserDashboard";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";

export default function UserDashboardPage() {
  const sessionCookie = cookies().get(COOKIE_NAME)?.value;

  let plan: "free" | "pass" = "free";
  let userName = "Vous";

  if (sessionCookie) {
    try {
      const s = JSON.parse(sessionCookie);
      if (s?.role === "PASS_USER") plan = "pass";
      if (typeof s?.name === "string" && s.name.trim()) userName = s.name.trim();
    } catch {
      // on garde les valeurs par défaut
    }
  }

  return <UserDashboard plan={plan} userName={userName} />;
}