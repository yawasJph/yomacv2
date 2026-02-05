const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (active) => 
    `p-2 rounded transition-colors ${active ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-white dark:bg-black sticky top-0 z-10">
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))} title="Título 1"
      >
        H1
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))} title="Título 2"
      >
        H2
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" /> {/* Separador */}
      <button 
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))} title="Negrita"
      >
        <span className="font-bold">B</span>
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))} title="Cursiva"
      >
        <span className="italic">I</span>
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))} title="Lista"
      >
        • Lista
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive('codeBlock'))} title="Bloque de Código"
      >
        {"</>"}
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 hover:bg-gray-100 text-gray-400"
      >
        ↩️
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 hover:bg-gray-100 text-gray-400"
      >
        ↪️
      </button>
    </div>
  );
};

export default MenuBar