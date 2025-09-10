import Link from "next/link";
import RoleMenu from "@/components/pro/RoleMenu";
import UserAvatarMenu from "@/components/header/UserAvatarMenu";

export default function ProHeader({ role, name }: { role: string; name?: string }) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="brand">
        <span className="brand-dot" />
        <span className="brand-word">SPYMEO</span>
      </Link>
      <div className="flex-1">
        <RoleMenu role={role} />
      </div>
      <UserAvatarMenu name={name} />
    </div>
  );
}
