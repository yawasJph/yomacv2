import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Copy, CopyCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default ({
  node: {
    attrs: { language: defaultLanguage },
  },

}) => {
  const [isCopied, setIsCopied] = useState(false);

  // SVGs idénticos a tu useEffect
  const iconCopy = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
  const iconCheck = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const handleCopy = async (e) => {
    // Buscamos el elemento code dentro de este wrapper específico
    const parent = e.currentTarget.closest(".code-wrapper");
    const codeElement = parent.querySelector("code");
    const textToCopy = codeElement?.innerText || "";

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.info("copiado");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <NodeViewWrapper className="code-wrapper relative group my-8 overflow-hidden rounded-xl border border-zinc-800 bg-[#1d1f21] shadow-2xl">
      {/* Etiqueta de Lenguaje (Izquierda) - Usando select para que el usuario pueda cambiarlo */}
      <div className="absolute top-3 left-4 z-30 flex items-center">
        <div className="absolute top-4 left-4 flex gap-1.5 opacity-20 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Botón de Copiar (Derecha) - Misma lógica de clases del useEffect */}
      <button
        type="button"
        contentEditable={false}
        onClick={handleCopy}
        className={`
          absolute top-2.5 right-3 z-30
          p-2 rounded-lg border backdrop-blur-md transition-all duration-200 cursor-pointer
          ${
            isCopied
              ? "opacity-100 text-indigo-400 border-indigo-500/50 bg-indigo-500/10"
              : "opacity-0 group-hover:opacity-100 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700/50"
          }
        `}
      >
        {isCopied ? <CopyCheck size={20}/> : <Copy size={20}/>}
      </button>

      {/* El Bloque de Código predeterminado de Tiptap */}
      <pre className="m-0 pt-14 pb-6 px-6 bg-transparent">
        <NodeViewContent
          as="code"
          className={`language-${defaultLanguage || "javascript"}`}
        />
      </pre>
    </NodeViewWrapper>
  );
};
