import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "../../supabase/supabaseClient";
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { notify } from "@/utils/toast/notifyv3";
import { validateSocials } from "@/components/utils/validateSocials";

export const useEditProfile = (user, navigate) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(null);
  const [previews, setPreviews] = useState({ avatar: null, cover: null });
  const [files, setFiles] = useState({ avatar: null, cover: null });

  // 1. OBTENER DATOS (Cache con React Query)
  const { data: profile, isLoading: initialLoading } = useQuery({
    queryKey: ["profile-edit", user?.id],
    queryFn: async () => {
      const { data: profileData } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const { data: badgeData } = await supabaseClient
        .from("user_badges")
        .select(`is_equipped, badge_id, badges(id, name, icon)`)
        .eq("user_id", user.id);

      return {
        ...profileData,
        all_user_badges:
          badgeData?.map((b) => ({
            id: b.badge_id,
            is_equipped: b.is_equipped,
            name: b.badges.name,
            icon: b.badges.icon,
          })) || [],
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache fresca
  });

  // Sincronizar estado local con la cache
  // useEffect(() => {
  //   if (profile && !formData) {
  //     setFormData({
  //       ...profile,
  //       bio: profile.bio || "",
  //       socials: { web: "", instagram: "", github: "", linkedin: "", ...profile.socials },
  //     });
  //   }
  // }, [profile]);
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        bio: profile.bio || "",
        socials: {
          web: "",
          instagram: "",
          github: "",
          linkedin: "",
          ...profile.socials,
        },
      });
    }
  }, [profile]);

  // 2. MANEJO DE ARCHIVOS
  const handleFileChange = (file, type) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFiles((prev) => ({ ...prev, [type]: file }));
    setPreviews((prev) => ({ ...prev, [type]: previewUrl }));
  };

  // 3. MUTACIÓN PARA GUARDAR
  const saveMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl = formData.avatar;
      let coverUrl = formData.cover;

      if (files.avatar)
        avatarUrl = (await uploadToCloudinary(files.avatar)).secure_url;
      if (files.cover)
        coverUrl = (await uploadToCloudinary(files.cover)).secure_url;

      const { error } = await supabaseClient
        .from("profiles")
        .update({
          bio: formData.bio,
          carrera: formData.carrera || null,
          ciclo: formData.ciclo || null,
          avatar: avatarUrl,
          cover: coverUrl,
          socials: formData.socials,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["profile", user.id]);
      notify.success("Perfil guardado");
      navigate(-1);
    },
    onError: () => notify.error("Error al guardar"),
  });

  // 4. TOGGLE DE INSIGNIAS (Optimista)
  const toggleBadge = async (badgeId, currentStatus) => {
    // Actualización local inmediata (UI feels instant)
    setFormData((prev) => ({
      ...prev,
      all_user_badges: prev.all_user_badges.map((b) =>
        b.id === badgeId ? { ...b, is_equipped: !currentStatus } : b,
      ),
    }));

    const { error } = await supabaseClient
      .from("user_badges")
      .update({ is_equipped: !currentStatus })
      .eq("user_id", user.id)
      .eq("badge_id", badgeId);

    if (error) notify.error("Error al actualizar insignia");
    else queryClient.invalidateQueries(["profile", user.id]);
  };

  return {
    formData,
    setFormData,
    initialLoading,
    isSaving: saveMutation.isLoading,
    previews,
    handleFileChange,
    handleSave: () => {
      if (!validateSocials(formData)) return;
      saveMutation.mutate();
    },
    toggleBadge,
    loading: saveMutation.isPending,
  };
};
