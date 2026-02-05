import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { generateSlug } from "../../utils/blog/slugify";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";

const BlogEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const res = await uploadToCloudinary(file);
      setBanner(res.secure_url);
      setLoading(false);
    }
  };

  const saveBlog = async () => {
    if (!title || !content || !banner) return alert("Faltan campos");

    // Generamos slug + un sufijo aleatorio para evitar duplicados
    const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;

    // Aquí iría tu lógica de Supabase .insert()
    console.log({ title, slug, content, banner_url: banner });
  };

  return (
    <div className="flex flex-col gap-5 p-5 max-w-7xl mx-auto w-full font-sans">
      {/* Cabecera */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
        <input
          type="text"
          placeholder="Título del Blog (Max 100)"
          className="text-4xl font-bold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="border-2 border-dashed border-gray-400 h-32 flex items-center justify-center rounded-lg overflow-hidden bg-gray-50 relative">
          {banner ? (
            <img
              src={banner}
              className="w-full h-full object-cover"
              alt="Banner"
            />
          ) : (
            <label className="cursor-pointer text-sm text-gray-500 p-2 text-center">
              {loading ? "Subiendo..." : "Subir Banner"}
              <input
                type="file"
                className="hidden"
                onChange={handleBannerUpload}
              />
            </label>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Editor y Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
        {/* Lado Izquierdo: Escritura */}
        <textarea
          placeholder="Escribe en Markdown... usa # para títulos, * para listas, ``` para código"
          className="w-full p-4 font-mono text-lg border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 bg-gray-50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Lado Derecho: Preview */}
        <div className="p-6 bg-white rounded-lg border border-gray-200 overflow-y-auto shadow-inner">
          {/* Usamos 'prose' pero con un 'fallback' por si Tailwind no lo carga */}
          <div
            className="prose prose-lg max-w-none 
            [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-4
            [&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3
            [&>h3]:text-2xl [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2
            [&>p]:mb-4 [&>p]:leading-7
            [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
            [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  // 1. Buscamos el lenguaje (ej: language-javascript)
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";

                  // 2. Si NO es inline (es un bloque con ```) O si tiene un lenguaje especificado
                  if (!inline && (language || className)) {
                    return (
                      <div className="my-6 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                        {/* Pequeña barra superior tipo terminal (Opcional, se ve muy pro) */}
                        <div className="bg-[#282a36] px-4 py-2 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
                          <span>{language.toUpperCase() || "CODE"}</span>
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                          </div>
                        </div>

                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language || "text"} // Si no hay lenguaje, usamos texto plano
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "0.95rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  // 3. Si es código inline (ej: `const x = 1`)
                  return (
                    <code
                      className="bg-gray-100 dark:bg-gray-800 text-pink-500 px-1.5 py-0.5 rounded font-mono text-[0.9em] border border-gray-200 dark:border-gray-700"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <button
        onClick={saveBlog}
        className="w-full md:w-max self-end px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Procesando..." : "Publicar Blog en YoMAC"}
      </button>
    </div>
  );
};

export default BlogEditor;
