import React from 'react'

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition duration-300">
        
    <Header/>

    {/* 🔹 Layout Principal */}
    <div className="pt-16 flex max-w-7xl mx-auto">
      {/* Sidebar Izquierda */}
      <aside className="hidden lg:flex lg:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 p-6">
        
        {/* Botón para descargar APK */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Descarga la app móvil 📱
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Disponible para usuarios Android
          </p>
       
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 min-h-screen px-4 py-6 lg:px-6 max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* Sidebar Derecha */}
      <aside className="hidden xl:flex xl:w-80 flex-col h-[calc(100vh-64px)] sticky top-16 p-6 space-y-6">
        {/* Personas sugeridas */}
       

       
      </aside>
    </div>

    {/* 🔹 Barra inferior móvil mejorada */}
    
    {/* 🔹 Botón de descarga visible solo en móvil */}
  </div>
  )
}

export default HomeLayout