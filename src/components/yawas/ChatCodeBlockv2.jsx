import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import hljs from "highlight.js";
import { notify } from "@/utils/toast/notifyv3";

export function ChatCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const detectedLanguage = useMemo(() => {
    if (language) return language;

    try {
      const result = hljs.highlightAuto(code);
      return result.language || "text";
    } catch {
      return "text";
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    notify.success("Copiado al portapapeles");
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl ">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/90 backdrop-blur border-b border-neutral-700">
        <span className="text-xs font-mono uppercase tracking-wider text-yellow-400">
          {detectedLanguage}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-neutral-700 hover:bg-neutral-600 transition"
        >
          {copied ? (
            <>
              <Check size={14} /> Copiado
            </>
          ) : (
            <>
              <Copy size={14} /> Copiar
            </>
          )}
        </button>
      </div>

      {/* CODE */}
      <SyntaxHighlighter
        language={detectedLanguage}
        style={vscDarkPlus}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          fontSize: "0.85rem",
          background: "transparent",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
