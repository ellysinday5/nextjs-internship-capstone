"use client";

import React, { useState } from "react";
import {
  CheckCircle2, X, ThumbsUp, Link2, Maximize2, Minimize2,
  MoreHorizontal, ChevronRight, User, Calendar, Layers,
  Plus, Send, Lock, ArrowUpDown, CircleAlert,
  ListTodo, GitMerge, ListChecks, Paperclip, SquarePlus,
  Trash2, Flag, CheckSquare,
} from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  assignee?: { name: string; initials: string; avatarColor?: string };
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "On track" | "At risk" | "Off track" | "Completed";
  description?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  sectionId: string;
}

interface TaskDetailsPaneProps {
  task: TaskItem;
  projectName: string;
  onClose: () => void;
  onUpdateTask: (task: TaskItem) => void;
}

const TEAM_ASSIGNEES = [
  { name: "Unassigned", initials: "?", avatarColor: "bg-slate-200 text-slate-600" },
  { name: "Ellen Grace Sinday", initials: "ES", avatarColor: "bg-amber-400 text-amber-950" },
  { name: "Aj Lopez", initials: "AL", avatarColor: "bg-blue-400 text-blue-950" },
  { name: "John Doe", initials: "JD", avatarColor: "bg-emerald-400 text-emerald-950" },
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High"] as const;
const STATUS_OPTIONS = ["On track", "At risk", "Off track", "Completed"] as const;

const STATUS_STYLE: Record<string, string> = {
  "On track": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "At risk": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Off track": "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  "Completed": "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white",
};

const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

interface ChecklistItem { id: string; text: string; done: boolean; }
interface Checklist { id: string; title: string; items: ChecklistItem[]; }
interface Comment { id: string; text: string; author: string; initials: string; time: string; }
interface CustomField { id: string; label: string; value: string; }

export function TaskDetailsPane({ task, projectName, onClose, onUpdateTask }: TaskDetailsPaneProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completed, setCompleted] = useState(task.status === "Completed");
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [newCheckItemText, setNewCheckItemText] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  function handleToggleComplete() {
    const next = !completed;
    setCompleted(next);
    onUpdateTask({ ...task, status: next ? "Completed" : "On track" });
  }

  function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updated = [...subtasks, { id: Date.now().toString(), title: newSubtaskTitle.trim(), completed: false }];
    setSubtasks(updated);
    setNewSubtaskTitle("");
    onUpdateTask({ ...task, subtasks: updated });
  }

  function toggleSubtask(id: string) {
    const updated = subtasks.map((s) => s.id === id ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
  }

  function handleCreateChecklist(e: React.FormEvent) {
    e.preventDefault();
    const t = newChecklistTitle.trim() || "Checklist";
    setChecklists((prev) => [...prev, { id: Date.now().toString(), title: t, items: [] }]);
    setNewChecklistTitle("");
    setShowChecklistInput(false);
  }

  function addCheckItem(clId: string) {
    const text = (newCheckItemText[clId] || "").trim();
    if (!text) return;
    setChecklists((prev) => prev.map((cl) =>
      cl.id === clId ? { ...cl, items: [...cl.items, { id: Date.now().toString(), text, done: false }] } : cl
    ));
    setNewCheckItemText((prev) => ({ ...prev, [clId]: "" }));
  }

  function toggleCheckItem(clId: string, itemId: string) {
    setChecklists((prev) => prev.map((cl) =>
      cl.id === clId ? { ...cl, items: cl.items.map((it) => it.id === itemId ? { ...it, done: !it.done } : it) } : cl
    ));
  }

  function deleteCheckItem(clId: string, itemId: string) {
    setChecklists((prev) => prev.map((cl) =>
      cl.id === clId ? { ...cl, items: cl.items.filter((it) => it.id !== itemId) } : cl
    ));
  }

  function deleteChecklist(clId: string) {
    setChecklists((prev) => prev.filter((cl) => cl.id !== clId));
  }

  function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [...prev, {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: "Ellen Grace Sinday",
      initials: "ES",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }]);
    setCommentText("");
  }

  function addCustomField() {
    setCustomFields((prev) => [...prev, { id: Date.now().toString(), label: "Custom field", value: "" }]);
  }

  /* ── pane wrapper classes ── */
  const paneClass = isExpanded
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    : "contents";

  const innerClass = isExpanded
    ? "relative w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] flex flex-col shadow-2xl overflow-hidden"
    : "w-[560px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1d31] flex flex-col h-full shadow-2xl z-20";

  return (
    <div className={paneClass} onClick={isExpanded ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}>
      <div className={innerClass}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={handleToggleComplete}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              completed
                ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            }`}
          >
            <CheckCircle2 size={15} className={completed ? "fill-emerald-600 text-white" : ""} />
            {completed ? "Completed" : "Mark complete"}
          </button>
          <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500">
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" title="Like">
              <ThumbsUp size={15} />
            </button>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" title="Copy link">
              <Link2 size={15} />
            </button>
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <MoreHorizontal size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md ml-1">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Privacy bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#14263e] border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock size={12} className="text-amber-500 shrink-0" />
            This task is private to members of this project.
          </span>
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold">Make public</button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); onUpdateTask({ ...task, title: e.target.value }); }}
            className="w-full text-2xl font-extrabold bg-transparent border-none outline-none text-slate-900 dark:text-white focus:ring-0 px-0"
            placeholder="Task title"
          />

          {/* Properties grid */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 text-sm overflow-hidden">

            {/* Assignee */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><User size={13} /> Assignee</span>
              <div>
                {isEditingAssignee ? (
                  <select autoFocus value={task.assignee?.name || "Unassigned"}
                    onChange={(e) => {
                      setIsEditingAssignee(false);
                      const found = TEAM_ASSIGNEES.find((a) => a.name === e.target.value);
                      onUpdateTask({ ...task, assignee: found && found.name !== "Unassigned" ? { name: found.name, initials: found.initials, avatarColor: found.avatarColor } : undefined });
                    }}
                    onBlur={() => setIsEditingAssignee(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    {TEAM_ASSIGNEES.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                ) : (
                  <button onClick={() => setIsEditingAssignee(true)} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-[#00b4d8] transition-colors">
                    {task.assignee ? (
                      <><span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">{task.assignee.initials}</span>{task.assignee.name}</>
                    ) : (
                      <span className="text-slate-400">No assignee</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><Calendar size={13} /> Due date</span>
              <div>
                {isEditingDueDate ? (
                  <input type="date" autoFocus defaultValue={task.dueDate || ""}
                    onChange={(e) => { setIsEditingDueDate(false); onUpdateTask({ ...task, dueDate: e.target.value }); }}
                    onBlur={() => setIsEditingDueDate(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  />
                ) : (
                  <button onClick={() => setIsEditingDueDate(true)} className="text-xs font-medium">
                    {task.dueDate ? <span className="text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md font-bold">{task.dueDate}</span> : <span className="text-slate-400">No due date</span>}
                  </button>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><Layers size={13} /> Projects</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{projectName}</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-slate-500">{task.sectionId}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><Flag size={13} /> Priority</span>
              <div>
                {isEditingPriority ? (
                  <select autoFocus value={task.priority || "Medium"}
                    onChange={(e) => { setIsEditingPriority(false); onUpdateTask({ ...task, priority: e.target.value as TaskItem["priority"] }); }}
                    onBlur={() => setIsEditingPriority(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                ) : (
                  <button onClick={() => setIsEditingPriority(true)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${PRIORITY_STYLE[task.priority || "Medium"]}`}
                  >{task.priority || "Medium"}</button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><CircleAlert size={13} /> Status</span>
              <div>
                {isEditingStatus ? (
                  <select autoFocus value={task.status || "On track"}
                    onChange={(e) => {
                      const s = e.target.value as TaskItem["status"];
                      setIsEditingStatus(false);
                      setCompleted(s === "Completed");
                      onUpdateTask({ ...task, status: s });
                    }}
                    onBlur={() => setIsEditingStatus(false)}
                    className="text-xs rounded-lg border border-[#00b4d8] bg-white dark:bg-slate-900 px-2 py-1 outline-none dark:text-slate-100"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <button onClick={() => setIsEditingStatus(true)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${STATUS_STYLE[task.status || "On track"]}`}
                  >{task.status || "On track"}</button>
                )}
              </div>
            </div>

            {/* Custom fields */}
            {customFields.map((cf) => (
              <div key={cf.id} className="grid grid-cols-[140px_1fr] items-center px-3 py-2.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{cf.label}</span>
                <input value={cf.value} onChange={(e) => setCustomFields((prev) => prev.map((f) => f.id === cf.id ? { ...f, value: e.target.value } : f))}
                  className="text-xs bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-300 focus:border-[#00b4d8]"
                  placeholder="Empty"
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</h4>
            <textarea value={description}
              onChange={(e) => { setDescription(e.target.value); onUpdateTask({ ...task, description: e.target.value }); }}
              placeholder="What is this task about?"
              rows={3}
              className="w-full text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#00b4d8] rounded-xl p-3 outline-none resize-none transition-colors"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Subtasks</h4>
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id)}
                    className="rounded accent-[#00b4d8] cursor-pointer" />
                  <span className={st.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}>{st.title}</span>
                </div>
              ))}
            </div>
            {showSubtaskInput ? (
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1 mt-1">
                <Plus size={13} className="text-slate-400 shrink-0" />
                <input autoFocus type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onBlur={() => { if (!newSubtaskTitle.trim()) setShowSubtaskInput(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") { setShowSubtaskInput(false); setNewSubtaskTitle(""); } }}
                  placeholder="Subtask title…"
                  className="flex-1 text-xs bg-transparent outline-none text-slate-700 dark:text-slate-300"
                />
              </form>
            ) : null}
          </div>

          {/* Checklists */}
          {checklists.map((cl) => {
            const done = cl.items.filter((i) => i.done).length;
            const pct = cl.items.length ? Math.round((done / cl.items.length) * 100) : 0;
            return (
              <div key={cl.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <CheckSquare size={13} className="text-[#00b4d8]" />{cl.title}
                  </h4>
                  <button onClick={() => deleteChecklist(cl.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
                {cl.items.length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{pct}%</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-[#00b4d8] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  {cl.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2 group text-xs">
                      <input type="checkbox" checked={it.done} onChange={() => toggleCheckItem(cl.id, it.id)} className="rounded accent-[#00b4d8] cursor-pointer" />
                      <span className={`flex-1 ${it.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{it.text}</span>
                      <button onClick={() => deleteCheckItem(cl.id, it.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"><X size={11} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                  <Plus size={12} className="text-slate-400 shrink-0" />
                  <input value={newCheckItemText[cl.id] || ""} onChange={(e) => setNewCheckItemText((p) => ({ ...p, [cl.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCheckItem(cl.id); } }}
                    placeholder="Add item…"
                    className="flex-1 text-xs bg-transparent outline-none text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>
            );
          })}

          {/* Create checklist input */}
          {showChecklistInput ? (
            <form onSubmit={handleCreateChecklist} className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <CheckSquare size={13} className="text-slate-400 shrink-0" />
              <input autoFocus value={newChecklistTitle} onChange={(e) => setNewChecklistTitle(e.target.value)}
                onBlur={() => { if (!newChecklistTitle.trim()) setShowChecklistInput(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setShowChecklistInput(false); setNewChecklistTitle(""); } }}
                placeholder="Checklist name…"
                className="flex-1 text-xs bg-transparent outline-none text-slate-700 dark:text-slate-300"
              />
              <button type="submit" className="text-xs font-bold text-[#00b4d8] hover:text-[#0096b8]">Create</button>
            </form>
          ) : null}

          {/* Quick action rows */}
          <div className="space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            {[
              { icon: <ListTodo size={14} />, label: "Add subtask", action: () => setShowSubtaskInput(true) },
              { icon: <GitMerge size={14} />, label: "Relate items or add dependencies", action: () => {} },
              { icon: <ListChecks size={14} />, label: "Create checklist", action: () => setShowChecklistInput(true) },
              { icon: <SquarePlus size={14} />, label: "Add fields", action: addCustomField },
              { icon: <Paperclip size={14} />, label: "Attach file", action: () => {} },
            ].map((row) => (
              <button key={row.label} type="button" onClick={row.action}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-left"
              >
                <span className="text-slate-400 dark:text-slate-500">{row.icon}</span>
                {row.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Comments footer ── */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#14263e] shrink-0">
          {comments.length > 0 && (
            <div className="max-h-40 overflow-y-auto px-4 py-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-950">{c.initials}</span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{c.author}</span>
                    <span className="ml-1.5 text-[10px] text-slate-400">{c.time}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSendComment} className="flex items-center gap-2.5 px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">ES</span>
            <div className="flex-1 relative">
              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1d31] px-3 py-2 pr-9 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-[#00b4d8]"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00b4d8] transition-colors">
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
