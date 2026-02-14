import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* =============================
   BASE STYLES ENTERPRISE
============================= */

const baseStyle =
  "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm";

/* =============================
   TOAST SYSTEM
============================= */

export const notify = {
  success: (msg) =>
    toast.custom((t) => (
      <div
        className={`${baseStyle} bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30`}
      >
        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          {msg}
        </span>
      </div>
    )),

  error: (msg) =>
    toast.custom((t) => (
      <div
        className={`${baseStyle} bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30`}
      >
        <XCircle className="text-red-500 shrink-0" size={20} />
        <span className="text-sm font-medium text-red-800 dark:text-red-200">
          {msg}
        </span>
      </div>
    )),

  info: (msg) =>
    toast.custom((t) => (
      <div
        className={`${baseStyle} bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30`}
      >
        <Info className="text-blue-500 shrink-0" size={20} />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {msg}
        </span>
      </div>
    )),

  warning: (msg) =>
    toast.custom((t) => (
      <div
        className={`${baseStyle} bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30`}
      >
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {msg}
        </span>
      </div>
    )),

  loading: (msg) =>
    toast.custom((t) => (
      <div
        className={`${baseStyle} bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
      >
        <Loader2 className="animate-spin text-gray-500 shrink-0" size={20} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {msg}
        </span>
      </div>
    )),

  promise: (promise, messages) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
};
