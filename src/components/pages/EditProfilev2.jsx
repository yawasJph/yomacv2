import { useAuth } from "@/context/AuthContext";
import { useEditProfile } from "@/hooks/editProfile/useEditProfile";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProfileEditSkeleton from "../skeletons/ProfileEditSkeleton";
import {
  ArrowLeft,
  Camera,
  Check,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Save,
} from "lucide-react";
import TiktokIcon from "../icons/TiktokIcon";
import UserBadgeSelector from "../user/UserBadgeSelector";

const BIO_LIMIT = 250;

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const {
    formData,
    setFormData,
    initialLoading,
    isSaving,
    previews,
    handleFileChange,
    handleSave,
    toggleBadge,
    loading,
  } = useEditProfile(user, navigate);

  if (initialLoading || !formData) return <ProfileEditSkeleton />;

  return (
    <div className="bg-white dark:bg-black pb-10">
      {/* HEADER */}
      <div className="sticky top-[57px] z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
          >
            <ArrowLeft size={20} className="dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">Editar Perfil</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            "Guardando..."
          ) : (
            <>
              <Save size={18} /> Guardar
            </>
          )}
        </button>
      </div>

      {/* RESTO DE LA UI IGUAL, PERO USANDO formData y toggleBadge del hook */}
      {/* Edición de Imágenes */}
      <div className="relative">
        {/* Input ocultos */}
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files[0], "avatar")}
        />
        <input
          type="file"
          ref={coverInputRef}
          hidden
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files[0], "cover")}
        />

        {/* Cover */}
        <div className="group relative h-40 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <img
            src={
              previews?.cover ||
              formData?.cover ||
              "https://images.unsplash.com/photo-1503264116251-35a269479413"
            }
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loading ? "opacity-30" : "opacity-60"
            }`}
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current.click()}
            disabled={loading}
            className="absolute inset-0 flex items-center justify-center text-white opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={30} />
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6 group">
          <div className="relative">
            <img
              src={
                previews?.avatar || formData?.avatar || "/default-avatar.png"
              }
              className={`w-24 h-24 rounded-full border-4 border-white dark:border-black object-cover transition-opacity ${
                loading ? "opacity-30" : "opacity-80"
              }`}
              loading="lazy"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
              className="absolute inset-0 flex items-center justify-center text-white bg-black/40 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-6 mt-16 space-y-6">
        {/* USERNAME (Solo lectura) */}
        {/* <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500">
            Nombre de Usuario
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              @
            </span>
            <input
              type="text"
              value={formData.username || ""}
              disabled
              className="w-full pl-8 p-3 bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-gray-800 cursor-not-allowed outline-none font-medium"
              title="El nombre de usuario es generado por la institución y no se puede cambiar."
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tu nombre de usuario es único y está vinculado a tu correo
            institucional.
          </p>
        </div> */}

        {/* Bio con contador de caracteres */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-gray-500">Biografía</label>
            <span
              className={`text-xs ${
                formData.bio?.length > BIO_LIMIT
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {formData.bio?.length} / {BIO_LIMIT}
            </span>
          </div>
          <textarea
            maxLength={BIO_LIMIT + 10} // Un poco de margen para el error
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={`w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border transition-all outline-none h-24 resize-none ${
              formData.bio?.length > BIO_LIMIT
                ? "border-red-500"
                : "border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500"
            }`}
          />
        </div>

        {/* Carrera y Ciclo (Con opción null manejada) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Carrera</label>
            <select
              value={formData.carrera || ""}
              onChange={(e) =>
                setFormData({ ...formData, carrera: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Seleccionar...</option>
              <option value="D.S.I.">Desarrollo de Sistemas (D.S.I.)</option>
              <option value="E.T.">Enfermería Técnica (E.T.)</option>
              <option value="I.A.B.">Ind. Alimentos y Bebidas (I.A.B.)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Ciclo</label>
            <select
              value={formData.ciclo || ""}
              onChange={(e) =>
                setFormData({ ...formData, ciclo: e.target.value })
              }
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Seleccionar...</option>
              {["I", "II", "III", "IV", "V", "VI"].map((c) => (
                <option key={c} value={c}>
                  Ciclo {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Socials */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold dark:text-white border-b border-gray-800 pb-2">
            Redes Sociales
          </h3>

          <div className="space-y-3">
            {[
              { id: "web", icon: <Globe size={18} />, label: "Web Personal" },
              {
                id: "linkedin",
                icon: <Linkedin size={18} />,
                label: "LinkedIn",
              },
              { id: "github", icon: <Github size={18} />, label: "GitHub" },
              {
                id: "instagram",
                icon: <Instagram size={18} />,
                label: "Instagram",
              },
              {
                id: "facebook",
                icon: <Facebook size={18} />,
                label: "Facebook",
              },
              {
                id: "tiktok",
                icon: <TiktokIcon />,
                label: "Tiktok",
              },
            ].map((social) => (
              <div
                key={social.id}
                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <span className="text-emerald-500">{social.icon}</span>
                <input
                  type="text"
                  placeholder={social.label}
                  value={formData.socials[social.id]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socials: {
                        ...formData.socials,
                        [social.id]: e.target.value,
                      },
                    })
                  }
                  className="bg-transparent outline-none text-sm w-full dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>
        {/* GESTIÓN DE INSIGNIAS */}

        {/* {formData.all_user_badges?.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-bold dark:text-white border-b border-gray-800 pb-2">
              Mis Insignias (Toca para equipar/desequipar)
            </h3>

            <div className="flex flex-wrap gap-3">

              <div className="space-y-4 border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">
                  Selecciona las que quieres mostrar en tu perfil público
                </p>

                <div className="flex flex-wrap gap-4">
                  {formData.all_user_badges.map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleBadge(badge.id, badge.is_equipped)}
                      className={`relative p-4 rounded-2xl border-2 transition-all active:scale-90 ${
                        badge.is_equipped
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10"
                          : "bg-gray-50 dark:bg-gray-900 border-transparent grayscale opacity-60"
                      }`}
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      {badge.is_equipped && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-black">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )} */}
        <UserBadgeSelector
          badges={formData?.all_user_badges || []}
          onToggle={toggleBadge}
        />
      </div>
    </div>
  );
};

export default EditProfile;
