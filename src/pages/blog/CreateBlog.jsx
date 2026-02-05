import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { generateSlug } from "../../utils/blog/slugify";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import MenuBar from "./MenuBar";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

// Iconos simples (puedes usar Lucide-react si lo tienes)

const lowlight = createLowlight(common);

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "Escribe el contenido de tu blog aquí...",
      }),
      CodeBlockLowlight.configure({ lowlight }),
      BubbleMenuExtension,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg focus:outline-none max-w-none min-h-[400px] py-10 px-2",
      },
    },
  });

  const handleBanner = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const res = await uploadToCloudinary(file);
      setBanner(res.secure_url);
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !editor.getHTML() || !banner)
      return alert("Faltan campos importantes");

    const blogData = {
      title,
      slug: generateSlug(title),
      content: editor.getHTML(),
      banner_url: banner,
      excerpt: editor.getText().substring(0, 150), // Resumen automático
    };

    console.log("Listo para Supabase:", blogData);
    // Aquí tu supabase.from('blogs').insert(...)
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-black">
        
      {/* Botón Flotante de Publicar */}
      <div className="max-w-4xl mx-auto flex justify-end p-4">
        <button
          onClick={handlePublish}
          className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg"
        >
          Publicar
        </button>
      </div>

      

      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {/* Input de Banner */}
        <div className="relative h-64 bg-gray-100 group">
          {banner ? (
            <img
              src={banner}
              className="w-full h-full object-cover"
              alt="Banner"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-4xl">🖼️</span>
              <p>Añade una portada impactante</p>
            </div>
          )}
          <input
            type="file"
            onChange={handleBanner}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="px-12 py-10">
          {/* Título */}
          <textarea
            placeholder="Título del Blog"
            className="w-full text-5xl font-black border-none focus:ring-0 resize-none placeholder-gray-200 leading-tight"
            rows="1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <hr className="my-8 border-gray-100" />

          {/* AQUÍ VAN LOS BOTONES */}
          <MenuBar editor={editor} />
          
          
          {/* Menú Flotante de Tiptap */}
          {/* MENÚ BURBUJA (Aparece al seleccionar texto) */}
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <div className="flex bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden divide-x divide-gray-700 dark:bg-black">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="px-4 py-2 hover:bg-gray-700"
                >
                  B
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className="px-4 py-2 hover:bg-gray-700"
                >
                  Code
                </button>
              </div>
            </BubbleMenu>
          )}
            <SimpleEditor />
          {/* Área del Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
