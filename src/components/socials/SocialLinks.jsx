import {
  Github,
  Instagram,
  Linkedin,
  Globe,
  Facebook,
} from "lucide-react";
import TiktokIcon from "../icons/TiktokIcon";

// 🔥 TikTok SVG (inline)
// const TiktokIcon = ({ size = 18 }) => (
//   <svg
//     viewBox="0 0 24 24"
//     width={size}
//     height={size}
//     fill="currentColor"
//   >
//     <path d="M9 3v12.5a3.5 3.5 0 1 1-3.5-3.5c.3 0 .6 0 .9.1V9.5a6.5 6.5 0 1 0 6.5 6.5V6.3c1.1 1 2.5 1.7 4.1 1.8V5.2c-1.3-.1-2.5-.7-3.4-1.6-.9-.9-1.5-2.1-1.6-3.6H9z" />
//   </svg>
// );

// 🔗 normalizar URL
const normalizeUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

const iconMap = {
  github: <Github size={18} />,
  instagram: <Instagram size={18} />,
  linkedin: <Linkedin size={18} />,
  facebook: <Facebook size={18} />,
  tiktok: <TiktokIcon />,
  web: <Globe size={18} />,
};

// 🎨 colores SOLO en hover (pro UX)
const hoverColors = {
  github: "hover:text-black dark:hover:text-white",
  instagram: "hover:text-pink-500",
  linkedin: "hover:text-blue-500",
  facebook: "hover:text-blue-600",
  tiktok: "hover:text-cyan-400",
  web: "hover:text-emerald-500",
};

export default function SocialLinks({ socials }) {
  if (!socials) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(socials).map(([platform, url]) => {
        if (!url) return null;

        return (
          <a
            key={platform}
            href={normalizeUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            title={platform}
            className={`group p-2 rounded-xl 
              bg-gray-50 dark:bg-gray-900 
              border border-gray-100 dark:border-gray-800 
              text-gray-600 dark:text-gray-400 
              hover:shadow-md hover:-translate-y-0.5 hover:scale-105
              transition-all duration-200
              ${hoverColors[platform] || "hover:text-emerald-500"}`}
          >
            {iconMap[platform] || <Globe size={18} />}
          </a>
        );
      })}
    </div>
  );
}