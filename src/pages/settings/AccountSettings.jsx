import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSimpleProfile } from "@/hooks/user/useSimpleProfile";
import { User, Mail, ShieldAlert, LogOut, Pencil, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ConfirmModal from "@/components/modals/ConfirmModalv2";
import { useDeleteUser } from "@/hooks/user/useDeleteUser";

const AccountSettings = () => {
  const { user, signout, loading } = useAuth();
  const { data: profile, isPending: profileLoading } = useSimpleProfile(
    user?.id,
  );
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const { deleteUser, isDeleting } = useDeleteUser();

  // const handleDeleteAccount = async () => {
  //   const confirmDelete = window.confirm(
  //     "¿Estás completamente seguro de que deseas eliminar tu cuenta? Todos tus datos se perderán y esta acción no se puede deshacer.",
  //   );

  //   if (!confirmDelete) return;

  //   setIsDeleting(true);

  //   try {
  //     const { error } = await supabaseClient.functions.invoke(
  //       "delete-user-account",
  //     );
  //     if (error) throw error;
  //     notify.success("Cuenta eliminada exitosamente");
  //     await signout();
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error al eliminar la cuenta:", error);
  //     notify.error("Hubo un problema al eliminar la cuenta.");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  if (loading) {
    return <div className="text-black dark:text-white">Cargando...</div>;
  }

  if (!user) {
    return <div className="text-black dark:text-white">No permitido</div>;
  }

  if (profileLoading || !profile) {
    return <div className="text-black dark:text-white">Cargando perfil...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cuenta
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Administra tu cuenta y perfil.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-6">
        {/* USER INFO */}
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <img
            src={profile?.avatar || "/avatar.png"}
            className="w-16 h-16 rounded-full object-cover"
            alt="Avatar"
          />
          <div>
            <h3 className="font-bold text-lg dark:text-white">
              {profile?.full_name || "Sin nombre"}
            </h3>
            <p className="text-sm text-gray-500">@{profile?.username}</p>
          </div>
        </div>

        {/* EMAIL */}
        <div className="flex items-center gap-3 p-3 rounded-xl">
          <Mail className="text-gray-400" size={20} />
          <div>
            <p className="font-medium dark:text-white">Correo</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* GOOGLE INFO */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
          <User className="text-gray-400" size={20} />
          <div>
            <p className="font-medium dark:text-white">Autenticación</p>
            <p className="text-sm text-gray-500">Conectado con Google</p>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <Link to={`/profile/@${profile.username}`}>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Pencil className="text-gray-400" size={20} />
              <div>
                <p className="font-medium dark:text-white">Editar perfil</p>
                <p className="text-sm text-gray-500">
                  Cambia avatar, bio y más
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* LOGOUT */}
        <button
          onClick={signout}
          disabled={loading || isDeleting}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50"
        >
          <LogOut className="text-gray-400" size={20} />
          <span className="font-medium dark:text-white">Cerrar sesión</span>
        </button>

        {/* DELETE ACCOUNT */}
        <button
          onClick={() => setOpenConfirmModal(true)}
          disabled={loading || isDeleting}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <Loader2 className="text-red-400 animate-spin" size={20} />
          ) : (
            <ShieldAlert
              className="text-red-400 group-hover:text-red-500"
              size={20}
            />
          )}
          <div className="text-left">
            <p className="font-medium text-red-500">
              {isDeleting ? "Eliminando..." : "Eliminar cuenta"}
            </p>
            <p className="text-sm text-red-400/80">
              Esta acción es irreversible
            </p>
          </div>
        </button>
      </div>

      <ConfirmModal
        isOpen={openConfirmModal}
        title={"YoMAC"}
        message={
          "¿Estás completamente seguro de que deseas eliminar tu cuenta? Todos tus datos se perderán y esta acción no se puede deshacer."
        }
        onClose={() => setOpenConfirmModal(false)}
        isLoading={isDeleting}
        onConfirm={deleteUser}
      />
    </div>
  );
};

export default AccountSettings;
