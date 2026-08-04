"use client";

import React, { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { SUGGESTED_TECH } from "@/lib/project-edit-types";

interface TechStackEditorProps {
  techStack: string[];
  setTechStack: (stack: string[]) => void;
}

export function TechStackEditor({ techStack, setTechStack }: TechStackEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SUGGESTED_TECH.filter(
    (tech) =>
      tech.toLowerCase().includes(inputValue.toLowerCase()) &&
      !techStack.includes(tech)
  );

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed || techStack.includes(trimmed)) return;
    setTechStack([...techStack, trimmed]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
        Tech Stack
      </label>

      {/* Current stack tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            <Tag size={9} className="text-slate-400" />
            {tech}
            <button
              onClick={() => removeTech(tech)}
              className="ml-0.5 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={9} />
            </button>
          </span>
        ))}
        {techStack.length === 0 && (
          <span className="text-[11px] text-slate-400 italic">No tech added yet</span>
        )}
      </div>

      {/* Input with autocomplete */}
      <div className="relative">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTech(inputValue);
              }
            }}
            placeholder="e.g. Next.js, Docker..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            onClick={() => addTech(inputValue)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-36 overflow-y-auto bg-white dark:bg-[#14263e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
            {filteredSuggestions.slice(0, 8).map((tech) => (
              <button
                key={tech}
                onMouseDown={() => addTech(tech)}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 transition-colors"
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {/* Popular suggestions row */}
        {!inputValue && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {SUGGESTED_TECH.slice(0, 6)
              .filter((t) => !techStack.includes(t))
              .map((tech) => (
                <button
                  key={tech}
                  onClick={() => addTech(tech)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  + {tech}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
