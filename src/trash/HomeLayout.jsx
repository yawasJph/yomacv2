import React from 'react'

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition duration-300">
    <Header />

    {/* 🔹 Layout Principal */}
    <div className="pt-16 flex max-w-7xl mx-auto">
      {/* Sidebar Izquierda */}

      <LeftSidebar />

      {/* Contenido Principal */}
      <main className="flex-1 min-h-screen px-4 py-6 lg:px-6 max-w-2xl mx-auto bg-white dark:bg-black">
        <Outlet />
      </main>

      {/* Sidebar Derecha */}
      <RigthSidebar />
      
    </div>

    {/* 🔹 Barra inferior móvil mejorada */}

    {/* 🔹 Botón de descarga visible solo en móvil */}
  </div>
  )
}

export default HomeLayout