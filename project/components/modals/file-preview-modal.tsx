"use client";

import { Download, FileText, Film, ImageIcon, X } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export interface PreviewableFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FilePreviewModalProps {
  file: PreviewableFile | null;
  onClose: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  useEffect(() => {
    if (!file) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [file, onClose]);

  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col max-w-4xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? (
              <ImageIcon size={18} className="text-sky-500 shrink-0" />
            ) : isVideo ? (
              <Film size={18} className="text-purple-500 shrink-0" />
            ) : isPdf ? (
              <FileText size={18} className="text-rose-500 shrink-0" />
            ) : (
              <FileText size={18} className="text-slate-400 shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatBytes(file.size)} • {file.type || "File"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={file.url}
              download={file.name}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download file"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/70 min-h-[300px]">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-md"
            />
          ) : isVideo ? (
            <video
              src={file.url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh] rounded-lg shadow-md"
            />
          ) : isPdf ? (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-[65vh] rounded-lg border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText size={48} className="mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Preview not available for this file type
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You can download the file to view its contents.
              </p>
              <a
                href={file.url}
                download={file.name}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0033a0] text-white text-xs font-bold rounded-xl hover:bg-[#002a80] transition-colors"
              >
                <Download size={14} /> Download {file.name}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
