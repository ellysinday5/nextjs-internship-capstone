"use client";

import { Modal } from "./BaseModal";

type ConfirmationVariant = "logout" | "save" | "delete" | "discard";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant: ConfirmationVariant;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  showCloseButton?: boolean;
}

interface VariantContent {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName: string;
}

const VARIANT_CONTENT: Record<ConfirmationVariant, VariantContent> = {
  logout: {
    title: "Log out",
    description: "You'll need to sign in again to access your boards.",
    confirmLabel: "Log out",
    confirmClassName: "bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-600",
  },
  save: {
    title: "Save changes",
    description: "Your changes will be applied right away.",
    confirmLabel: "Save changes",
    confirmClassName: "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600",
  },
  delete: {
    title: "Delete this item",
    description: "This action can't be undone.",
    confirmLabel: "Delete",
    confirmClassName: "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600",
  },
  discard: {
    title: "Discard changes?",
    description: "You have unsaved form data. Are you sure you want to close?",
    confirmLabel: "Yes",
    confirmClassName: "bg-[#0f1f3d] hover:bg-[#0a1730] focus-visible:outline-[#0f1f3d]",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  variant,
  title,
  description,
  confirmLabel,
  isLoading = false,
  showCloseButton = true,
}: ConfirmationModalProps) {
  const content = VARIANT_CONTENT[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? content.title}
      showCloseButton={showCloseButton}
      maxWidthClassName="max-w-sm"
      footer={
        <>
          {!showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${content.confirmClassName}`}
          >
            {isLoading ? "Please wait..." : (confirmLabel ?? content.confirmLabel)}
          </button>
        </>
      }
    >
      <p>{description ?? content.description}</p>
    </Modal>
  );
}
