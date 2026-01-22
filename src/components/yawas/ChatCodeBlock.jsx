// src/components/CampusAI/ChatMessage.jsx
import { lazy, Suspense } from "react";

// Carga el componente solo cuando hay código que mostrar
const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  })),
);

export const ChatCodeBlock = ({ code, language, vscDarkPlus , props }) => (
  <Suspense
    fallback={<div className="p-4 bg-black animate-pulse h-20 rounded-xl" />}
  >
    <SyntaxHighlighter
    {...props}
      language={language}
      style={vscDarkPlus}
      PreTag="div"
      customStyle={{
        margin: 0,
        padding: "1.2rem",
        fontSize: "0.8rem",
        backgroundColor: "#050505",
      }}
    >
      {code}
    </SyntaxHighlighter>
  </Suspense>
);
