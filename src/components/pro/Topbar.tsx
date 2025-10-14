// Cdw-Spm
import Link from "next/link";
import UserAvatarMenu from "@/components/header/UserAvatarMenu";

export default function Topbar({ name }: { name?: string }) {
  return (
    <div className="h-[56px] bg-white border-b border-border">
      <div className="container-spy h-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm link-muted hover:underline">← Retour au site</Link>
        </div>
        <UserAvatarMenu name={name} />
      </div>
    </div>
  );
}
