export default function BaseModal({ close, children, style }) {
  return (
    <div
      style={style}
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl animate-in zoom-in duration-300"
      >
        {children}
      </div>
    </div>
  );
}
