// Cdw-Spm: Notification Helpers
import { prisma } from "@/lib/prisma";

type NotificationType =
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_confirmed"
  | "appointment_reminder";

interface CreateNotificationParams {
  userId: string;
  appointmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        appointmentId: params.appointmentId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        read: false,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("[createNotification] Error:", error);
    return { success: false, error };
  }
}

/**
 * Notify when an appointment is cancelled
 */
export async function notifyAppointmentCancelled(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  cancelledBy: "client" | "practitioner"
) {
  const isCancelledByClient = cancelledBy === "client";

  return createNotification({
    userId,
    appointmentId,
    type: "appointment_cancelled",
    title: "Rendez-vous annulé",
    message: `Le rendez-vous "${appointmentTitle}" a été annulé ${
      isCancelledByClient ? "par le client" : "par vous"
    }.`,
  });
}

/**
 * Notify when an appointment is rescheduled
 */
export async function notifyAppointmentRescheduled(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  newDate: Date
) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(newDate);

  return createNotification({
    userId,
    appointmentId,
    type: "appointment_rescheduled",
    title: "Rendez-vous reporté",
    message: `Le rendez-vous "${appointmentTitle}" a été reporté au ${formattedDate}.`,
  });
}

/**
 * Notify when an appointment is confirmed
 */
export async function notifyAppointmentConfirmed(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  appointmentDate: Date
) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(appointmentDate);

  return createNotification({
    userId,
    appointmentId,
    type: "appointment_confirmed",
    title: "Rendez-vous confirmé",
    message: `Le rendez-vous "${appointmentTitle}" est confirmé pour le ${formattedDate}.`,
  });
}

/**
 * Notify as a reminder before an appointment
 */
export async function notifyAppointmentReminder(
  userId: string,
  appointmentId: string,
  appointmentTitle: string,
  appointmentDate: Date,
  hoursBeforeText: string = "24 heures"
) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(appointmentDate);

  return createNotification({
    userId,
    appointmentId,
    type: "appointment_reminder",
    title: `Rappel : Rendez-vous dans ${hoursBeforeText}`,
    message: `N'oubliez pas votre rendez-vous "${appointmentTitle}" prévu le ${formattedDate}.`,
  });
}

/**
 * Create notifications for both practitioner and client (if client has a user account)
 */
export async function notifyBothParties(
  practitionerId: string,
  clientUserId: string | null,
  appointmentId: string,
  type: NotificationType,
  practitionerTitle: string,
  practitionerMessage: string,
  clientTitle?: string,
  clientMessage?: string
) {
  const notifications = [];

  // Notify practitioner
  notifications.push(
    createNotification({
      userId: practitionerId,
      appointmentId,
      type,
      title: practitionerTitle,
      message: practitionerMessage,
    })
  );

  // Notify client if they have a user account
  if (clientUserId) {
    notifications.push(
      createNotification({
        userId: clientUserId,
        appointmentId,
        type,
        title: clientTitle || practitionerTitle,
        message: clientMessage || practitionerMessage,
      })
    );
  }

  return Promise.all(notifications);
}
