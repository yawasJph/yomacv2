import { ChevronLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const MyBlogHeader = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/blog");
    }
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <div className="flex gap-3 items-center">
          {/* Back solo en mobile */}
          <button
            onClick={handleNavigate}
            aria-label="Volver"
            className="p-1 -ml-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 md:hidden"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-3xl font-bold dark:text-white">Mis Artículos</h1>
        </div>

        <p className="text-zinc-500 text-sm">
          Gestiona tus borradores y publicaciones
        </p>
      </div>

      <Link
        to={"/blog/create"}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Nuevo Blog</span>
      </Link>
    </header>
  );
};
