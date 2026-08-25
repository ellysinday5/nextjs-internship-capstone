"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { sileo } from "@/utils/alerts";
import { Camera, Trash2, Upload } from "lucide-react";
import type React from "react";
import { useRef } from "react";

interface ProfilePictureCardProps {
  avatarPreview: string | undefined;
  fullName: string;
  role: string;
  email: string;
  onAvatarChange: (dataUrl: string | undefined) => void;
}

export function ProfilePictureCard({
  avatarPreview,
  fullName,
  role,
  email,
  onAvatarChange,
}: ProfilePictureCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      sileo.error("Image file size must be under 5MB.", "File Too Large");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onAvatarChange(ev.target?.result as string);
      sileo.success("Photo preview updated.", "Photo Selected");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onAvatarChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
    sileo.info("Profile photo removed.", "Photo Cleared");
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#14263e]">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <UserAvatar
            src={avatarPreview}
            name={fullName}
            size="2xl"
            className="ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            aria-label="Change photo"
          >
            <Camera size={18} />
          </button>
        </div>

        {/* Info and buttons */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              JPG, PNG or GIF · Max 5MB
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0052cc] hover:bg-[#003d99] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Upload size={13} />
              Upload Photo
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
