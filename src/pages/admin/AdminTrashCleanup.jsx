import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  RefreshCcw,
  FileText,
  MessageSquare,
  CornerDownRight,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "../../supabase/supabaseClient"; // Ajusta a tu ruta
import { useNavigate } from "react-router-dom";

const AdminTrashCleanup = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Fetch de elementos en la papelera según la pestaña
  const { data: trashedItems, isLoading } = useQuery({
    queryKey: ["admin_trash", activeTab],
    queryFn: async () => {
      let query;

      if (activeTab === "posts") {
        query = supabaseClient
          .from("posts")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar), post_media!left (media_url, media_type)`,
          )
          .not("deleted_at", "is", null);
      } else if (activeTab === "comments") {
        query = supabaseClient
          .from("comments")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar)`,
          )
          .not("deleted_at", "is", null)
          .is("parent_id", null); // Comentarios principales
      } else {
        query = supabaseClient
          .from("comments")
          .select(
            `id, content, deleted_at, profiles:user_id (username, avatar)`,
          )
          .not("deleted_at", "is", null)
          .not("parent_id", "is", null); // Respuestas (tienen parent_id)
      }

      const { data, error } = await query.order("deleted_at", {
        ascending: false,
      });
      if (error) throw error;
      return data;
    },
  });

  // 2. Mutación para Restaurar un elemento individual
  const restoreMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      const table = type === "posts" ? "posts" : "comments";
      const { error } = await supabaseClient
        .from(table)
        .update({ deleted_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Elemento restaurado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["admin_trash"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // 3. Mutación para Eliminar Permanentemente (Individual o Todo)
  const hardDeleteMutation = useMutation({
    mutationFn: async ({ id, type, isBulk = false }) => {
      const table = type === "posts" ? "posts" : "comments";
      let query = supabaseClient.from(table).delete();

      if (isBulk) {
        // Borrar todo lo de esta pestaña que tenga deleted_at
        query = query.not("deleted_at", "is", null);
        if (type === "comments") {
          // Filtro extra si estamos en la pestaña de comments o replies
          query =
            activeTab === "comments"
              ? query.is("parent_id", null)
              : query.not("parent_id", "is", null);
        }
      } else {
        // Borrar uno solo
        query = query.eq("id", id);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isBulk
          ? "Limpieza masiva completada."
          : "Elemento eliminado permanentemente.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin_trash"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Renderizado de las Pestañas
  const tabs = [
    { id: "posts", label: "Posts", icon: FileText },
    { id: "comments", label: "Comentarios", icon: MessageSquare },
    { id: "replies", label: "Respuestas", icon: CornerDownRight },
  ];

  console.log(trashedItems);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 ">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-gray-800/50 px-2 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
        >
          <ArrowLeft size={20} className="dark:text-white" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Trash2 className="text-rose-500" />
            Papelera
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Elementos eliminados permanentemente no se pueden recuperar
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-gray-400"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trashedItems?.length || 0} elementos en papelera
        </span>

        <button
          onClick={() => {
            if (
              window.confirm(
                `¿Vaciar todos los ${activeTab}? Esta acción es irreversible.`,
              )
            ) {
              hardDeleteMutation.mutate({
                type: activeTab === "posts" ? "posts" : "comments",
                isBulk: true,
              });
            }
          }}
          disabled={!trashedItems?.length || hardDeleteMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50 shadow-sm"
        >
          <Trash2 size={16} />
          Vaciar
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : trashedItems?.length === 0 ? (
          <div className="text-center p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Trash2 className="mx-auto text-gray-400 mb-3" size={36} />
            <p className="font-semibold text-gray-700 dark:text-white">
              Papelera vacía
            </p>
            <p className="text-sm text-gray-500">No hay elementos eliminados</p>
          </div>
        ) : (
          trashedItems.map((item) => {
            const hasMedia = item.post_media.length > 0;
            console.log(item.post_media.media_url);
            return (
              <div
                key={item.id}
                className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm hover:shadow-md transition"
              >
                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={item.profiles?.avatar || "/default-avatar.png"}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm font-semibold dark:text-white">
                      @{item.profiles?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      • {new Date(item.deleted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.content || "(Sin contenido)"}
                  </p>

                  {hasMedia && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {item.post_media.map((m) => {
                        const isVideo = m.media_type === "video";

                        return isVideo ? (
                          <video
                            key={m.id}
                            src={m.media_url}
                            className="h-40 w-full rounded-xl border dark:border-gray-700 object-cover"
                            controls
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <img
                            key={m.id}
                            src={m.media_url}
                            className="h-40 w-full rounded-xl border dark:border-gray-700 object-contain"
                            loading="lazy"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 w-full sm:w-auto opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() =>
                      restoreMutation.mutate({
                        id: item.id,
                        type: activeTab === "posts" ? "posts" : "comments",
                      })
                    }
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 transition"
                  >
                    <RefreshCcw size={18} />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Eliminar definitivamente? Esta acción es irreversible.",
                        )
                      ) {
                        hardDeleteMutation.mutate({
                          id: item.id,
                          type: activeTab === "posts" ? "posts" : "comments",
                        });
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminTrashCleanup;
