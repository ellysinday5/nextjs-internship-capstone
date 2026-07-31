"use client";

/*
  Unified Alert & Toast Notification System (TypeScript)
  Usage:
    import { sileo, toast, swal } from "@/utils/alerts";

    // Sileo Toast Notifications:
    sileo.success("You have successfully logged in.", "Login Success");
    sileo.error("An error occurred during login", "Login Failed");

    // Modal Alerts:
    swal.confirm("Sign Out", "Are you sure you want to sign out?");
*/

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastVariant;
  title: string;
  message: string;
  duration?: number;
}

export interface SwalModalOptions {
  id?: string;
  type: ToastVariant | "question" | "loading";
  title: string;
  text?: string;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

type ToastListener = (toast: ToastItem) => void;
type SwalListener = (swal: SwalModalOptions | null) => void;

const toastListeners: Set<ToastListener> = new Set();
const swalListeners: Set<SwalListener> = new Set();

export const subscribeToToasts = (listener: ToastListener) => {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
};

export const subscribeToSwal = (listener: SwalListener) => {
  swalListeners.add(listener);
  return () => {
    swalListeners.delete(listener);
  };
};

const emitToast = (options: Omit<ToastItem, "id">) => {
  const item: ToastItem = {
    ...options,
    id: Math.random().toString(36).substring(2, 9),
  };
  toastListeners.forEach((listener) => listener(item));
};

const emitSwal = (options: SwalModalOptions | null) => {
  swalListeners.forEach((listener) => listener(options));
};

// ======================= SILEO TOASTS ========================== //
export const sileo = {
  success: (message: string, title: string = "Success") => {
    emitToast({ type: "success", title, message, duration: 4000 });
  },

  error: (message: string, title: string = "Error") => {
    emitToast({ type: "error", title, message, duration: 5000 });
  },

  warning: (message: string, title: string = "Warning") => {
    emitToast({ type: "warning", title, message, duration: 4000 });
  },

  info: (message: string, title: string = "Info") => {
    emitToast({ type: "info", title, message, duration: 3500 });
  },
};

// ======================= MANTINE / STANDARD TOAST ========================== //
export const toast = {
  success: (message: string, title: string = "Success") => {
    sileo.success(message, title);
  },

  error: (message: string, title: string = "Error") => {
    sileo.error(message, title);
  },

  warning: (message: string, title: string = "Warning") => {
    sileo.warning(message, title);
  },

  info: (message: string, title: string = "Info") => {
    sileo.info(message, title);
  },
};

// ======================= SWEETALERT2 MODALS ========================== //
export const swal = {
  success: (title: string, text: string = "") => {
    emitSwal({ type: "success", title, text });
  },

  error: (title: string, text: string = "") => {
    emitSwal({ type: "error", title, text });
  },

  warning: (title: string, text: string = "") => {
    emitSwal({ type: "warning", title, text });
  },

  info: (title: string, text: string = "") => {
    emitSwal({ type: "info", title, text });
  },

  confirm: (title: string, text: string = ""): Promise<boolean> => {
    return new Promise((resolve) => {
      emitSwal({
        type: "question",
        title,
        text,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        onConfirm: () => {
          emitSwal(null);
          resolve(true);
        },
        onCancel: () => {
          emitSwal(null);
          resolve(false);
        },
      });
    });
  },

  loading: (title: string = "Loading...") => {
    emitSwal({ type: "loading", title });
  },

  close: () => emitSwal(null),
};

// Regie / Legacy helpers
export const showSuccessAlert = (title: string, text: string = "") => swal.success(title, text);
export const showErrorAlert = (title: string, text: string = "") => swal.error(title, text);
export const showConfirmationAlert = (title: string, text: string = "") =>
  swal.confirm(title, text);
