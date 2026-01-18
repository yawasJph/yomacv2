import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { supabaseClient } from "../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const CampusChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // 1. Cargar historial al abrir
  useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen]);

  // 2. Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabaseClient
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { user_id: user.id, text: input, role: "user" };
    
    // Guardar en Supabase
    const { error } = await supabaseClient.from("chat_messages").insert(userMessage);
    if (error) return;

    setMessages([...messages, userMessage]);
    setInput("");
    
    // Aquí es donde luego llamaremos a la IA
    simulateBotResponse(input);
  };

  const simulateBotResponse = (text) => {
    setLoading(true);
    setTimeout(() => {
      const botReply = { user_id: user.id, text: "Estoy procesando tu duda sobre el Campus...", role: "assistant" };
      setMessages(prev => [...prev, botReply]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-100 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-neutral-900 border border-neutral-800 w-[350px] h-[500px] rounded-4xl mb-4 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-black text-xs uppercase tracking-tighter">Asistente Campus</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded-full p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-neutral-950/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-neutral-800 text-neutral-200 rounded-tl-none"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-neutral-500 animate-pulse">Escribiendo...</div>}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800 bg-neutral-900 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 ring-blue-500 transition-all"
              />
              <button type="submit" className="bg-blue-600 p-2 rounded-xl text-white hover:bg-blue-500 active:scale-95 transition-all">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X color="white" size={28} /> : <MessageCircle color="white" size={28} />}
      </button>
    </div>
  );
};

export default CampusChat;