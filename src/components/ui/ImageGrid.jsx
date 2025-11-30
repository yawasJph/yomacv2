import { X } from 'lucide-react';
import React from 'react'

const ImageGrid = ({images, isPreview = false, onDelete}) => {
 
    if (images.length === 0) return null;

    const gridClass =
      {
        1: "grid-cols-1",
        2: "grid-cols-2 gap-2",
        3: "grid-cols-2 gap-2",
        4: "grid-cols-2 gap-2",
        5: "grid-cols-3 gap-2",
        6: "grid-cols-3 gap-2",
      }[images.length] || "grid-cols-2 gap-2";
  return (
    <div className={`grid ${gridClass} mt-3 mb-3`}>
        {images.map((preview, index) => (
          <div
            key={index}
            className={`relative ${
              images.length === 3 && index === 0 ? "col-span-1 row-span-2" : ""
            } ${images.length === 4 && index >= 2 ? "col-span-1" : ""}`}
          >
            <img
              src={preview.image_url || preview}
              alt={`Preview ${index + 1}`}
              className={`w-full rounded-lg object-cover ${
                images.length === 1
                  ? "max-h-96"
                  : images.length === 2
                  ? "h-48"
                  : images.length === 3 && index === 0
                  ? "h-full"
                  : "h-40"
              } ${isPreview ? "cursor-default" : "cursor-pointer"}`}
            />
              {!isPreview && (
              <button
               onClick={onDelete(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer transition-all"
                title="quitar imagen"
              >
                <X size={14} />
              </button>
            )}
            
          </div>
        ))}
      </div>
  )
}

export default ImageGrid