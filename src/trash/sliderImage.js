 {/* SLIDER DE IMÁGENES */}
 {images.length > 0 && (
    <div className="mb-3 relative group">
      <div
        ref={scrollContainerRef}
        className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          height: "400px", // ALTURA FIJA PARA EVITAR SALTOS
        }}
      >
        {/* Contenedor interno */}
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            height: "100%",
          }}
        >
          {images.map((img, index) => (
            <div
              key={img.id}
              className="min-w-full h-full flex justify-center items-center bg-black/5 dark:bg-white/5"
            >
              <img
                src={img.image_url}
                alt={`post ${index + 1}`}
                className="max-h-full max-w-full object-contain cursor-pointer"
                draggable="false"
                onClick={() => openModal(index)}
              />
            </div>
          ))}
        </div>

        {/* BOTÓN ANTERIOR */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 text-white dark:text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* BOTÓN SIGUIENTE */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 dark:bg-white/50 hover:bg-black/70 dark:hover:bg-white/70 text-white dark:text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* INDICADORES */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? "w-3 h-3 bg-emerald-600 dark:bg-emerald-400"
                  : "w-2 h-2 bg-gray-400 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )}