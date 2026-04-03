import { useEffect, useRef, useState } from "react";

const ImageUpload = ({ onChange, resetKey }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(null);
    setError("");
  }, [resetKey]);

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Máximo 5MB");
      return;
    }

    setError("");

    const url = URL.createObjectURL(file);
    setPreview(url);

    onChange?.(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 transition"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="mx-auto max-h-60 rounded-xl object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
            >
              Quitar
            </button>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Arrastra una imagen o haz click para subir
          </p>
        )}
      </div>

      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
        accept="image/*"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default ImageUpload;
