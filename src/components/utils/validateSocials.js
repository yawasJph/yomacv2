import { toast } from "sonner";

// export const validateSocials = (formData) => {
//   const patterns = {
//     web: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
//     instagram:
//       /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9(_).]{1,30}\/?$/,
//     github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]{1,39}\/?$/,
//     linkedin:
//       /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]{5,100}\/?$/,
//   };

//   for (const key in formData.socials) {
//     const url = formData.socials[key];
//     if (url && !patterns[key].test(url)) {
//       toast.error(`La URL de ${key} no es válida`);
//       return false;
//     }
//   }
//   return true;
// };

export const validateSocials = (formData) => {
  if (!formData?.socials) return true;

  const patterns = {
    web: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([\/\w .-]*)*\/?$/i,

    instagram:
      /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/,

    github:
      /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]{1,39}\/?$/,

    linkedin:
      /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-_%]+\/?$/,

    // ✅ NUEVO
    facebook:
      /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]{5,}\/?$/,

    // ✅ NUEVO (soporta @user o /user)
    tiktok:
      /^(https?:\/\/)?(www\.)?tiktok\.com\/(@[a-zA-Z0-9._]{2,24}|[a-zA-Z0-9._]{2,24})\/?$/,
  };

  for (const key in formData.socials) {
    const url = formData.socials[key];

    if (!url) continue;

    if (!patterns[key]) continue;

    if (!patterns[key].test(url)) {
      toast.error(`La URL de ${key} no es válida`);
      return false;
    }
  }

  return true;
};
