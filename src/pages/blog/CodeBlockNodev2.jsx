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
