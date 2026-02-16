import { memo, useCallback } from "react";
import { Zap, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { TOAST_STYLE } from "../../utils/yawas/constants";
import { ChatCodeBlock } from "./ChatCodeBlockv2";
import hljs from "highlight.js";

export const MessageItem = memo(({ message, index }) => {
  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code);
    toast.success("Copiado al portapapeles", {
      ...TOAST_STYLE,
      icon: "🔥",
    });
  }, []);

  console.log("Renderizando MessageItem:", { message, index });
  return (
    <div
      className={`flex w-full animate-in slide-in-from-bottom-2 duration-300 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex flex-col max-w-[85%] ${
          message.role === "user" ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative p-4 md:p-5 rounded-4xl shadow-2xl transition-all duration-300 ${
            message.role === "user"
              ? "bg-linear-to-br from-neutral-600 to-neutral-800 text-white rounded-br-none shadow-neutral-500/20"
              : "bg-neutral-900 border border-neutral-800/80 text-neutral-200 rounded-tl-none shadow-black/40 dark:border-gray-700/50 dark:text-gray-200 rounded-bl-none dark:shadow-gray-900/30"
          }`}
        >
          {message.image_url && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 dark:border-gray-700 shadow-inner group">
              <img
                src={message.image_url}
                alt="Adjunto"
                className="max-h-64 md:max-h-72 w-full object-container transition-transform group-hover:scale-[1.02] duration-500"
              />
            </div>
          )}
          <div className="prose-sm  prose-p:leading-relaxed prose-pre:bg-black/50  prose-p:my-2 prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none prose-invert  prose">
          {/** prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50  prose-p:my-2 prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none prose-invert  prose */}
            <ReactMarkdown
              children={message.text}
              components={{
                code({ inline, className, children }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");

                  if (inline) {
                    return (
                      <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-400 text-xs font-mono">
                        {children}
                      </code>
                    );
                  }

                  return <ChatCodeBlock code={code} language={match?.[1]} />;
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
