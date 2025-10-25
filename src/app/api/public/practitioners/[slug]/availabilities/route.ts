// Cdw-Spm: Public Practitioner Availabilities API
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const DAY_MAP: Record<number, DayKey> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

// GET - Créneaux disponibles d'un praticien
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);

    // Paramètres de date
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam) {
      return NextResponse.json(
        { success: false, error: "startDate requis" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = endDateParam ? new Date(endDateParam) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours par défaut

    // Récupérer le praticien et ses paramètres d'agenda
    const practitioner = await prisma.practitionerProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            agendaSettings: true,
          },
        },
      },
    });

    if (!practitioner || !practitioner.verified) {
      return NextResponse.json(
        { success: false, error: "Praticien non trouvé" },
        { status: 404 }
      );
    }

    // Auto-create AgendaSettings if not exist (with default values)
    let agendaSettings = practitioner.user.agendaSettings;
    if (!agendaSettings) {
      agendaSettings = await prisma.agendaSettings.create({
        data: {
          userId: practitioner.userId,
          bufferMin: 0,
          defaultView: "timeGridWeek",
          allowedLocations: ["cabinet", "visio"],
          acceptNewClients: true,
          availabilities: {
            monday: { enabled: true, start: "09:00", end: "18:00" },
            tuesday: { enabled: true, start: "09:00", end: "18:00" },
            wednesday: { enabled: true, start: "09:00", end: "18:00" },
            thursday: { enabled: true, start: "09:00", end: "18:00" },
            friday: { enabled: true, start: "09:00", end: "18:00" },
            saturday: { enabled: false, start: "09:00", end: "12:00" },
            sunday: { enabled: false, start: "09:00", end: "12:00" },
          },
          appointmentTypes: [
            {
              id: "consult-1",
              group: "Consultations individuelles",
              label: "Consultation initiale",
              durationMin: 60,
              price: 60,
              mode: "individuel",
              location: "cabinet",
            },
            {
              id: "consult-2",
              group: "Consultations individuelles",
              label: "Consultation de suivi",
              durationMin: 45,
              price: 50,
              mode: "individuel",
              location: "cabinet",
            },
          ],
        },
      });
    }

    // Récupérer les rendez-vous existants
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: practitioner.userId,
        startAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        startAt: true,
        endAt: true,
        duration: true,
      },
    });

    // Récupérer les blocages manuels du praticien
    const blocks = await prisma.agendaBlock.findMany({
      where: {
        userId: practitioner.userId,
        startAt: {
          lte: endDate,
        },
        endAt: {
          gte: startDate,
        },
      },
      select: {
        startAt: true,
        endAt: true,
      },
    });

    // Parser et valider les disponibilités
    const availabilities = agendaSettings.availabilities as any;
    if (!availabilities || typeof availabilities !== 'object') {
      return NextResponse.json({
        success: true,
        availabilities: [],
        message: "Configuration agenda invalide - availabilities manquantes",
      });
    }

    const appointmentTypes = (agendaSettings.appointmentTypes || []) as any[];
    if (!Array.isArray(appointmentTypes) || appointmentTypes.length === 0) {
      return NextResponse.json({
        success: true,
        availabilities: [],
        message: "Aucun type de consultation configuré",
      });
    }

    const bufferMin = (agendaSettings.bufferMin || 0) as number;

    // Générer les créneaux disponibles
    const slots: any[] = [];
    const currentDate = new Date(startDate);
    const now = new Date(); // Calculate current time once, outside loops

    console.log('[AVAILABILITY DEBUG] Starting slot generation:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      now: now.toISOString(),
      appointmentTypesCount: appointmentTypes.length,
      availabilitiesKeys: Object.keys(availabilities),
    });

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayKey = DAY_MAP[dayOfWeek];
      const dayAvailability = availabilities[dayKey];

      console.log(`[AVAILABILITY DEBUG] Checking ${dayKey}:`, {
        enabled: dayAvailability?.enabled,
        start: dayAvailability?.start,
        end: dayAvailability?.end,
      });

      if (dayAvailability && dayAvailability.enabled) {
        const startTime = dayAvailability.start || "09:00";
        const endTime = dayAvailability.end || "18:00";

        // Trouver la durée minimale pour l'incrément des slots
        const minDuration = Math.min(...appointmentTypes.map(t => t.durationMin || 60));
        const slotIncrement = minDuration; // Incrément basé sur la consultation la plus courte

        // Générer les créneaux de base
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        let currentSlot = new Date(currentDate);
        currentSlot.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        // Générer tous les créneaux possibles avec incrément minimum
        while (currentSlot < dayEnd) {
          // Pour chaque créneau, vérifier quels types de consultation peuvent s'y insérer
          for (const type of appointmentTypes) {
            const duration = type.durationMin || 60;
            const slotEnd = new Date(currentSlot.getTime() + duration * 60000);

            // Vérifier que le slot + durée ne dépasse pas la fin de journée
            if (slotEnd > dayEnd) continue;

            // Vérifier le chevauchement avec les RDV existants
            const hasOverlap = appointments.some((appt) => {
              const apptStart = new Date(appt.startAt);
              const apptEnd = appt.endAt ? new Date(appt.endAt) : new Date(apptStart.getTime() + (appt.duration || 60) * 60000);

              // Chevauchement si :
              // - Le slot commence pendant un RDV OU
              // - Le slot finit pendant un RDV OU
              // - Le slot englobe complètement un RDV
              return (
                (currentSlot >= apptStart && currentSlot < apptEnd) ||
                (slotEnd > apptStart && slotEnd <= apptEnd) ||
                (currentSlot < apptStart && slotEnd > apptEnd)
              );
            });

            // Vérifier le chevauchement avec les blocages manuels
            const isBlocked = blocks.some((block) => {
              const blockStart = new Date(block.startAt);
              const blockEnd = new Date(block.endAt);

              return (
                (currentSlot >= blockStart && currentSlot < blockEnd) ||
                (slotEnd > blockStart && slotEnd <= blockEnd) ||
                (currentSlot < blockStart && slotEnd > blockEnd)
              );
            });

            // Vérifier qu'il y a assez d'espace avant le prochain RDV
            const hasEnoughSpace = !appointments.some((appt) => {
              const apptStart = new Date(appt.startAt);
              const timeUntilNext = apptStart.getTime() - currentSlot.getTime();
              const requiredTime = (duration + bufferMin) * 60000;

              // Si un RDV commence dans moins de (duration + buffer), pas assez d'espace
              return timeUntilNext > 0 && timeUntilNext < requiredTime;
            });

            const isPast = currentSlot <= now;

            if (!hasOverlap && !isBlocked && hasEnoughSpace && !isPast) {
              slots.push({
                start: currentSlot.toISOString(),
                end: slotEnd.toISOString(),
                consultationType: type.label,
                duration,
                price: type.price,
              });
            } else {
              console.log('[AVAILABILITY DEBUG] Slot filtered:', {
                time: currentSlot.toISOString(),
                type: type.label,
                duration,
                hasOverlap,
                isBlocked,
                hasEnoughSpace,
                isPast,
              });
            }
          }

          // Passer au créneau suivant avec l'incrément minimum
          currentSlot = new Date(currentSlot.getTime() + slotIncrement * 60000);
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    console.log('[AVAILABILITY DEBUG] Slot generation complete:', {
      totalSlots: slots.length,
      firstSlot: slots[0],
      lastSlot: slots[slots.length - 1],
    });

    return NextResponse.json({
      success: true,
      availabilities: slots,
      practitionerId: practitioner.userId,
    });
  } catch (error) {
    console.error("[GET /api/public/practitioners/[slug]/availabilities] Error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
