"use client";

import { type ProjectWithStats, getProjectsAction } from "@/actions/project-actions";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "syntraflow_custom_events";

export function NewEventPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");

  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Project Deadline");
  const [selectedProjectId, setSelectedProjectId] = useState("general");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("09:00");
  const [locationLink, setLocationLink] = useState("");
  const [errors, setErrors] = useState<{ title?: string; eventDate?: string }>({});

  const isDirtyRef = useRef(false);
  const formRef = useRef({
    title,
    description,
    category,
    selectedProjectId,
    priority,
    eventDate,
    eventTime,
    locationLink,
  });

  useEffect(() => {
    formRef.current = {
      title,
      description,
      category,
      selectedProjectId,
      priority,
      eventDate,
      eventTime,
      locationLink,
    };
    if (title || description || eventDate) isDirtyRef.current = true;
  }, [
    title,
    description,
    category,
    selectedProjectId,
    priority,
    eventDate,
    eventTime,
    locationLink,
  ]);

  useEffect(() => {
    getProjectsAction()
      .then((res) => {
        if (Array.isArray(res)) setProjects(res);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!draftId) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const events = JSON.parse(stored);
      const draft = events.find(
        (e: { id: string; isDraft: boolean }) => e.id === draftId && e.isDraft,
      );
      if (draft) {
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setCategory(draft.type || "Project Deadline");
        setEventDate(draft.rawDate || "");
        setEventTime(draft.time || "09:00");
        setPriority(draft.priority || "High");
        setLocationLink(draft.locationLink || "");
      }
    } catch {}
  }, [draftId]);

  const saveDraft = useCallback(() => {
    const f = formRef.current;
    if (!isDirtyRef.current || !f.title.trim()) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const events = stored ? JSON.parse(stored) : [];
      const filtered = draftId ? events.filter((e: { id: string }) => e.id !== draftId) : events;
      const parsedDate = new Date(f.eventDate);
      const dateFormatted = !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : f.eventDate || "TBD";
      const draft = {
        id: draftId || `draft-${Date.now()}`,
        title: f.title.trim() || "Untitled Draft",
        description: f.description.trim(),
        type: f.category,
        date: dateFormatted,
        rawDate: f.eventDate,
        time: f.eventTime,
        priority: f.priority,
        locationLink: f.locationLink.trim(),
        projectName: f.selectedProjectId === "general" ? "General Workspace" : "Project",
        isDraft: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([draft, ...filtered]));
    } catch {}
  }, [draftId]);

  useEffect(() => {
    const handleUnload = () => saveDraft();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [saveDraft]);

  const validate = () => {
    const e: { title?: string; eventDate?: string } = {};
    if (!title.trim()) e.title = "Event title is required.";
    if (!eventDate) e.eventDate = "Event date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    isDirtyRef.current = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const filtered = draftId
        ? existing.filter((ev: { id: string }) => ev.id !== draftId)
        : existing;
      const parsedDate = new Date(eventDate);
      const dateFormatted = !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : eventDate;
      const newEvent = {
        id: `custom-evt-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type: category,
        date: dateFormatted,
        rawDate: eventDate,
        time: eventTime,
        priority,
        projectName:
          selectedProjectId === "general"
            ? "General Workspace"
            : projects.find((p) => p.id === selectedProjectId)?.name || "Project",
        locationLink: locationLink.trim(),
        isDraft: false,
        archived: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newEvent, ...filtered]));
    } catch {}
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push("/calendar"), 700);
    }, 350);
  };

  const handleCancel = () => {
    saveDraft();
    router.push("/calendar");
  };

  const fieldClass = (hasError?: string) =>
    `w-full px-4 py-3 border rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-medium focus:outline-none transition-all ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-slate-200 dark:border-slate-600 focus:border-[#0052cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
    }`;

  return (
    <div className="overflow-y-auto h-full">
      <div className="w-full bg-white dark:bg-slate-950 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#142843] dark:hover:text-white transition-colors"
          >
            <span>&lt;</span>
            <span>Back to Calendar</span>
          </button>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-sm font-semibold shrink-0">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Event published! Redirecting…
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} noValidate>
            <div className="w-full px-8 py-8">
              <h1 className="text-2xl font-black text-[#142843] dark:text-white mb-8">
                Create Event
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Main Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                      }}
                      placeholder="e.g. Website Redesign Final Submission"
                      className={fieldClass(errors.title)}
                      suppressHydrationWarning
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                      Description &amp; Notes
                    </label>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add agenda, deliverable requirements, meeting objectives, or any relevant notes..."
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-[#1c304a] text-[#142843] dark:text-white text-sm font-medium focus:outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all resize-y"
                      suppressHydrationWarning
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => {
                          setEventDate(e.target.value);
                          if (errors.eventDate) setErrors((p) => ({ ...p, eventDate: undefined }));
                        }}
                        className={fieldClass(errors.eventDate)}
                        suppressHydrationWarning
                      />
                      {errors.eventDate && (
                        <p className="mt-1.5 text-xs font-semibold text-red-500">
                          {errors.eventDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                        Event Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className={fieldClass()}
                        suppressHydrationWarning
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                        Location / Link
                      </label>
                      <input
                        type="text"
                        value={locationLink}
                        onChange={(e) => setLocationLink(e.target.value)}
                        placeholder="Google Meet, Room 402..."
                        className={fieldClass()}
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Meta */}
                <div className="space-y-5">
                  {[
                    {
                      label: "Category",
                      value: category,
                      onChange: (v: string) => setCategory(v),
                      options: ["Project Deadline", "Meeting", "Milestone", "Presentation", "Task"],
                    },
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label}>
                      <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                        {label}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={fieldClass()}
                        suppressHydrationWarning
                      >
                        {options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                      Associated Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className={fieldClass()}
                      suppressHydrationWarning
                    >
                      <option value="general">General Workspace</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#142843] dark:text-slate-200 uppercase tracking-widest mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                      className={fieldClass()}
                      suppressHydrationWarning
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                      Your progress is auto-saved as a draft if you navigate away before publishing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#142843] dark:text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
                  suppressHydrationWarning
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                  suppressHydrationWarning
                >
                  {isSubmitting ? "Saving…" : "Save & Publish Event"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
