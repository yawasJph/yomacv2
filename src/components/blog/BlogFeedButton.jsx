import { useIsMobile } from "@/hooks/useIsMobile";
import { Info, NotebookTabs, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoModal from "./BlogInfoModal";

export const BlogFeedButton = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return isMobile ? (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
      >
        <Info size={20} />
      </button>

      <InfoModal open={modalOpen} onClose={()=>setModalOpen(false)} />
    </>
  ) : (
    <button
      onClick={() => navigate("/blog/my-blogs")}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
    >
      <NotebookTabs size={20} /> Mis Blogs
    </button>
  );
};