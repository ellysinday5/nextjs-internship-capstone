import Link from "next/link"
import { Lock, ArrowLeft } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#142843] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c304a] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/10">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#142843] dark:text-white mb-2">403 - Access Forbidden</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You do not have permission to access this resource or project workspace.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#142843] hover:bg-[#1c3457] text-white font-bold rounded-xl text-sm transition-colors w-full shadow-md"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
