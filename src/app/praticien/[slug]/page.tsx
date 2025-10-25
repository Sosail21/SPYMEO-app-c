// Cdw-Spm: Page profil public d'un praticien
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PractitionerPublicProfile from "@/components/public/PractitionerPublicProfile";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PraticienPage({ params }: Props) {
  const { slug } = await params;

  // Récupérer le praticien avec toutes les infos
  const practitioner = await prisma.practitionerProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          agendaSettings: true,
          profile: {
            select: {
              avatar: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  if (!practitioner || !practitioner.verified) {
    notFound();
  }

  return <PractitionerPublicProfile practitioner={practitioner as any} />;
}
