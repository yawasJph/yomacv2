import { useState } from "react";
import { Bug, Send, MessageSquarePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBugReport } from "@/hooks/bugs-report/useBugReport";
import ImageUpload from "@/components/uploads/ImageUpload";
import { uploadToCloudinary } from "@/cloudinary/upToCloudinary";
import { getDeviceInfo } from "@/utils/data/getDeviceInfo";
import { REPORT_BUGS } from "@/consts/bugs";

const ReportBug = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState(REPORT_BUGS.category.bug);
  const [description, setDescription] = useState("");
  const { sendReport, reportLoading } = useBugReport();
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null);
  const [reset, setReset] = useState(0);

  const userId = user?.id;
  const device_info = getDeviceInfo()
  const isBug = category === REPORT_BUGS.category.bug

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !userId) return;

    setLoading(true)

    let image_url = "";
    if (file) {
      const result = await uploadToCloudinary(file);
      image_url = result.secure_url;
    }

    sendReport(
      { category, description, userId, image_url, device_info },
      {
        onSuccess: () => {
          setDescription("");
          setFile(null);
          setReset((prev) => prev + 1);
        },
      },
    );

    setLoading(false)
  };

  const handleImage = (file) => {
    setFile(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Ayúdanos a mejorar
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          ¿Encontraste un error o tienes una idea genial para YoMAC? Cuéntanos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-6"
      >
        {/* Selector de Categoría */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCategory(REPORT_BUGS.category.bug)}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition gap-2 ${
              isBug
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                : "border-gray-200 dark:border-gray-800 text-gray-500 hover:border-emerald-300"
            }`}
          >
            <Bug size={24} />
            <span className="font-medium">Reportar {REPORT_BUGS.categoryLabels.bug}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory(REPORT_BUGS.category.suggestion)}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition gap-2 ${
              !isBug
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                : "border-gray-200 dark:border-gray-800 text-gray-500 hover:border-emerald-300"
            }`}
          >
            <MessageSquarePlus size={24} />
            <span className="font-medium">{REPORT_BUGS.categoryLabels.suggestion}</span>
          </button>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-gray-300">
            Descripción {isBug ? "del error" : "de tu idea"}
          </label>
          <textarea
            required
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isBug
                ? "¿Qué estabas haciendo cuando ocurrió el error? Sé lo más detallado posible..."
                : "¿Qué función te gustaría ver en YoMAC?"
            }
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none dark:text-white transition"
          />
        </div>

        <ImageUpload onChange={handleImage} resetKey={reset}/>

        <button
          type="submit"
          disabled={!description.trim() || loading || reportLoading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || reportLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={18} />
              Enviar reporte
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportBug;
