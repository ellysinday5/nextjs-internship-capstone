import { LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#142843] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c304a] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#142843] dark:text-white mb-2">
          401 - Unauthorized Access
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You must be logged in to view this page. Please sign in to access your workspace.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0052cc] hover:bg-[#003d99] text-white font-bold rounded-xl text-sm transition-colors w-full shadow-md"
        >
          <LogIn size={18} />
          Sign In Now
        </Link>
      </div>
    </div>
  );
}
