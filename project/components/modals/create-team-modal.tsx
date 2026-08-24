"use client";

import { Modal } from "@/components/modals/BaseModal";
<<<<<<< HEAD:project/components/modals/create-team-modal.tsx
import { type CreateTeamFormValues, createTeamSchema } from "@/lib/db/team-schemas";
=======
import { type CreateTeamFormValues, createTeamSchema } from "@/lib/team-schemas";
>>>>>>> 4016eb6 (Fixed and Initial ui for the system):project/components/team/create-team-modal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTeamFormValues) => void;
}

export function CreateTeamModal({ isOpen, onClose, onCreate }: CreateTeamModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: CreateTeamFormValues) => {
    onCreate(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Team"
      showCloseButton={false}
      maxWidthClassName="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-team-form"
            disabled={isSubmitting}
            className="rounded-lg bg-[#142843] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1f35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create Team
          </button>
        </>
      }
    >
      <form
        id="create-team-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="e.g. Product Engineering"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
              errors.name
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-[#142843] dark:border-slate-700"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Description <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            {...register("description")}
            placeholder="What is this team responsible for?"
            className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#142843] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </form>
    </Modal>
  );
}
