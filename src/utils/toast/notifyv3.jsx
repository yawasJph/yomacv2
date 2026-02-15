import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ================================
   BASE ENTERPRISE STYLE
================================ */

const baseToast =
  "flex items-center gap-3 px-5 py-3 rounded-[1.2rem] " +
  "text-xs font-black uppercase tracking-wider " +
  "shadow-xl shadow-black/40 border-2 " +
  "bg-neutral-900 text-white " +
  "dark:bg-neutral-900";

/* ================================
   TYPE STYLES
================================ */

const variants = {
  success: "border-emerald-500",
  error: "border-red-500",
  info: "border-blue-500",
  warning: "border-amber-500",
  loading: "border-gray-400",
};

/* ================================
   TOAST FACTORY
================================ */

const createToast = (type, message, Icon, spin = false, description = null) =>
  toast.custom(() => (
    <div className={`${baseToast} ${variants[type]}`}>
      <Icon size={18} className={spin ? "animate-spin" : ""} />
      <div className="flex flex-col">
        <span>{message}</span>
        {description && <span className="text-[10px] opacity-75">{description.toLowerCase()}</span>}
      </div>
    </div>
  ));

/* ================================
   EXPORT SYSTEM
================================ */

export const notify = {
  success: (msg) => createToast("success", msg, CheckCircle2),
  error: (msg,description) => createToast("error", msg, XCircle, false, description),
  info: (msg) => createToast("info", msg, Info),
  warning: (msg) => createToast("warning", msg, AlertTriangle),
  loading: (msg) => createToast("loading", msg, Loader2, true),
};
