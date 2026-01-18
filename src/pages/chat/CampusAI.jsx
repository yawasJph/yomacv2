import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Send, Coffee, Zap, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism"; // Estilo oscuro pro
import OpenAI from "openai";
// Configuración del cliente (Asegúrate de tener VITE_OPENAI_API_KEY en tu .env)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Necesario para correrlo directamente en el cliente (frontend)
});

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

  useEffect(() => {
    if (user?.id) {
      fetchChatHistory();
      fetchUserProfile(); // Nueva función
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("full_name, carrera, ciclo")
      .eq("id", user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const getDynamicInstruction = (profile) => {
    const name = profile?.full_name || "Colega";
    const carrera = profile?.carrera || "tu carrera";
    const ciclo = profile?.ciclo || "tu ciclo";
    const notes = profile?.yawas_notes || "No hay notas aún.";

    return `Tu nombre es Yawas. Eres el mejor amigo de los estudiantes del instituto. 
  Estás hablando con ${name}, que estudia ${carrera} y va en el ciclo ${ciclo}.
  NOTAS DE TU AMIGO: ${notes}.
  No eres formal. Usa esta info para saludarlo o darle consejos específicos de su carrera si te pregunta. 
  Habla como un amigo: '¡Qué onda ${name}!', 'Oye, para ser de ${ciclo} ciclo vas súper bien', etc. 
  Si no sabes algo, dilo con sinceridad.
  REGLA DE MEMORIA: Si el alumno te cuenta algo importante (cumpleaños, exámenes, dificultades, gustos), 
  al final de tu respuesta añade SIEMPRE el marcador: [[SAVE: dato importante]].
  Ejemplo: "¡Mucha suerte en tu examen! [[SAVE: Tiene examen de redes mañana]]"
  `;
  };

  // Scroll automático
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);{/**[message] */}

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (err) {
      console.error("Error cargando historial:", err.message);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //   const sendMessage = async (e) => {
  //     e.preventDefault();
  //     if (!input.trim() || isTyping || !user) return;

  //     const userText = input;
  //     setInput("");

  //     // 1. Guardar mensaje del usuario
  //     const userMsg = { user_id: user.id, text: userText, role: "user" };
  //     setMessages((prev) => [...prev, userMsg]);
  //     await supabaseClient.from("chat_messages").insert(userMsg);

  //     setIsTyping(true);

  //     // 2. Crear un mensaje vacío de Yawas para ir llenándolo
  //     const placeholderBotMsg = { user_id: user.id, text: "", role: "assistant" };
  //     setMessages((prev) => [...prev, placeholderBotMsg]);

  //     try {
  //       const stream = await openai.chat.completions.create({
  //         model: "gpt-4o-mini",
  //         messages: [
  //           { role: "system", content: getDynamicInstruction(userProfile) },
  //           ...messages.slice(-10).map((m) => ({
  //             role: m.role === "assistant" ? "assistant" : "user",
  //             content: m.text,
  //           })),
  //           { role: "user", content: userText },
  //         ],
  //         stream: true, // ¡ACTIVAMOS EL MODO FIRE! 🔥
  //       });

  //       let fullText = "";

  //       // 3. Procesar el flujo de datos palabra por palabra
  //       for await (const chunk of stream) {
  //         const content = chunk.choices[0]?.delta?.content || "";
  //         fullText += content;

  //         // Actualizamos el último mensaje en la lista (el de Yawas)
  //         setMessages((prev) => {
  //           const newMessages = [...prev];
  //           newMessages[newMessages.length - 1] = {
  //             ...placeholderBotMsg,
  //             text: fullText,
  //           };
  //           return newMessages;
  //         });
  //       }

  //       // 1. Extraer notas si existen
  //       const saveMatches = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/g);

  //       // 2. Limpiar el texto de TODAS las ocurrencias de [[SAVE: ...]]
  //       const cleanTextForDisplay = fullText
  //         .replace(/\[\[SAVE:.*?\]\]/g, "")
  //         .trim();

  //       // 3. Actualizar la nota en el perfil (profiles) si hubo hallazgos
  //       if (saveMatches) {
  //         const newNotesFound = saveMatches.map((m) =>
  //           m.replace("[[SAVE:", "").replace("]]", "").trim(),
  //         );
  //         const updatedNotes = userProfile.yawas_notes
  //           ? `${userProfile.yawas_notes}. ${newNotesFound.join(". ")}`
  //           : newNotesFound.join(". ");

  //         await supabaseClient
  //           .from("profiles")
  //           .update({ yawas_notes: updatedNotes })
  //           .eq("id", user.id);

  //         setUserProfile((prev) => ({ ...prev, yawas_notes: updatedNotes }));
  //       }

  //       // 4. GUARDAR EN SUPABASE (chat_messages) EL TEXTO LIMPIO
  //       // Así, al recargar, el marcador ya no existe en el historial.
  //       await supabaseClient.from("chat_messages").insert({
  //         user_id: user.id,
  //         text: cleanTextForDisplay, // <--- Importante: Texto limpio
  //         role: "assistant",
  //       });

  //       if (fullText.includes("[[SAVE:")) {
  //         // 1. Extraer el dato entre los corchetes
  //         const match = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/);
  //         const newNote = match ? match[1] : null;

  //         if (newNote) {
  //           // 2. Limpiar el texto para que el alumno no vea el código técnico
  //           const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();

  //           // 3. Actualizar la UI con el texto limpio
  //           setMessages((prev) => {
  //             const updated = [...prev];
  //             updated[updated.length - 1].text = cleanText;
  //             return updated;
  //           });

  //           // 4. Guardar en Supabase acumulando la nota
  //           const updatedNotes = userProfile.yawas_notes
  //             ? `${userProfile.yawas_notes}. ${newNote}`
  //             : newNote;

  //           await supabaseClient
  //             .from("profiles")
  //             .update({ yawas_notes: updatedNotes })
  //             .eq("id", user.id);

  //           // Actualizamos el estado local para que Yawas lo sepa en el siguiente mensaje
  //           setUserProfile({ ...userProfile, yawas_notes: updatedNotes });
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error Streaming OpenAI:", err);
  //       toast.error("Se cortó la conexión con Yawas 📡");
  //     } finally {
  //       setIsTyping(false);
  //     }
  //   };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !user) return;

    const userText = input;
    setInput("");

    // 1. Guardar mensaje del usuario en UI y DB
    const userMsg = { user_id: user.id, text: userText, role: "user" };
    setMessages((prev) => [...prev, userMsg]);
    await supabaseClient.from("chat_messages").insert(userMsg);

    setIsTyping(true);

    // 2. Placeholder para la respuesta de Yawas
    const placeholderBotMsg = { user_id: user.id, text: "", role: "assistant" };
    setMessages((prev) => [...prev, placeholderBotMsg]);

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: getDynamicInstruction(userProfile) },
          ...messages.slice(-10).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text,
          })),
          { role: "user", content: userText },
        ],
        stream: true,
      });

      let fullText = "";

      // 3. Streaming interactivo
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullText += content;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...placeholderBotMsg,
            text: fullText,
          };
          return newMessages;
        });
      }

      // --- PROCESAMIENTO POST-STREAMING ---

      // 4. Extraer notas y limpiar texto
      const saveMatches = fullText.match(/\[\[SAVE:\s*(.*?)\s*\]\]/g);
      const cleanText = fullText.replace(/\[\[SAVE:.*?\]\]/g, "").trim();

      // 5. Actualizar UI con el texto limpio (para eliminar los marcadores de la pantalla)
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = cleanText;
        return updated;
      });

      // 6. Guardar la respuesta LIMPIA en el historial de chat de Supabase
      await supabaseClient.from("chat_messages").insert({
        user_id: user.id,
        text: cleanText,
        role: "assistant",
      });

      // 7. Si hubo algo que guardar, actualizar yawas_notes en el perfil
      if (saveMatches) {
        const newNotesFound = saveMatches.map((m) =>
          m.replace("[[SAVE:", "").replace("]]", "").trim(),
        );

        const updatedNotes = userProfile?.yawas_notes
          ? `${userProfile.yawas_notes}. ${newNotesFound.join(". ")}`
          : newNotesFound.join(". ");

        await supabaseClient
          .from("profiles")
          .update({ yawas_notes: updatedNotes })
          .eq("id", user.id);

        // Actualizar estado local para el próximo mensaje
        setUserProfile((prev) => ({ ...prev, yawas_notes: updatedNotes }));

        // Opcional: un toast discreto o log
        console.log("Yawas aprendió algo nuevo:", newNotesFound);
      }
    } catch (err) {
      console.error("Error con Yawas:", err);
      toast.error("Se cortó la conexión con Yawas 📡");
    } finally {
      setIsTyping(false);
    }
  };

  // Componente interno para el botón de copiar
  const CopyButton = ({ text }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button
        onClick={handleCopy}
        className="hover:text-white transition-colors flex items-center gap-1"
      >
        {copied ? (
          <Check size={14} className="text-emerald-500" />
        ) : (
          <Copy size={14} />
        )}
        {copied ? "Copiado" : "Copiar"}
      </button>
    );
  };

  return (
    <div className="flex flex-col max-w-5xl mt-2  p-4 max-sm:p-0 md:h-[calc(100vh-40px)] bg-neutral-950 mb-10">
      {/** h-[calc(100vh-40px)] */}
      {/* Header Estilo Yawas */}
      <header className="flex items-center justify-between mb-6 p-6 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-linear-to-tr from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Zap size={28} className="text-black fill-black" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-neutral-900 rounded-full"></span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
              YAWAS
            </h1>
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="text-emerald-500">●</span> En línea y listo
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <span className="px-4 py-2 bg-neutral-800 rounded-full text-[10px] font-bold text-neutral-400 uppercase">
            Colega Digital
          </span>
        </div>
      </header>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 px-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600">
            <Coffee size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium italic">
              "¡Habla, causa! ¿En qué te ayudo hoy?"
            </p>
            <p className="text-xs uppercase tracking-widest mt-2">
              Yawas está escuchando...
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[85%] p-5 rounded-4xl shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-none"
              }`}
            >
              {/* REEMPLAZO DEL TEXTO SIMPLE POR MARKDOWN */}
              <ReactMarkdown
                children={m.text}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="relative my-4 rounded-xl overflow-hidden border border-neutral-700">
                        {/* Cabecera de la card de código */}
                        <div className="flex justify-between items-center bg-neutral-800 px-4 py-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                String(children).replace(/\n$/, ""),
                              );
                              toast.info("Copiado", {
                                ...toastStyle,
                                icon: "📚",
                              });
                            }}
                            className="hover:text-white transition-colors"
                          >
                            Copiar
                          </button>
                        </div>
                        {/* El resaltador de sintaxis */}
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, "")}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "0.85rem",
                            backgroundColor: "#0a0a0a",
                          }}
                        />
                      </div>
                    ) : (
                      <code
                        className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // También podemos dar estilo a las listas y negritas
                  ul: ({ children }) => (
                    <ul className="list-disc ml-5 space-y-2 my-3">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-5 space-y-2 my-3">
                      {children}
                    </ol>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-bold text-white mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                }}
              />

              <span className="text-[10px] opacity-40 mt-4 block font-mono">
                {m.role === "user" ? "" : "Yawas"}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input de Yawas */}
      <form
        onSubmit={sendMessage}
        className="relative p-2 bg-neutral-900 rounded-[3rem] border border-neutral-800 shadow-2xl focus-within:border-yellow-500/50 transition-all "
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Suelta lo que tengas en mente..."
          className="w-full bg-transparent text-white rounded-full px-6 py-4 pr-16 focus:outline-none text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={isTyping}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-500 p-3 rounded-full text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default CampusAI;
