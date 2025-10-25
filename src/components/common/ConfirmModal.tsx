// Cdw-Spm: Reusable Confirmation Modal Component
"use client";

import { useEffect, useState } from "react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning" | "success" | "error";
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
      case "error":
        return {
          iconBg: "bg-red-100",
          icon: "⚠️",
          confirmBtn: "bg-red-500 text-white hover:bg-red-600",
        };
      case "warning":
        return {
          iconBg: "bg-yellow-100",
          icon: "⚠️",
          confirmBtn: "bg-yellow-500 text-white hover:bg-yellow-600",
        };
      case "success":
        return {
          iconBg: "bg-emerald-100",
          icon: "✓",
          confirmBtn: "bg-emerald-500 text-white hover:bg-emerald-600",
        };
      default:
        return {
          iconBg: "bg-accent/10",
          icon: "ℹ️",
          confirmBtn: "btn",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`${styles.iconBg} w-16 h-16 rounded-full flex items-center justify-center`}>
            <span className="text-3xl">{styles.icon}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>

        {/* Message */}
        <div className="text-muted text-center mb-6">{message}</div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={`${styles.confirmBtn} flex-1`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "danger" | "warning" | "success" | "error";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const showDialog = (
    message: string,
    title: string = "Confirmation",
    variant: "default" | "danger" | "warning" | "success" | "error" = "default",
    onConfirm?: () => void
  ) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title,
        message,
        variant,
        onConfirm: () => {
          onConfirm?.();
          resolve(true);
        },
      });
    });
  };

  const success = (message: string, title: string = "Succès") =>
    showDialog(message, title, "success");

  const error = (message: string, title: string = "Erreur") =>
    showDialog(message, title, "danger");

  const warning = (message: string, title: string = "Attention") =>
    showDialog(message, title, "warning");

  const confirm = (message: string, title: string = "Confirmation", onConfirm?: () => void) =>
    showDialog(message, title, "default", onConfirm);

  const onClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const onConfirmInternal = () => {
    state.onConfirm?.();
    onClose();
  };

  return {
    ...state,
    success,
    error,
    warning,
    confirm,
    onClose,
    onConfirm: onConfirmInternal,
  };
}
