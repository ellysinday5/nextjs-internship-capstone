"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export function CreateProjectButton() {
  return (
    <Link
      href="/projects/create"
      className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
    >
      <Plus size={20} className="mr-2" />
      New Project
    </Link>
  );
}
