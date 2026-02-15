import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ================================
   BASE STYLE — ALTA LEGIBILIDAD
================================ */
const toastStyle = {
  style: {
    borderRadius: "1.2rem",
    background: "#171717", // Neutral 900
    color: "#fff",
    border: "2px solid #10b981", // Emerald 500
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
};


const base =
  "flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium";

/* ================================
   ENTERPRISE TOAST SYSTEM
================================ */

export const notify = {
  success: (msg) =>
    toast.custom(() => (
      <div
        className={`${base}
        bg-emerald-600 text-white border-emerald-700
        dark:bg-emerald-500 dark:border-emerald-600`}
      >
        <CheckCircle2 size={20} className="shrink-0" />
        {msg}
      </div>
    )),

  error: (msg) =>
    toast.custom(() => (
      <div
        className={`${base}
        bg-neutral-600 text-white border-red-700
        dark:bg-neutral-900 dark:border-red-600`}
      >
        <XCircle size={20} className="shrink-0" />
        {msg}
      </div>
    )),

  info: (msg) =>
    toast.custom(() => (
      <div
        className={`${base}
        bg-blue-600 text-white border-blue-700
        dark:bg-blue-500 dark:border-blue-600`}
      >
        <Info size={20} className="shrink-0" />
        {msg}
      </div>
    )),

  warning: (msg) =>
    toast.custom(() => (
      <div
        className={`${base}
        bg-amber-500 text-white border-amber-600`}
      >
        <AlertTriangle size={20} className="shrink-0" />
        {msg}
      </div>
    )),

  loading: (msg) =>
    toast.custom(() => (
      <div
        className={`${base}
        bg-gray-900 text-white border-gray-800`}
      >
        <Loader2 size={20} className="animate-spin shrink-0" />
        {msg}
      </div>
    )),
};
