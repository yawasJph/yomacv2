import { memo, useCallback } from "react";
import { Zap, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { TOAST_STYLE } from "../../utils/yawas/constants";


export const MessageItem = memo(({ message, index }) => {
  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code);
    toast.success("Copiado al portapapeles", {
      ...TOAST_STYLE,
      icon: "🔥",
    });
  }, []);

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
        {/* {message.role === "assistant" && (
          <div className="flex items-center gap-2 mb-1.5 ml-2">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Zap size={12} className="text-black fill-black" />
            </div>
            <span className="text-xs font-medium text-black dark:text-white">
              YAWAS
            </span>
          </div>
        )} */}
        <div
          className={`relative p-4 md:p-5 rounded-4xl shadow-2xl transition-all duration-300 ${
            message.role === "user"
              ? "bg-linear-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none shadow-emerald-500/20"
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
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose prose-sm prose-p:leading-relaxed prose-p:my-2 prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown
              children={message.text}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="relative my-4 rounded-2xl overflow-hidden border border-neutral-800 group dark:border-gray-700 group bg-gray-900">
                      <div className="flex justify-between items-center px-4 py-2 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 dark:bg-gray-800 text-xs dark:text-gray-400">
                        <span className="font-bold text-yellow-500/70 dark:text-yellow-500/90">
                          {match[1]}
                        </span>
                        <button
                          onClick={() => handleCopyCode(String(children).replace(/\n$/, ""))}
                          className="bg-neutral-700 px-2 py-1 rounded-md hover:bg-neutral-600 transition-all duration-300 text-xs font-medium dark:hover:bg-gray-600 text-gray-200 dark:text-gray-300 border border-gray-600 dark:border-gray-600 shadow-sm"
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
                      className="bg-neutral-800 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-xs dark:bg-gray-800"
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
  );
});