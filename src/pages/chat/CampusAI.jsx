import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Send, Zap, Camera, X, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Estilo oscuro pro
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import { TOAST_STYLE } from "../../utils/yawas/constants";

// const toastStyle = {
//   style: {
//     borderRadius: "1.2rem",
//     background: "#171717", // Neutral 900
//     color: "#fff",
//     border: "2px solid #10b981", // Emerald 500
//     fontSize: "12px",
//     fontWeight: "900",
//     textTransform: "uppercase",
//     letterSpacing: "1px",
//     boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
//   },
// };

const CampusAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const getDynamicInstruction = (profile) => {
    const name = profile?.full_name || "Colega";
    const carrera = profile?.carrera || "su carrera";
    const ciclo = profile?.ciclo || "su ciclo";
    const notes = profile?.yawas_notes
      ? `CONTEXTO PREVIO DE TU AMIGO: ${profile.yawas_notes}`
      : "Aún no conoces mucho de este amigo, ¡empieza a conocerlo!";

    return `Tu nombre es Yawas. Eres el mejor amigo de los estudiantes del instituto. 
  Estás hablando con ${name}, estudiante de ${carrera} (${ciclo} ciclo).
  
  ${notes}

  PERSONALIDAD:
  - No eres un asistente formal, eres un "causa", un "compa".
  - Usa jerga juvenil peruana de forma natural pero moderada (ej: "habla", "causa", "chévere", "ya fuiste").
  - Eres motivador y empático. Si tiene exámenes, dale ánimos.

  REGLA DE MEMORIA (CRUCIAL):
  - Si el usuario te cuenta algo nuevo e importante (fechas, gustos, planes), guarda el dato.
  - Al final de tu respuesta, usa: [[SAVE: dato corto]].
  - IMPORTANTE: Solo usa [[SAVE]] para información NUEVA que no esté en el 'CONTEXTO PREVIO'. No repitas info que ya guardaste.
  
  EJEMPLO DE RESPUESTA:
  "¡Qué buena ${name}! Ya falta poco para terminar el ${ciclo} ciclo, tú puedes. [[SAVE: Le gusta programar en Python]]"
  `;
  };

  // 1. CARGA INICIAL (Perfil e Historial)
  useEffect(() => {
    const initChat = async () => {
      if (user?.id) {
        const profile = await fetchUserProfile();
        const history = await fetchChatHistory();

        // Si no hay mensajes previos, Yawas saluda por iniciativa propia
        if (history.length === 0 && profile) {
          triggerWelcomeGreeting(profile);
        }
      }
    };
    initChat();
  }, [user]);

  // 2. FUNCIONES DE APOYO
  const fetchUserProfile = async () => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("full_name, carrera, ciclo, yawas_notes")
      .eq("id", user.id)
      .single();
    if (data) setUserProfile(data);
    return data;
  };

  const fetchChatHistory = async () => {
    const { data, error } = await supabaseClient
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }); // ORDEN DOBLE PARA EVITAR DESORDEN

    if (data) {
      setMessages(data);
      return data;
    }
    return [];
  };

  // 3. LÓGICA DE SALUDO AUTOMÁTICO
  const triggerWelcomeGreeting = async (profile) => {
    setIsTyping(true);
    const welcomePlaceholder = {
      user_id: user.id,
      text: "",
      role: "assistant",
    };
    setMessages([welcomePlaceholder]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            systemInstruction: `Eres Yawas. Tu amigo ${profile.full_name} acaba de entrar. Basado en sus notas: "${profile.yawas_notes || "No hay notas"}", dale un saludo corto (max 2 oraciones), muy informal y motivador. No uses [[SAVE]] aquí.`,
            messages: [
              { role: "user", content: "¡Hola Yawas! Acabo de entrar." },
            ],
          }),
        },
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([{ ...welcomePlaceholder, text: fullText }]);
      }

      await supabaseClient.from("chat_messages").insert({
        user_id: user.id,
        text: fullText,
        role: "assistant",
      });
    } catch (err) {
      console.error("Error en saludo:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll automático
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const callYawasAPI = async (currentProvider , uploadedImageUrl, userText) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yawas-chat-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          provider: currentProvider, // Pasamos el proveedor elegido
          systemInstruction: getDynamicInstruction(userProfile),
          imageUrl: uploadedImageUrl,
          messages: messages
            .slice(-8)//-10
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.text,
            }))
            .concat({ role: "user", content: userText }),
        }),
      },
    );
    return response;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    // Validación básica
    // LOGICA DE VALIDACIÓN CORREGIDA:
    const hasText = input.trim().length > 0;
    const hasImage = imageFile !== null;

    if (!hasText && !hasImage) return; // Si no hay nada, no hace nada

    const userText = input;
    const currentImageFile = imageFile; // Referencia local antes de limpiar
    setInput("");
    setIsTyping(true);

    // 1. Limpiar estados de selección de imagen inmediatamente para la UI
    setImageFile(null);
    setPreviewUrl(null);

    try {
      let uploadedImageUrl = null;

      // 2. Si hay imagen, subirla PRIMERO a Cloudinary
      if (currentImageFile) {
        const uploadData = await uploadToCloudinary(currentImageFile);
        uploadedImageUrl = uploadData.secure_url;
      }

      // 3. Crear el objeto de mensaje final del usuario
      const userMsg = {
        user_id: user.id,
        text: userText || "Envió una imagen",
        role: "user",
        image_url: uploadedImageUrl, // Aquí ya tenemos la URL, se verá de inmediato
      };

      // 4. Actualizar estado local y Base de Datos (UNA SOLA VEZ)
      // Agregamos el mensaje del usuario y el placeholder de Yawas al mismo tiempo
      const placeholderBotMsg = {
        user_id: user.id,
        text: "",
        role: "assistant",
      };
      setMessages((prev) => [...prev, userMsg, placeholderBotMsg]);

      await supabaseClient.from("chat_messages").insert(userMsg);

      let response = await callYawasAPI("groq", uploadedImageUrl, userText); // Intento 1: Groq

      if (!response.ok) {
        console.warn("Groq saturado, intentando con Mistral...");
        response = await callYawasAPI("mistral", uploadedImageUrl, userText); // Intento 2: Mistral
      }

      if (!response.ok) {
        response = await callYawasAPI("openai", uploadedImageUrl, userText); // Intento 3: OpenAI
      }

      if (!response.ok) throw new Error("Error en la función");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Actualizar el último mensaje (el placeholder) con el stream
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...placeholderBotMsg,
            text: fullText,
          };
          return updated;
        });
      }

      // 6. Lógica de limpieza y guardado de Yawas
      const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();
      const saveMatches = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/g);

      // Actualizar UI final de Yawas
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = cleanText;
        return updated;
      });

      await supabaseClient.from("chat_messages").insert({
        user_id: user.id,
        text: cleanText,
        role: "assistant",
      });

      // 7. Guardar notas si existen
      if (saveMatches && userProfile) {
        const newNotesFound = saveMatches.map((m) =>
          m.replace("[[SAVE:", "").replace("]]", "").trim(),
        );
        const updatedNotes = userProfile.yawas_notes
          ? `${userProfile.yawas_notes}. ${newNotesFound.join(". ")}`
          : newNotesFound.join(". ");

        await supabaseClient
          .from("profiles")
          .update({ yawas_notes: updatedNotes })
          .eq("id", user.id);

        setUserProfile((prev) => ({ ...prev, yawas_notes: updatedNotes }));
      }
    } catch (err) {
      console.error("Error con Yawas:", err);
     // toast.error("Todos los proveedores están ocupados.");
      toast.error("Yawas se distrajo un poco. ¡Intenta de nuevo!");
      // Opcional: eliminar el placeholder si falló
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black  bg-linear-to-br from-white via-gray-50 to-white text-gray-900 dark:bg-linear-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 dark:text-white transition-colors duration-300 ">
      {/* Header Estilo Premium */}
      <header
        className={`flex items-center gap-5 p-4 md:p-6 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800/50 ${isMobile && "sticky top-0 z-10 px-3"}
      bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-gray-900/30 transition-all`}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-2xl  hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="p-2.5 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 dark:from-yellow-400 dark:to-orange-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30 animate-pulse-subtle">
              <Zap size={22} className="text-black fill-black" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight bg-linear-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                YAWAS
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Space - Con degradado de profundidad */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-neutral-900/20 via-transparent to-transparent  md:px-4  md:py-6  bg-linear-to-b  dark:from-gray-900/50 dark:via-black/50 dark:to-gray-900/50 custom-scrollbar">
        {/**from-white via-gray-50/50 to-white */}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400 animate-in fade-in duration-700">
            <div className="max-w-md w-full p-6 md:p-8 text-center">
              <div className="mb-6 p-4 rounded-3xl bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900/30 border border-emerald-100 dark:border-emerald-900/30 inline-block">
                <div className="p-4 rounded-2xl bg-linear-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-950/20 shadow-inner">
                  <Zap
                    size={32}
                    className="text-emerald-500 dark:text-emerald-400 mx-auto"
                  />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent mb-3">
                ¡Hola, estudiante!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
                Soy tu asistente académico inteligente. ¿En qué puedo ayudarte
                hoy?
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-sm mx-auto">
                {[
                  "📚 Tareas",
                  "💻 Código",
                  "🤔 Dudas",
                  "🔬 Proyectos",
                  "📝 Ensayos",
                  "🧮 Cálculos",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setInput(item.split(" ")[1]?.toLowerCase() + " ")
                    }
                    className="px-3 py-2.5 text-xs font-medium rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-8 font-medium">
                Pulsa para comenzar
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex w-full animate-in slide-in-from-bottom-2 duration-300 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex flex-col max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              {/* Avatar para mensajes del bot */}
              {m.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1.5 ml-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <Zap size={12} className="text-black fill-black" />
                  </div>
                  <span className="text-xs font-medium text-black dark:text-white">
                    YAWAS
                  </span>
                </div>
              )}
              <div
                className={`relative p-4 md:p-5 rounded-4xl shadow-2xl transition-all  duration-300  ${
                  m.role === "user"
                    ? " bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none shadow-emerald-500/20"
                    : "bg-neutral-900 border border-neutral-800/80 text-neutral-200 rounded-tl-none shadow-black/40 dark:border-gray-700/50 dark:text-gray-200 rounded-bl-none  dark:shadow-gray-900/30"
                }`}
              >
                {m.image_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 dark:border-gray-700 shadow-inner group">
                    <img
                      src={m.image_url}
                      alt="Adjunto"
                      className="max-h-64 md:max-h-72 w-full object-container transition-transform group-hover:scale-[1.02] duration-500"
                    />
                  </div>
                )}

                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose prose-sm prose-p:leading-relaxed prose-p:my-2 prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown
                    children={m.text}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="relative my-4 rounded-2xl overflow-hidden border border-neutral-800 group  dark:border-gray-700 group bg-gray-900">
                            <div className="flex justify-between items-center  px-4 py-2 text-[10px] font-mono text-neutral-400 bg-neutral-800/80  dark:bg-gray-800 text-xs dark:text-gray-400 ">
                              <span className="font-bold text-yellow-500/70 dark:text-yellow-500/90">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    String(children).replace(/\n$/, ""),
                                  );
                                  toast.success("Copiado al portapapeles", {
                                    ...TOAST_STYLE,
                                    icon: "🔥",
                                  });
                                }}
                                className="  bg-neutral-700 px-2 py-1 rounded-md hover:bg-neutral-600  transition-all duration-300    text-xs font-medium  dark:hover:bg-gray-600 text-gray-200 dark:text-gray-300 border border-gray-600 dark:border-gray-600 shadow-sm"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, "")}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: "1.2rem",
                                fontSize: "0.8rem",
                                backgroundColor: "#050505",
                              }}
                            />
                          </div>
                        ) : (
                          <code
                            className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-xs dark:bg-gray-800 "
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-neutral-900/50 border border-neutral-800/50 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-2 md:h-4" />
      </div>

      {/* Input Flotante con efecto Glassmorphism */}
      <footer className="p-4 md:p-6 bg-linear-to-t sticky bottom-0 z-40 from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <form
          onSubmit={sendMessage}
          className="relative flex items-center gap-2 p-2 bg-neutral-900/80 border-neutral-800  backdrop-blur-xl rounded-[2.5rem] border shadow-[0_10px_30px_rgba(0,0,0,0.5)]  transition-all duration-300   dark:bg-gray-800/80 focus-within:border-yellow-400  dark:border-gray-700/50  shadow-gray-200/50 dark:shadow-gray-900/30 dark:focus-within:border-yellow-500 focus-within:shadow-yellow-100 dark:focus-within:shadow-yellow-900/20 "
        >
          {previewUrl && (
            <div className="absolute -top-28 left-4 p-2  rounded-3xl border bg-neutral-800 border-neutral-700 shadow-2xl slide-in-from-bottom-4  md:-top-32 dark:bg-gray-800 dark:border-gray-700  animate-in slide-in-from-bottom-4 z-50">
              <div className="relative group">
                <img
                  src={previewUrl}
                  className="h-20 w-20 object-cover rounded-2xl border border-white/10  md:h-24 md:w-24  dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <label className="flex items-center justify-center cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500      w-10 h-10 md:w-12 md:h-12 rounded-full transition-all shrink-0 ml-2">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Camera size={22} />
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Habla, ¿qué andamos haciendo?"
            className="flex-1 bg-transparent text-white py-3 px-2 focus:outline-none text-sm md:text-base font-medium    placeholder:text-gray-400 dark:placeholder:text-gray-500 "
          />

          <button
            type="submit"
            disabled={isTyping || (!input.trim() && !imageFile)}
            className="flex items-center justify-center  rounded-full text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:grayscale shrink-0 shadow-lg shadow-yellow-500/20  bg-linear-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 w-10 h-10 md:w-12 md:h-12  disabled:cursor-not-allowed dark:shadow-yellow-500/40"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
        <p className="text-[8px] text-center text-neutral-700 mt-4 font-bold uppercase tracking-[0.3em] ">
          Yawas v4.0 • Inteligencia Estudiantil
        </p>
      </footer>
    </div>
  );
};

export default CampusAI;
