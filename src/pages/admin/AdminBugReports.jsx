import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bug, MessageSquarePlus, CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient"; // Ajusta a tu ruta

const AdminBugReports = () => {
  const queryClient = useQueryClient();

  // 1. Obtener los reportes con la información del usuario
  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ["admin_bug_reports"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("bug_reports")
        .select(`
          *,
          profiles:user_id ( full_name, avatar, username )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // 2. Mutación para cambiar el estado a 'resuelto' o 'pendiente'
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const { data, error } = await supabaseClient
        .from("bug_reports")
        .update({ status: newStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedReport) => {
      toast.success(
        updatedReport.status === "resuelto" 
          ? "¡Reporte marcado como resuelto!" 
          : "Reporte devuelto a pendiente."
      );
      // Invalida la caché para que se recargue la lista al instante
      queryClient.invalidateQueries({ queryKey: ["admin_bug_reports"] });
    },
    onError: () => {
      toast.error("Hubo un error al actualizar el estado.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500 text-center border border-red-200 rounded-xl bg-red-50">Error cargando los reportes.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes y Sugerencias</h2>
        <p className="text-gray-500 dark:text-gray-400">Gestiona el feedback de los usuarios de YoMAC.</p>
      </div>

      <div className="grid gap-4">
        {reports?.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
            <p className="text-lg font-medium dark:text-white">¡Todo al día!</p>
            <p className="text-gray-500">No hay reportes pendientes en este momento.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <div 
              key={report.id} 
              className={`p-5 rounded-2xl border transition-all ${
                report.status === "resuelto" 
                  ? "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800 opacity-70" 
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                {/* Cabecera del Reporte: Usuario y Tags */}
                <div className="flex gap-3">
                  <img 
                    src={report.profiles?.avatar || "/default-avatar.png"} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border dark:border-gray-800 object-cover" 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {report.profiles?.full_name}
                      </span>
                      <span className="text-sm text-gray-500">@{report.profiles?.username}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-1">
                      {/* Badge Categoría */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        report.category === "bug" 
                          ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" 
                          : "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}>
                        {report.category === "bug" ? <Bug size={10}/> : <MessageSquarePlus size={10}/>}
                        {report.category === "bug" ? "Error" : "Idea"}
                      </span>
                      
                      {/* Badge Estado */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        report.status === "resuelto" 
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" 
                          : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}>
                        {report.status === "resuelto" ? <CheckCircle size={10}/> : <Clock size={10}/>}
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div>
                  {report.status === "pendiente" ? (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: report.id, newStatus: "resuelto" })}
                      disabled={updateStatusMutation.isPending}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Marcar Resuelto
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: report.id, newStatus: "pendiente" })}
                      disabled={updateStatusMutation.isPending}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
                    >
                      <Clock size={16} />
                      Reabrir
                    </button>
                  )}
                </div>
              </div>

              {/* Contenido del Reporte */}
              <div className="mt-4 pl-0 sm:pl-13">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {report.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(report.created_at).toLocaleDateString("es-PE", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBugReports;