import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import React from 'react';

// Configuración de resaltado de colores para bloques de código
const lowlight = createLowlight(common);

const TiptapEditor = ({ content, setContent }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Desactivamos el básico para usar el de lowlight
      }),
      Placeholder.configure({
        placeholder: 'Empieza a escribir tu historia...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Guardamos como HTML para que sea fácil de renderizar después
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Estilizado de la "hoja" de papel con Tailwind
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[500px] p-10 bg-white shadow-sm rounded-b-xl border-x border-b border-gray-200',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Menú Flotante (Aparece al seleccionar texto) */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden divide-x divide-gray-700">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-2 hover:bg-gray-700 ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
        >
          B
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-2 hover:bg-gray-700 ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
        >
          I
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-3 py-2 hover:bg-gray-700"
        >
          H2
        </button>
      </BubbleMenu>

      {/* Barra de Herramientas Fija (Opcional, al estilo Google Docs) */}
      <div className="bg-gray-50 p-2 border border-gray-200 rounded-t-xl flex gap-2 border-b-0">
         <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 hover:bg-gray-200 rounded">Lista</button>
         <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="p-2 hover:bg-gray-200 rounded">Código</button>
      </div>

      {/* El área de escritura */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;