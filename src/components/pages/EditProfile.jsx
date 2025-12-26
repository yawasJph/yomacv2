import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Globe,
  Instagram,
  Github,
  Linkedin,
  Save,
} from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner"; // O tu librería de notificaciones
import { validateSocials } from "../utils/validateSocials";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
 
  // Estados para los archivos seleccionados (no subidos aún)
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Estados para las URLs de vista previa (Blob)
  const [previews, setPreviews] = useState({ avatar: null, cover: null });

  const handleFileChange = (file, type) => {
    // const file = e.target.files[0];
    if (!file) return;

    // Creamos una URL temporal para mostrar en el <img>
    const previewUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      setAvatarFile(file);
      setPreviews((prev) => ({ ...prev, avatar: previewUrl }));
    } else {
      setCoverFile(file);
      setPreviews((prev) => ({ ...prev, cover: previewUrl }));
    }

  };

  const BIO_LIMIT = 250;

  // Estados del formulario
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    carrera: "",
    ciclo: "",
    avatar: "",
    cover: "",
    socials: { web: "", instagram: "", github: "", linkedin: "" },
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setFormData({
          ...data,
          socials: {
            web: "",
            instagram: "",
            github: "",
            linkedin: "",
            ...data.socials,
          },
        });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    // 1. Validar Bio
    if (formData.bio?.length > BIO_LIMIT) {
      return toast.error("La biografía es muy larga");
    }

    if (!validateSocials(formData)) return;

    setLoading(true);

    try {
      let finalAvatarUrl = formData.avatar;
      let finalCoverUrl = formData.cover;

      // A. Subir Avatar solo si cambió
      if (avatarFile) {
        const res = await uploadToCloudinary(avatarFile);
        finalAvatarUrl = res.secure_url; // Aquí extraemos la URL
      }

      // B. Subir Cover solo si cambió
      if (coverFile) {
        const res = await uploadToCloudinary(coverFile);
        finalCoverUrl = res.secure_url; // Aquí extraemos la URL
      }

      // C. Guardar todo en Supabase
      const { error } = await supabaseClient
        .from("profiles")
        .update({
          bio: formData.bio,
          carrera: formData.carrera || null,
          ciclo: formData.ciclo || null,
          avatar: finalAvatarUrl,
          cover: finalCoverUrl,
          socials: formData.socials,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil guardado con éxito");
      navigate(-1);
    } catch (err) {
      toast.error("Error al procesar el perfil");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-10">
      {/* Header Estilo App */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
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
          disabled={loading}
          className="bg-emerald-500 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save size={18} /> Guardar
            </>
          )}
        </button>
      </div>

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
      </div>
    </div>
  );
};

export default EditProfile;
