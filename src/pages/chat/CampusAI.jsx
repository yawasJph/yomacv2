import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Send, Coffee, Zap, Camera, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Estilo oscuro pro
import { uploadToCloudinary } from "../../cloudinary/upToCloudinary";

const toastStyle = {
  style: {
    borderRadius: "1.2rem",
    background: "#171717", // Neutral 900
    color: "#fff",
    border: "2px solid #10b981", // Emerald 500
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
};

const CampusAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  ////////////////////

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

      // 5. Llamada a la Edge Function
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
            systemInstruction: getDynamicInstruction(userProfile),
            imageUrl: uploadedImageUrl,
            messages: messages
              .slice(-10)
              .map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.text,
              }))
              .concat({ role: "user", content: userText }),
          }),
        },
      );

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
      toast.error("Yawas se distrajo un poco. ¡Intenta de nuevo!");
      // Opcional: eliminar el placeholder si falló
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  return (
  <div className="flex flex-col w-full max-w-5xl mx-auto h-dvh text-white overflow-hidden shadow-2xl">
    
    {/* Header Estilo Premium */}
    <header className="flex items-center justify-between p-4 md:p-6 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800/50 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-2.5 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Zap size={24} className="text-black fill-black" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full animate-pulse"></span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none">YAWAS</h1>
          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Online
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Ciclo actual</span>
          <span className="text-xs font-mono text-yellow-500">{userProfile?.ciclo || '-'}</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
           {/* Aquí puedes poner la foto del userProfile si la tienes */}
           <span className="text-xs font-bold text-neutral-400">{userProfile?.full_name?.charAt(0)}</span>
        </div>
      </div>
    </header>

    {/* Chat Space - Con degradado de profundidad */}
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/20 via-transparent to-transparent">
      
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-neutral-700 animate-in fade-in zoom-in duration-700">
          <div className="bg-neutral-900/50 p-8 rounded-[3rem] border border-neutral-800/50 flex flex-col items-center">
            <Coffee size={40} className="mb-4 opacity-10 text-yellow-500" />
            <p className="text-lg font-medium italic text-neutral-400 text-center">
              "¡Habla, causa! ¿En qué andamos?"
            </p>
            <div className="flex gap-2 mt-4">
               <span className="px-3 py-1 bg-neutral-800 rounded-full text-[9px] text-neutral-500 font-bold">TAREAS</span>
               <span className="px-3 py-1 bg-neutral-800 rounded-full text-[9px] text-neutral-500 font-bold">CÓDIGO</span>
               <span className="px-3 py-1 bg-neutral-800 rounded-full text-[9px] text-neutral-500 font-bold">DUDAS</span>
            </div>
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
          <div className={`flex flex-col max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
            
            <div className={`relative p-4 md:p-5 rounded-4xl shadow-2xl transition-all ${
              m.role === "user"
                ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/20"
                : "bg-neutral-900 border border-neutral-800/80 text-neutral-200 rounded-tl-none shadow-black/40"
            }`}>
              
              {m.image_url && (
                <div className="mb-3 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                  <img src={m.image_url} alt="Adjunto" className="max-h-72 w-full object-cover" />
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50">
                <ReactMarkdown
                  children={m.text}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="relative my-4 rounded-2xl overflow-hidden border border-neutral-800 group">
                          <div className="flex justify-between items-center bg-neutral-800/80 px-4 py-2 text-[10px] font-mono text-neutral-400">
                            <span className="font-bold text-yellow-500/80">{match[1]}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                                toast.success("Copiado al portapapeles", { ...toastStyle, icon: "🔥" });
                              }}
                              className="bg-neutral-700 px-2 py-1 rounded-md hover:bg-neutral-600"
                            >
                              Copiar
                            </button>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            children={String(children).replace(/\n$/, "")}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: "1.2rem", fontSize: "0.8rem", backgroundColor: "#050505" }}
                          />
                        </div>
                      ) : (
                        <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* Etiqueta de nombre y tiempo */}
            {/* <div className={`flex items-center gap-2 mt-2 px-2 text-[9px] font-black uppercase tracking-tighter opacity-30 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}>
              <span>{m.role === "user" ? "Tú" : "Yawas"}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div> */}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="bg-neutral-900/50 border border-neutral-800/50 p-4 rounded-3xl rounded-tl-none">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={scrollRef} className="h-4" />
    </div>

    {/* Input Flotante con efecto Glassmorphism */}
    <footer className="p-4 md:p-6 bg-linear-to-t ">
      <form
        onSubmit={sendMessage}
        className="relative flex items-center gap-2 p-2 bg-neutral-900/80 backdrop-blur-xl rounded-[2.5rem] border border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] focus-within:border-yellow-500/40 transition-all duration-300"
      >
        {previewUrl && (
          <div className="absolute -top-28 left-4 p-2 bg-neutral-800 rounded-3xl border border-neutral-700 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="relative group">
              <img src={previewUrl} className="h-20 w-20 object-cover rounded-2xl border border-white/10" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:scale-110 transition-transform"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <label className="flex items-center justify-center cursor-pointer hover:bg-neutral-800 text-neutral-500 hover:text-yellow-500 w-12 h-12 rounded-full transition-all shrink-0">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          <Camera size={22} />
        </label>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Habla, ¿qué andamos haciendo?"
          className="flex-1 bg-transparent text-white py-3 px-2 focus:outline-none text-sm md:text-base placeholder:text-neutral-600 font-medium"
        />

        <button
          type="submit"
          disabled={isTyping || (!input.trim() && !imageFile)}
          className="flex items-center justify-center bg-yellow-500 w-12 h-12 rounded-full text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale shrink-0 shadow-lg shadow-yellow-500/20"
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </form>
      <p className="text-[8px] text-center text-neutral-700 mt-4 font-bold uppercase tracking-[0.3em]">
        Yawas v4.0 • Inteligencia Estudiantil
      </p>
    </footer>
  </div>
);
};

export default CampusAI;
