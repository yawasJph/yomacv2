import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
}) => (
  <NodeViewWrapper className="code-block relative group font-sans">
    {/* Contenedor del Selector */}
    <div className="absolute right-3 top-3 z-20">
      <select
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={event => updateAttributes({ language: event.target.value })}
        className={`
          bg-zinc-800/80 backdrop-blur-md
          text-zinc-300 text-[10px] uppercase font-bold
          border border-zinc-700 rounded-md
          px-2 py-1 cursor-pointer
          outline-none focus:ring-1 focus:ring-blue-500
          transition-all
          max-w-[120px]
        `}
      >
        <option value="null">Auto-detect</option>
        {extension.options.lowlight.listLanguages().map((lang, index) => (
          <option key={index} value={lang} className="bg-zinc-900 text-white">
            {lang}
          </option>
        ))}
      </select>
    </div>

    {/* Bloque de Código */}
    <pre className="rounded-xl bg-[#0d0d0d] p-5 pt-14 shadow-2xl border border-zinc-800">
      <NodeViewContent as="code" className="font-mono text-sm leading-relaxed" />
    </pre>

    {/* Etiqueta decorativa opcional en la esquina inferior */}
    <div className="absolute bottom-2 right-4 text-[10px] text-zinc-600 font-mono pointer-events-none uppercase">
      {defaultLanguage || 'code'}
    </div>
  </NodeViewWrapper>
)